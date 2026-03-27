const axios = require('axios');

const trimUrl = (value = '') => String(value || '').trim().replace(/\/+$/, '');

const getFrontendUrl = () => trimUrl(process.env.FRONTEND_URL) || 'http://localhost:5173';
const getBackendUrl = () => trimUrl(process.env.BACKEND_URL);
const getGithubClientId = () => String(process.env.GITHUB_CLIENT_ID || '').trim();
const getGithubClientSecret = () => String(process.env.GITHUB_CLIENT_SECRET || '').trim();

// Fungsi 1: Mengarahkan user ke halaman login GitHub
const loginWithGithub = (req, res) => {
  const params = new URLSearchParams({
    client_id: getGithubClientId(),
    scope: 'read:user,repo'
  });

  const backendUrl = getBackendUrl();
  if (backendUrl) {
    params.set('redirect_uri', `${backendUrl}/api/auth/github/callback`);
  }

  const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
  res.redirect(githubAuthUrl);
};

// Fungsi 2: Menerima 'code' dari GitHub dan menukarnya dengan Token
const githubCallback = async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ error: "Tidak ada kode otorisasi dari GitHub" });
  }

  try {
    const frontendUrl = getFrontendUrl();

    // Tukar kode dengan access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: getGithubClientId(),
        client_secret: getGithubClientSecret(),
        code: code,
      },
      {
        headers: {
          Accept: 'application/json', // Kita minta balasan dalam format JSON
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Arahkan kembali ke frontend (React) sambil membawa token di URL
    // Nanti React yang akan mengambil token ini dan menyimpannya
    res.redirect(`${frontendUrl}/dashboard?token=${accessToken}`);
    
  } catch (error) {
    console.error("Error saat menukar token:", error.message);
    res.redirect(`${getFrontendUrl()}/login?error=auth_failed`);
  }
};

module.exports = {
  loginWithGithub,
  githubCallback,
};