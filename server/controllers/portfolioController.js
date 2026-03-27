const axios = require('axios');
const dns = require('node:dns').promises;
const Portfolio = require('../models/Portfolio');

const MAX_PUBLIC_REPOS = 12;
const MAX_SAVED_REPOS = 9;
const MAX_DRAFT_SELECTED_REPOS = 9;
const MAX_README_CONCURRENCY = 3;
const README_CACHE_TTL_MS = 1000 * 60 * 60 * 6;

const SUPPORTED_THEMES = ['neo-brutalism', 'glassmorphism', 'terminal-hacker'];
const README_CACHE = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cleanMarkdown = (input = '') => input
  .replace(/```[\s\S]*?```/g, ' ')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
  .replace(/\[[^\]]+\]\([^)]*\)/g, '$1')
  .replace(/^#{1,6}\s*/gm, '')
  .replace(/^>\s?/gm, '')
  .replace(/[*_~]/g, '')
  .replace(/\r/g, '')
  .replace(/\n{2,}/g, '\n')
  .trim();

const summarizeReadme = (readme = '') => {
  const cleaned = cleanMarkdown(readme);
  if (!cleaned) return '';
  return cleaned.slice(0, 220);
};

const extractHighlights = (readme = '', repo = {}) => {
  const cleaned = cleanMarkdown(readme);
  const lines = cleaned.split('\n').map((line) => line.trim()).filter(Boolean);
  const readmeHighlights = lines
    .filter((line) => /^[-*]\s|^\d+\.\s/.test(line) || /(feature|support|integrat|deploy|auth|dashboard|api)/i.test(line))
    .map((line) => line.replace(/^[-*]\s|^\d+\.\s/, '').trim())
    .filter((line) => line.length > 10)
    .slice(0, 2);

  const fallback = [];
  if (repo.language) fallback.push(`Dibangun dengan fokus utama ${repo.language}.`);
  if ((repo.topics || []).length) fallback.push(`Mencakup topik: ${(repo.topics || []).slice(0, 3).join(', ')}.`);
  if (repo.stargazers_count > 0) fallback.push(`Sudah mendapatkan ${repo.stargazers_count} bintang di GitHub.`);
  if (repo.homepage) fallback.push('Menyediakan live demo yang bisa langsung dicoba.');

  return [...readmeHighlights, ...fallback].slice(0, 3);
};

const buildProjectStory = (repo, readmeText) => ({
  readme_summary: summarizeReadme(readmeText),
  contribution_highlights: extractHighlights(readmeText, repo)
});

const escapeXml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const mapWithConcurrency = async (items, limit, mapper) => {
  const results = new Array(items.length);
  let cursor = 0;

  const worker = async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index], index);
    }
  };

  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
};

const githubApiRequest = async ({
  url,
  token,
  accept = 'application/vnd.github+json',
  retries = 2,
  allowNotFound = false
}) => {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: accept
        },
        timeout: 12000
      });
    } catch (error) {
      const response = error.response;

      if (allowNotFound && response?.status === 404) {
        return null;
      }

      const remaining = Number(response?.headers?.['x-ratelimit-remaining'] ?? '1');
      const resetEpoch = Number(response?.headers?.['x-ratelimit-reset'] ?? '0');
      const waitMs = Math.max(0, resetEpoch * 1000 - Date.now() + 500);
      const isRateLimited = response?.status === 403 && remaining === 0;

      if (isRateLimited && attempt < retries && waitMs <= 12000) {
        await sleep(waitMs || 1200);
        continue;
      }

      throw error;
    }
  }

  return null;
};

const fetchRepoReadme = async ({ token, owner, repo }) => {
  const cacheKey = `${owner}/${repo}`;
  const cached = README_CACHE.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < README_CACHE_TTL_MS) {
    return cached.content;
  }

  try {
    const response = await githubApiRequest({
      url: `https://api.github.com/repos/${owner}/${repo}/readme`,
      token,
      accept: 'application/vnd.github.raw+json',
      retries: 1,
      allowNotFound: true
    });

    const content = typeof response?.data === 'string' ? response.data : '';
    README_CACHE.set(cacheKey, { content, timestamp: Date.now() });
    return content;
  } catch (error) {
    if (cached) {
      return cached.content;
    }
    return '';
  }
};

const normalizeRepository = (repo) => ({
  id: repo.id,
  name: repo.name,
  description: repo.description,
  html_url: repo.html_url,
  language: repo.language,
  stargazers_count: repo.stargazers_count,
  forks_count: repo.forks_count,
  homepage: repo.homepage,
  updated_at: repo.updated_at,
  topics: Array.isArray(repo.topics) ? repo.topics.slice(0, 5) : [],
  readme_summary: repo.readme_summary || '',
  contribution_highlights: Array.isArray(repo.contribution_highlights) ? repo.contribution_highlights.slice(0, 3) : []
});

const sanitizeCustomization = (customization = {}) => ({
  jobTitle: customization.jobTitle || '',
  linkedinUrl: customization.linkedinUrl || '',
  headline: customization.headline || '',
  accentColor: customization.accentColor || '#38bdf8',
  visualTheme: SUPPORTED_THEMES.includes(customization.visualTheme) ? customization.visualTheme : 'glassmorphism',
  customDomain: String(customization.customDomain || '').replace(/^https?:\/\//, '').trim(),
  deployProvider: String(customization.deployProvider || '').trim(),
  deployConfig: {
    githubRepo: String(customization.deployConfig?.githubRepo || '').trim(),
    githubBranch: String(customization.deployConfig?.githubBranch || 'main').trim() || 'main',
    vercelProjectId: String(customization.deployConfig?.vercelProjectId || '').trim(),
    vercelTeamId: String(customization.deployConfig?.vercelTeamId || '').trim(),
    vercelDeployHookUrl: String(customization.deployConfig?.vercelDeployHookUrl || '').trim(),
    netlifySiteId: String(customization.deployConfig?.netlifySiteId || '').trim(),
    netlifyBuildHookUrl: String(customization.deployConfig?.netlifyBuildHookUrl || '').trim()
  },
  experiences: Array.isArray(customization.experiences)
    ? customization.experiences
      .map((item = {}) => ({
        role: item.role || '',
        company: item.company || '',
        period: item.period || '',
        summary: item.summary || ''
      }))
      .filter((item) => item.role || item.company || item.period || item.summary)
      .slice(0, 8)
    : [],
  educations: Array.isArray(customization.educations)
    ? customization.educations
      .map((item = {}) => ({
        school: item.school || '',
        degree: item.degree || '',
        period: item.period || '',
        summary: item.summary || ''
      }))
      .filter((item) => item.school || item.degree || item.period || item.summary)
      .slice(0, 8)
    : [],
  certifications: Array.isArray(customization.certifications)
    ? customization.certifications
      .map((item = {}) => ({
        title: item.title || '',
        issuer: item.issuer || '',
        year: item.year || '',
        credentialUrl: item.credentialUrl || ''
      }))
      .filter((item) => item.title || item.issuer || item.year || item.credentialUrl)
      .slice(0, 10)
    : []
});

const sanitizeDraft = (draft = {}) => ({
  selectedRepoIds: Array.isArray(draft.selectedRepoIds)
    ? [...new Set(draft.selectedRepoIds
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0))]
      .slice(0, MAX_DRAFT_SELECTED_REPOS)
    : [],
  customization: sanitizeCustomization(draft.customization || {}),
  updatedAt: draft.updatedAt || new Date()
});

const getGithubData = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token tidak ditemukan, silakan login ulang.' });
  }

  try {
    const userResponse = await githubApiRequest({
      url: 'https://api.github.com/user',
      token,
      retries: 1
    });

    const reposResponse = await githubApiRequest({
      url: 'https://api.github.com/user/repos?sort=updated&per_page=100',
      token,
      retries: 1
    });

    const cleanRepos = (reposResponse?.data || [])
      .filter((repo) => !repo.fork)
      .map(normalizeRepository)
      .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, MAX_PUBLIC_REPOS);

    const owner = userResponse?.data?.login;
    const reposWithStory = await mapWithConcurrency(cleanRepos, MAX_README_CONCURRENCY, async (repo) => {
      const readme = owner ? await fetchRepoReadme({ token, owner, repo: repo.name }) : '';
      return {
        ...repo,
        ...buildProjectStory(repo, readme)
      };
    });

    const existingPortfolio = owner
      ? await Portfolio.findOne({ username: owner }).lean()
      : null;

    const selectedRepoIds = existingPortfolio?.repositories?.length
      ? existingPortfolio.repositories
        .map((savedRepo) => {
          const byId = savedRepo.id
            ? reposWithStory.find((repo) => repo.id === savedRepo.id)
            : null;
          if (byId) return byId.id;

          const byName = savedRepo.name
            ? reposWithStory.find((repo) => repo.name === savedRepo.name)
            : null;
          return byName?.id || null;
        })
        .filter(Boolean)
      : [];

    const safeDraft = existingPortfolio?.draft
      ? sanitizeDraft(existingPortfolio.draft)
      : null;

    return res.json({
      profile: {
        name: userResponse?.data?.name || userResponse?.data?.login,
        username: userResponse?.data?.login,
        avatar_url: userResponse?.data?.avatar_url,
        bio: userResponse?.data?.bio,
        location: userResponse?.data?.location
      },
      repositories: reposWithStory,
      customization: sanitizeCustomization(existingPortfolio?.customization || {}),
      selectedRepoIds,
      hasPublishedPortfolio: Boolean(existingPortfolio),
      draft: safeDraft
    });
  } catch (error) {
    const status = error.response?.status === 403 ? 429 : 500;
    console.error('Gagal mengambil data GitHub:', error.response?.data || error.message);
    return res.status(status).json({
      error: status === 429
        ? 'Rate limit GitHub tercapai. Coba lagi beberapa saat.'
        : 'Gagal mengambil data dari GitHub'
    });
  }
};

const savePortfolio = async (req, res) => {
  const { profile, repositories, theme, customization } = req.body;

  if (!profile?.username) {
    return res.status(400).json({ error: 'Data profil tidak valid.' });
  }

  const safeRepositories = Array.isArray(repositories)
    ? repositories.map(normalizeRepository).slice(0, MAX_SAVED_REPOS)
    : [];

  const safeCustomization = sanitizeCustomization(customization);

  try {
    let existingPortfolio = await Portfolio.findOne({ username: profile.username });

    if (existingPortfolio) {
      existingPortfolio.profile = profile;
      existingPortfolio.repositories = safeRepositories;
      existingPortfolio.theme = theme || existingPortfolio.theme;
      existingPortfolio.customization = safeCustomization;
      existingPortfolio.draft = undefined;

      await existingPortfolio.save();
      return res.status(200).json({
        message: 'Portofolio berhasil diperbarui!',
        url: `${process.env.FRONTEND_URL}/p/${profile.username}`
      });
    }

    const newPortfolio = new Portfolio({
      username: profile.username,
      profile,
      repositories: safeRepositories,
      theme: theme || 'dark',
      customization: safeCustomization,
      draft: undefined
    });

    await newPortfolio.save();
    return res.status(201).json({
      message: 'Portofolio berhasil dipublish!',
      url: `${process.env.FRONTEND_URL}/p/${profile.username}`
    });
  } catch (error) {
    console.error('Gagal menyimpan portofolio:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan server saat menyimpan data.' });
  }
};

const savePortfolioDraft = async (req, res) => {
  try {
    const { username, selectedRepoIds, customization } = req.body || {};

    if (!username) {
      return res.status(400).json({ error: 'username wajib diisi untuk menyimpan draft.' });
    }

    const safeDraft = sanitizeDraft({
      selectedRepoIds,
      customization,
      updatedAt: new Date()
    });

    const existingPortfolio = await Portfolio.findOne({ username });
    if (existingPortfolio) {
      existingPortfolio.draft = safeDraft;
      await existingPortfolio.save();
      return res.json({ success: true, updatedAt: safeDraft.updatedAt });
    }

    const newPortfolio = new Portfolio({
      username,
      draft: safeDraft,
      profile: { name: username, avatar_url: '', bio: '', location: '' },
      repositories: []
    });

    await newPortfolio.save();
    return res.status(201).json({ success: true, updatedAt: safeDraft.updatedAt });
  } catch (error) {
    console.error('Gagal menyimpan draft portofolio:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan server saat menyimpan draft.' });
  }
};

const getPortfolioByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const portfolio = await Portfolio.findOneAndUpdate(
      { username },
      { $inc: { 'analytics.views': 1 } },
      { new: true }
    );

    if (!portfolio) {
      return res.status(404).json({ error: 'Portofolio tidak ditemukan.' });
    }

    return res.json(portfolio);
  } catch (error) {
    console.error('Gagal mengambil portofolio publik:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
};

const trackProjectClick = async (req, res) => {
  try {
    const { username } = req.params;
    const { repoId, repoName } = req.body || {};

    if (!repoId && !repoName) {
      return res.status(400).json({ error: 'repoId atau repoName wajib diisi.' });
    }

    const portfolio = await Portfolio.findOne({ username });
    if (!portfolio) {
      return res.status(404).json({ error: 'Portofolio tidak ditemukan.' });
    }

    if (!portfolio.analytics) {
      portfolio.analytics = { views: 0, projectClicks: [] };
    }

    const clickIndex = (portfolio.analytics.projectClicks || []).findIndex((item) =>
      (repoId && item.repoId === repoId) || (repoName && item.repoName === repoName)
    );

    if (clickIndex >= 0) {
      portfolio.analytics.projectClicks[clickIndex].count += 1;
      portfolio.analytics.projectClicks[clickIndex].lastClickedAt = new Date();
    } else {
      portfolio.analytics.projectClicks.push({
        repoId: repoId || 0,
        repoName: repoName || 'Unknown Repo',
        count: 1,
        lastClickedAt: new Date()
      });
    }

    await portfolio.save();
    return res.json({ success: true });
  } catch (error) {
    console.error('Gagal melacak klik project:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
};

const trackModalEvent = async (req, res) => {
  try {
    const { username } = req.params;
    const { repoId, repoName, action } = req.body || {};

    if (!repoId && !repoName) {
      return res.status(400).json({ error: 'repoId atau repoName wajib diisi.' });
    }

    if (!['open', 'close'].includes(action)) {
      return res.status(400).json({ error: 'action wajib bernilai open atau close.' });
    }

    const portfolio = await Portfolio.findOne({ username });
    if (!portfolio) {
      return res.status(404).json({ error: 'Portofolio tidak ditemukan.' });
    }

    if (!portfolio.analytics) {
      portfolio.analytics = { views: 0, projectClicks: [], modalEvents: [] };
    }

    if (!Array.isArray(portfolio.analytics.modalEvents)) {
      portfolio.analytics.modalEvents = [];
    }

    const eventIndex = portfolio.analytics.modalEvents.findIndex((item) =>
      item.action === action && ((repoId && item.repoId === repoId) || (repoName && item.repoName === repoName))
    );

    if (eventIndex >= 0) {
      portfolio.analytics.modalEvents[eventIndex].count += 1;
      portfolio.analytics.modalEvents[eventIndex].lastEventAt = new Date();
    } else {
      portfolio.analytics.modalEvents.push({
        repoId: repoId || 0,
        repoName: repoName || 'Unknown Repo',
        action,
        count: 1,
        lastEventAt: new Date()
      });
    }

    await portfolio.save();
    return res.json({ success: true });
  } catch (error) {
    console.error('Gagal melacak modal event:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
};

const getPortfolioAnalytics = async (req, res) => {
  try {
    const { username } = req.params;
    const portfolio = await Portfolio.findOne({ username });

    if (!portfolio) {
      return res.status(404).json({ error: 'Portofolio tidak ditemukan.' });
    }

    return res.json({
      username,
      analytics: portfolio.analytics || { views: 0, projectClicks: [] }
    });
  } catch (error) {
    console.error('Gagal mengambil analytics:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
};

const getDomainStatus = async (req, res) => {
  try {
    const { username } = req.params;
    const portfolio = await Portfolio.findOne({ username });

    if (!portfolio) {
      return res.status(404).json({ error: 'Portofolio tidak ditemukan.' });
    }

    const domain = portfolio.customization?.customDomain;
    if (!domain) {
      return res.json({ status: 'none', message: 'Custom domain belum diatur.' });
    }

    const normalizedDomain = String(domain).replace(/^https?:\/\//, '').trim();
    let cnameRecords = [];
    let aRecords = [];

    try {
      cnameRecords = await dns.resolveCname(normalizedDomain);
    } catch (error) {
      if (error.code !== 'ENODATA' && error.code !== 'ENOTFOUND' && error.code !== 'ENODOMAIN') {
        throw error;
      }
    }

    try {
      aRecords = await dns.resolve4(normalizedDomain);
    } catch (error) {
      if (error.code !== 'ENODATA' && error.code !== 'ENOTFOUND' && error.code !== 'ENODOMAIN') {
        throw error;
      }
    }

    const cnameValue = cnameRecords[0] || '';
    const connected = /vercel\.dns\.com|vercel\.app|netlify\.app/i.test(cnameValue);

    if (connected) {
      return res.json({
        status: 'connected',
        message: `Domain terhubung melalui CNAME ${cnameValue}.`,
        records: { cname: cnameRecords, a: aRecords }
      });
    }

    if (cnameRecords.length || aRecords.length) {
      return res.json({
        status: 'pending',
        message: 'Record DNS terdeteksi, namun belum cocok dengan target deploy provider.',
        records: { cname: cnameRecords, a: aRecords }
      });
    }

    return res.json({
      status: 'error',
      message: 'Record DNS belum ditemukan untuk domain ini.',
      records: { cname: [], a: [] }
    });
  } catch (error) {
    console.error('Gagal validasi DNS:', error);
    return res.status(500).json({ status: 'error', message: 'Gagal memeriksa DNS domain.' });
  }
};

const triggerDeploy = async (req, res) => {
  try {
    const { username } = req.params;
    const { provider, token } = req.body || {};

    const portfolio = await Portfolio.findOne({ username });
    if (!portfolio) {
      return res.status(404).json({ error: 'Portofolio tidak ditemukan.' });
    }

    const selectedProvider = provider || portfolio.customization?.deployProvider;
    const deployConfig = portfolio.customization?.deployConfig || {};

    if (!selectedProvider) {
      return res.status(400).json({ error: 'Provider deploy belum dipilih.' });
    }

    if (selectedProvider === 'netlify') {
      if (deployConfig.netlifyBuildHookUrl) {
        await axios.post(deployConfig.netlifyBuildHookUrl);
        return res.json({ success: true, provider: 'netlify', message: 'Deploy Netlify dipicu melalui build hook.' });
      }

      if (!token || !deployConfig.netlifySiteId) {
        return res.status(400).json({ error: 'Butuh Netlify token dan netlifySiteId atau build hook URL.' });
      }

      const response = await axios.post(
        `https://api.netlify.com/api/v1/sites/${deployConfig.netlifySiteId}/builds`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return res.json({
        success: true,
        provider: 'netlify',
        message: 'Deploy Netlify berhasil dipicu.',
        deployId: response.data?.id || null
      });
    }

    if (selectedProvider === 'vercel') {
      if (deployConfig.vercelDeployHookUrl) {
        await axios.post(deployConfig.vercelDeployHookUrl);
        return res.json({ success: true, provider: 'vercel', message: 'Deploy Vercel dipicu melalui deploy hook.' });
      }

      if (!token) {
        return res.status(400).json({ error: 'Butuh Vercel token atau deploy hook URL.' });
      }

      const query = deployConfig.vercelTeamId
        ? `?teamId=${encodeURIComponent(deployConfig.vercelTeamId)}`
        : '';

      const body = {
        name: `${username}-portfolio`,
        target: 'production'
      };

      if (deployConfig.vercelProjectId) {
        body.project = deployConfig.vercelProjectId;
      }

      if (deployConfig.githubRepo) {
        body.gitSource = {
          type: 'github',
          repo: deployConfig.githubRepo,
          ref: deployConfig.githubBranch || 'main'
        };
      }

      const response = await axios.post(
        `https://api.vercel.com/v13/deployments${query}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return res.json({
        success: true,
        provider: 'vercel',
        message: 'Deploy Vercel berhasil dipicu.',
        deployUrl: response.data?.url || null,
        deployId: response.data?.id || null
      });
    }

    return res.status(400).json({ error: 'Provider deploy tidak didukung.' });
  } catch (error) {
    console.error('Gagal trigger deploy:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Gagal memicu deploy otomatis.',
      details: error.response?.data?.error?.message || error.response?.data || error.message
    });
  }
};

const getPortfolioOgImage = async (req, res) => {
  try {
    const { username } = req.params;
    const portfolio = await Portfolio.findOne({ username });

    if (!portfolio) {
      return res.status(404).send('Portfolio not found');
    }

    const accent = portfolio.customization?.accentColor || '#38bdf8';
    const title = portfolio.profile?.name || portfolio.username;
    const role = portfolio.customization?.jobTitle || 'Software Developer';
    const summary = (portfolio.customization?.headline || portfolio.profile?.bio || 'Building impactful software products.').slice(0, 130);
    const stack = [...new Set((portfolio.repositories || []).map((repo) => repo.language).filter(Boolean))].slice(0, 4).join(' • ');

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#020617" />
      <stop offset="100%" stop-color="#111827" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="990" cy="120" r="180" fill="${accent}" opacity="0.3"/>
  <circle cx="190" cy="560" r="220" fill="${accent}" opacity="0.12"/>
  <text x="80" y="160" fill="#e2e8f0" font-family="Segoe UI, Arial, sans-serif" font-size="56" font-weight="700">${escapeXml(title)}</text>
  <text x="80" y="220" fill="${accent}" font-family="Segoe UI, Arial, sans-serif" font-size="32" font-weight="600">${escapeXml(role)}</text>
  <text x="80" y="300" fill="#cbd5e1" font-family="Segoe UI, Arial, sans-serif" font-size="24">${escapeXml(summary)}</text>
  <rect x="80" y="462" rx="18" ry="18" width="1040" height="92" fill="#0b1220" stroke="#334155" stroke-width="2"/>
  <text x="112" y="518" fill="#94a3b8" font-family="Segoe UI, Arial, sans-serif" font-size="24">${escapeXml(stack || 'Web Development • API Integration')}</text>
  <text x="80" y="590" fill="#64748b" font-family="Segoe UI, Arial, sans-serif" font-size="20">github.com/${escapeXml(portfolio.username)}</text>
</svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(svg);
  } catch (error) {
    console.error('Gagal membuat OG image:', error);
    return res.status(500).send('Failed to generate OG image');
  }
};

const getShareMetadata = async (req, res) => {
  try {
    const { username } = req.params;
    const portfolio = await Portfolio.findOne({ username });
    if (!portfolio) {
      return res.status(404).send('Portfolio not found');
    }

    const backendBase = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
    const shareUrl = `${frontendBase}/p/${username}`;
    const ogUrl = `${backendBase}/api/portfolio/${username}/og.svg`;

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeXml(portfolio.profile?.name || username)} Portfolio</title>
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeXml((portfolio.profile?.name || username) + ' - Portfolio')}" />
  <meta property="og:description" content="${escapeXml(portfolio.customization?.headline || portfolio.profile?.bio || 'Portfolio generated with GitHub data.')}" />
  <meta property="og:image" content="${ogUrl}" />
  <meta property="og:url" content="${shareUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeXml((portfolio.profile?.name || username) + ' - Portfolio')}" />
  <meta name="twitter:description" content="${escapeXml(portfolio.customization?.headline || portfolio.profile?.bio || 'Portfolio generated with GitHub data.')}" />
  <meta name="twitter:image" content="${ogUrl}" />
  <meta http-equiv="refresh" content="0; url=${shareUrl}" />
</head>
<body>
  Redirecting...
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  } catch (error) {
    console.error('Gagal membuat share metadata:', error);
    return res.status(500).send('Failed to generate share metadata');
  }
};

module.exports = {
  getGithubData,
  savePortfolioDraft,
  savePortfolio,
  getPortfolioByUsername,
  trackProjectClick,
  trackModalEvent,
  getPortfolioAnalytics,
  getDomainStatus,
  triggerDeploy,
  getPortfolioOgImage,
  getShareMetadata
};
