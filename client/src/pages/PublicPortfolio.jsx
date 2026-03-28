import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Star, MapPin, Github, ExternalLink, Terminal, Code2, FolderGit2, Linkedin, GitFork, Search, Briefcase, GraduationCap, Award, FileText } from 'lucide-react';
import { PORTFOLIO_API_BASE_URL } from '../config/api';

const PREVIEW_I18N = {
    id: {
        loading: 'MEMUAT DATA...',
        loadFailed: 'Gagal memuat portofolio.',
        sessionExpired: 'Sesi preview berakhir. Silakan login ulang dari dashboard.',
        modeBadge: 'Preview Mode',
        modeDescription: 'Ini tampilan draft kamu dan belum dipublikasikan.',
        publishNow: 'Publish Sekarang',
        publishing: 'Publishing...',
        backToDashboard: 'Kembali ke Dashboard',
        noSelectedRepo: 'Belum ada repo terpilih untuk dipublish. Pilih repo dulu di dashboard.',
        noToken: 'Sesi login tidak ditemukan. Silakan login ulang dari dashboard.',
        publishSuccess: 'Draft berhasil dipublish. Portfolio publik sudah aktif.',
        publishFailed: 'Gagal publish dari preview. Coba lagi.',
        openPublicPage: 'Lihat halaman publik',
        draftPreviewLabel: 'Draft Preview',
        publicPortfolioLabel: 'Public Portfolio',
        cvView: 'Lihat CV',
        shareLink: 'Bagikan',
        bioFallback: 'Membangun perangkat lunak yang fungsional dan indah.',
        insightPanel: 'Panel Insight',
        projects: 'Proyek',
        views: 'Views',
        stars: 'Stars',
        forks: 'Forks',
        projectClicks: 'Klik Proyek',
        top: 'Teratas',
        domain: 'Domain',
        projectStory: 'Cerita Proyek',
        highlights: 'Highlight',
        codeFallback: 'Kode',
        clicks: 'Klik',
        demo: 'Demo',
        secretProjectNoDescription: 'Proyek ini belum punya deskripsi. Lihat source code untuk detail lebih lanjut.',
        experienceTitle: 'Pengalaman',
        educationTitle: 'Pendidikan',
        certificationTitle: 'Sertifikasi & Achievement',
        roleFallback: 'Role',
        institutionFallback: 'Institusi',
        certificationFallback: 'Sertifikasi',
        viewCredential: 'Lihat Credential',
        featuredProjects: 'Proyek Pilihan',
        itemsSuffix: 'item',
        searchPlaceholder: 'Cari nama proyek, deskripsi, bahasa, atau topik...',
        allLanguages: 'Semua Bahasa',
        sortStars: 'Urut: Bintang',
        sortUpdated: 'Urut: Terbaru',
        sortName: 'Urut: Nama',
        emptySearchTitle: 'Hasil pencarian kosong',
        emptySearchDescription: 'Tidak ada proyek yang cocok dengan filter saat ini. Coba ganti kata kunci atau urutan.',
        footerText: 'Dirancang & Dikembangkan secara Otomatis',
        quickPreviewTitle: 'Preview Cepat',
        close: 'Tutup',
        projectDescriptionFallback: 'Belum ada deskripsi proyek untuk ditampilkan.',
        openGithub: 'Buka GitHub',
        openDemo: 'Buka Demo',
        openPreviewAria: 'Buka preview proyek'
    },
    en: {
        loading: 'LOADING DATA...',
        loadFailed: 'Failed to load portfolio.',
        sessionExpired: 'Preview session has ended. Please login again from the dashboard.',
        modeBadge: 'Preview Mode',
        modeDescription: 'This is your draft view and it is not published yet.',
        publishNow: 'Publish Now',
        publishing: 'Publishing...',
        backToDashboard: 'Back to Dashboard',
        noSelectedRepo: 'No selected repositories to publish yet. Please select repositories from the dashboard.',
        noToken: 'Login session not found. Please login again from the dashboard.',
        publishSuccess: 'Draft published successfully. Your public portfolio is now live.',
        publishFailed: 'Failed to publish from preview. Please try again.',
        openPublicPage: 'Open public page',
        draftPreviewLabel: 'Draft Preview',
        publicPortfolioLabel: 'Public Portfolio',
        cvView: 'CV View',
        shareLink: 'Share Link',
        bioFallback: 'Building functional and beautiful software.',
        insightPanel: 'Insight Panel',
        projects: 'Projects',
        views: 'Views',
        stars: 'Stars',
        forks: 'Forks',
        projectClicks: 'Project Clicks',
        top: 'Top',
        domain: 'Domain',
        projectStory: 'Project Story',
        highlights: 'Highlights',
        codeFallback: 'Code',
        clicks: 'Clicks',
        demo: 'Demo',
        secretProjectNoDescription: 'This project has no description yet. Open the source code for more details.',
        experienceTitle: 'Experience',
        educationTitle: 'Education',
        certificationTitle: 'Certifications & Achievements',
        roleFallback: 'Role',
        institutionFallback: 'Institution',
        certificationFallback: 'Certification',
        viewCredential: 'View Credential',
        featuredProjects: 'Featured Projects',
        itemsSuffix: 'items',
        searchPlaceholder: 'Search project name, description, language, or topic...',
        allLanguages: 'All Languages',
        sortStars: 'Sort: Stars',
        sortUpdated: 'Sort: Recently Updated',
        sortName: 'Sort: Name',
        emptySearchTitle: 'No search results',
        emptySearchDescription: 'No projects match the current filters. Try different keywords or sorting.',
        footerText: 'Designed & Generated Automatically',
        quickPreviewTitle: 'Quick Preview',
        close: 'Close',
        projectDescriptionFallback: 'No project description available to show.',
        openGithub: 'Open GitHub',
        openDemo: 'Open Demo',
        openPreviewAria: 'Open project preview'
    }
};

const PublicPortfolio = ({ isPreview = false }) => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');
    const [languageFilter, setLanguageFilter] = useState('all');
    const [sortBy, setSortBy] = useState('stars');
    const [tiltEnabled, setTiltEnabled] = useState(false);
    const [focusedRepo, setFocusedRepo] = useState(null);
    const [isPublishingDraft, setIsPublishingDraft] = useState(false);
    const [previewPublishNotice, setPreviewPublishNotice] = useState('');
    const [previewPublishStatus, setPreviewPublishStatus] = useState('idle');
    const modalRef = useRef(null);
    const lastFocusedTriggerRef = useRef(null);

    const locale = useMemo(() => {
        const saved = localStorage.getItem('dashboard_locale');
        return saved === 'en' ? 'en' : 'id';
    }, []);

    const p = PREVIEW_I18N[locale] || PREVIEW_I18N.id;

    useEffect(() => {
        const fetchPublicData = async () => {
            try {
                if (isPreview) {
                    const token = localStorage.getItem('github_token');
                    if (!token) {
                        setError(p.sessionExpired);
                        return;
                    }

                    const response = await axios.get(`${PORTFOLIO_API_BASE_URL}/preview/${username}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setData(response.data);
                    return;
                }

                const response = await axios.get(`${PORTFOLIO_API_BASE_URL}/${username}`);
                setData(response.data);
            } catch (err) {
                setError(err.response?.data?.error || p.loadFailed);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicData();
    }, [username, isPreview, p.sessionExpired]);

    useEffect(() => {
        try {
            const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
            const hasFinePointer = window.matchMedia?.('(pointer: fine)')?.matches;
            setTiltEnabled(Boolean(!prefersReducedMotion && hasFinePointer));
        } catch {
            setTiltEnabled(false);
        }
    }, []);

    const repositories = Array.isArray(data?.repositories) ? data.repositories : [];
    const customization = data?.customization || {};
    const profile = data?.profile || {};

    const techStack = [...new Set(repositories.map((repo) => repo.language).filter(Boolean))];
    const accentColor = customization.accentColor || '#38bdf8';
    const visualTheme = customization.visualTheme || 'glassmorphism';
    const customDomain = customization.customDomain || '';
    const experiences = Array.isArray(customization.experiences) ? customization.experiences : [];
    const educations = Array.isArray(customization.educations) ? customization.educations : [];
    const certifications = Array.isArray(customization.certifications) ? customization.certifications : [];
    const analytics = data?.analytics || { views: 0, projectClicks: [] };

    const themePreset = useMemo(() => {
        if (visualTheme === 'neo-brutalism') {
            return {
                root: 'bg-[#0d1117] text-slate-100',
                panel: 'bg-[#111827] border-2 border-cyan-300 shadow-[8px_8px_0_#22d3ee]',
                card: 'bg-[#0b1220] border-2 border-cyan-300',
                softCard: 'bg-[#0b1220] border-2 border-cyan-300/70',
                button: 'bg-cyan-300 text-slate-950 border-2 border-cyan-200 hover:-translate-y-0.5'
            };
        }

        if (visualTheme === 'terminal-hacker') {
            return {
                root: 'bg-[#020a02] text-[#9dff9d]',
                panel: 'bg-[#051005] border border-[#1f7a1f] shadow-[0_0_20px_rgba(34,197,94,0.15)]',
                card: 'bg-[#041004] border border-[#166534]',
                softCard: 'bg-[#031003] border border-[#166534]/80',
                button: 'bg-[#0c2f0c] text-[#9dff9d] border border-[#1f7a1f] hover:bg-[#114011]'
            };
        }

        return {
            root: 'bg-[#0a0a0a] text-slate-200',
            panel: 'bg-[#111111]/70 border border-slate-800 backdrop-blur-md',
            card: 'bg-[#111111]/80 border border-slate-800 backdrop-blur-md',
            softCard: 'bg-[#0f172a]/55 border border-slate-700/70 backdrop-blur-sm',
            button: 'bg-slate-900/80 text-slate-200 border border-slate-700 hover:bg-slate-800'
        };
    }, [visualTheme]);

    const projectClickMap = useMemo(() => {
        const map = new Map();
        (analytics.projectClicks || []).forEach((item) => {
            if (item.repoId) map.set(item.repoId, item.count || 0);
            else if (item.repoName) map.set(item.repoName, item.count || 0);
        });
        return map;
    }, [analytics.projectClicks]);

    const totalStars = repositories.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    const totalForks = repositories.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
    const totalProjectClicks = (analytics.projectClicks || []).reduce((sum, item) => sum + (item.count || 0), 0);

    const filteredRepositories = [...repositories]
        .filter((repo) => {
            const normalizedQuery = query.trim().toLowerCase();
            const matchQuery = !normalizedQuery
                || repo.name.toLowerCase().includes(normalizedQuery)
                || (repo.description || '').toLowerCase().includes(normalizedQuery)
                || (repo.language || '').toLowerCase().includes(normalizedQuery)
                || (repo.topics || []).some((topic) => topic.toLowerCase().includes(normalizedQuery));

            const matchLanguage = languageFilter === 'all' || repo.language === languageFilter;
            return matchQuery && matchLanguage;
        })
        .sort((a, b) => {
            if (sortBy === 'updated') {
                return new Date(b.updated_at) - new Date(a.updated_at);
            }

            if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            }

            return b.stargazers_count - a.stargazers_count;
        });

    const featuredRepository = filteredRepositories[0] || null;
    const remainingRepositories = filteredRepositories.slice(1);
    const topClickedProject = [...(analytics.projectClicks || [])].sort((a, b) => (b.count || 0) - (a.count || 0))[0] || null;

    useEffect(() => {
        const revealElements = Array.from(document.querySelectorAll('[data-reveal]'));
        if (!revealElements.length) return undefined;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
        );

        revealElements.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, [data, filteredRepositories.length, experiences.length, educations.length, certifications.length]);

    const trackProjectClick = (repo) => {
        if (isPreview) return;

        const payload = JSON.stringify({ repoId: repo.id, repoName: repo.name });
        const endpoint = `${PORTFOLIO_API_BASE_URL}/${data.username}/click`;

        if (navigator.sendBeacon) {
            const blob = new Blob([payload], { type: 'application/json' });
            navigator.sendBeacon(endpoint, blob);
            return;
        }

        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true
        }).catch(() => {
            // Ignore tracking failure to keep primary UX smooth.
        });
    };

    const trackModalEvent = useCallback((repo, action) => {
        if (isPreview) return;
        if (!repo || !action || !data?.username) return;

        const payload = JSON.stringify({
            repoId: repo.id,
            repoName: repo.name,
            action
        });
        const endpoint = `${PORTFOLIO_API_BASE_URL}/${data.username}/modal-event`;

        if (navigator.sendBeacon) {
            const blob = new Blob([payload], { type: 'application/json' });
            navigator.sendBeacon(endpoint, blob);
            return;
        }

        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true
        }).catch(() => {
            // Ignore tracking failure to keep primary UX smooth.
        });
    }, [data?.username, isPreview]);

    const handleCardPointerMove = (event) => {
        if (!tiltEnabled) return;

        const card = event.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const rotateY = ((x / rect.width) - 0.5) * 10;
        const rotateX = (((y / rect.height) - 0.5) * -1) * 10;

        card.style.setProperty('--tilt-x', `${rotateX.toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${rotateY.toFixed(2)}deg`);
        card.style.setProperty('--tilt-lift', '-4px');
        card.style.setProperty('--glare-x', `${((x / rect.width) * 100).toFixed(2)}%`);
        card.style.setProperty('--glare-y', `${((y / rect.height) * 100).toFixed(2)}%`);
        card.style.setProperty('--glare-a', '0.2');
        card.classList.add('tilt-active');
    };

    const handleCardPointerLeave = (event) => {
        const card = event.currentTarget;
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
        card.style.setProperty('--tilt-lift', '0px');
        card.style.setProperty('--glare-a', '0');
        card.classList.remove('tilt-active');
    };

    const closeRepoPreview = useCallback(() => {
        if (focusedRepo) {
            trackModalEvent(focusedRepo, 'close');
        }
        setFocusedRepo(null);

        requestAnimationFrame(() => {
            if (lastFocusedTriggerRef.current instanceof HTMLElement) {
                lastFocusedTriggerRef.current.focus();
            }
        });
    }, [focusedRepo, trackModalEvent]);

    const openRepoPreview = (repo, triggerElement = null) => {
        if (triggerElement instanceof HTMLElement) {
            lastFocusedTriggerRef.current = triggerElement;
        }
        trackModalEvent(repo, 'open');
        setFocusedRepo(repo);
    };

    const openRepoExternal = (repo, url) => {
        trackProjectClick(repo);
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handlePublishFromPreview = async () => {
        if (!isPreview || !data?.profile?.username) return;

        if (!Array.isArray(data.repositories) || data.repositories.length === 0) {
            setPreviewPublishStatus('error');
            setPreviewPublishNotice(p.noSelectedRepo);
            return;
        }

        const token = localStorage.getItem('github_token');
        if (!token) {
            setPreviewPublishStatus('error');
            setPreviewPublishNotice(p.noToken);
            return;
        }

        try {
            setIsPublishingDraft(true);
            setPreviewPublishStatus('idle');
            setPreviewPublishNotice('');

            await axios.post(`${PORTFOLIO_API_BASE_URL}/save`, {
                profile: data.profile,
                repositories: data.repositories,
                theme: data.theme || 'dark',
                customization: data.customization || {}
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPreviewPublishStatus('success');
            setPreviewPublishNotice(p.publishSuccess);
        } catch (publishError) {
            setPreviewPublishStatus('error');
            setPreviewPublishNotice(publishError.response?.data?.error || p.publishFailed);
        } finally {
            setIsPublishingDraft(false);
        }
    };

    useEffect(() => {
        if (!focusedRepo) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const modalElement = modalRef.current;
        if (modalElement) {
            const focusable = modalElement.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable.length > 0) {
                requestAnimationFrame(() => focusable[0].focus());
            } else {
                requestAnimationFrame(() => modalElement.focus());
            }
        }

        const handleModalKeys = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                closeRepoPreview();
                return;
            }

            if (event.key !== 'Tab' || !modalRef.current) return;

            const focusable = Array.from(
                modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
            ).filter((element) => !element.hasAttribute('disabled'));

            if (!focusable.length) {
                event.preventDefault();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement;

            if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }

            if (event.shiftKey && active === first) {
                event.preventDefault();
                last.focus();
            }
        };

        document.addEventListener('keydown', handleModalKeys);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleModalKeys);
        };
    }, [focusedRepo, closeRepoPreview]);

    const renderProjectCard = (repo, isFeatured = false, revealOrder = 0) => (
        <article
            key={repo.id || repo.name}
            role="button"
            tabIndex={0}
            aria-label={`${p.openPreviewAria} ${repo.name}`}
            onClick={(event) => openRepoPreview(repo, event.currentTarget)}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openRepoPreview(repo, event.currentTarget);
                }
            }}
            onMouseMove={handleCardPointerMove}
            onMouseLeave={handleCardPointerLeave}
            data-reveal
            className={`tilt-card scroll-reveal group relative flex flex-col h-full p-5 md:p-6 rounded-2xl transition-all duration-300 overflow-hidden ${themePreset.card} ${isFeatured ? 'md:col-span-2 hover:shadow-2xl' : 'hover:shadow-xl'}`}
            style={{ '--reveal-delay': `${Math.min(revealOrder * 70, 560)}ms` }}
        >
            <div className="absolute inset-x-0 top-0 h-px opacity-70" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}></div>

            <div className="flex justify-between items-start mb-4 relative z-10 gap-3">
                <h3 className={`font-bold text-slate-100 group-hover:text-white transition-colors ${isFeatured ? 'text-2xl' : 'text-xl'} line-clamp-1`}>
                    {repo.name}
                </h3>
                <ExternalLink size={18} className="text-slate-600 group-hover:text-slate-300 transition-colors shrink-0" />
            </div>

            <p className={`text-slate-400 leading-relaxed mb-5 flex-1 relative z-10 ${isFeatured ? 'text-sm line-clamp-4' : 'text-sm line-clamp-3'}`}>
                {repo.description || p.secretProjectNoDescription}
            </p>

            {repo.readme_summary && (
                <div className={`mb-4 rounded-lg px-3 py-2 ${themePreset.softCard}`}>
                    <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">{p.projectStory}</p>
                    <p className="text-xs text-slate-300 line-clamp-2">{repo.readme_summary}</p>
                </div>
            )}

            {repo.contribution_highlights?.length > 0 && (
                <div className="mb-4 space-y-1.5 relative z-10">
                    {repo.contribution_highlights.slice(0, isFeatured ? 3 : 2).map((item) => (
                        <p key={item} className="text-xs text-slate-400">- {item}</p>
                    ))}
                </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-slate-800/80 relative z-10 mt-auto gap-3 flex-wrap">
                <span className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-800/50 px-2.5 py-1 rounded-md">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }}></span>
                    {repo.language || p.codeFallback}
                </span>
                <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                    <span className="flex items-center gap-1"><Star size={15} /> {repo.stargazers_count}</span>
                    <span className="flex items-center gap-1"><GitFork size={15} /> {repo.forks_count || 0}</span>
                    <span className="flex items-center gap-1 text-slate-500">{p.clicks} {projectClickMap.get(repo.id) || projectClickMap.get(repo.name) || 0}</span>
                </div>
            </div>

            {repo.topics?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 relative z-10">
                    {repo.topics.slice(0, isFeatured ? 5 : 3).map((topic) => (
                        <span key={topic} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            #{topic}
                        </span>
                    ))}
                </div>
            )}

            {repo.homepage && (
                <div className="mt-3 text-xs text-slate-500 truncate relative z-10">
                    {p.demo}: {repo.homepage}
                </div>
            )}
        </article>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-medium tracking-widest animate-pulse">{p.loading}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-red-400">
                <Terminal size={48} className="mb-4 opacity-50" />
                <h1 className="text-4xl font-bold mb-2">Error 404</h1>
                <p className="text-lg text-slate-400">{error}</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className={`min-h-screen ${themePreset.root} selection:bg-blue-500/30 overflow-hidden relative soft-grid`} style={{ '--accent-color': accentColor }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] blur-[120px] rounded-full pointer-events-none -z-10" style={{ backgroundColor: `${accentColor}33` }}></div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20 relative z-10">
                <header data-reveal className="scroll-reveal mb-16 md:mb-20 relative" style={{ '--reveal-delay': '20ms' }}>
                    {isPreview ? (
                        <div className="mb-4 rounded-2xl border border-amber-300/50 bg-gradient-to-r from-amber-900/45 via-amber-800/20 to-amber-900/45 px-4 py-3 text-xs text-amber-100 shadow-[0_0_0_1px_rgba(251,191,36,0.16)]">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <span className="inline-flex text-[10px] px-2 py-1 rounded-full border border-amber-300/60 bg-amber-500/20 uppercase tracking-widest font-semibold mb-2">{p.modeBadge}</span>
                                    <p>{p.modeDescription}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={handlePublishFromPreview}
                                        disabled={isPublishingDraft}
                                        className="px-3 py-1.5 rounded-lg border border-emerald-400/60 bg-emerald-500/20 text-emerald-100 hover:text-white hover:border-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isPublishingDraft ? p.publishing : p.publishNow}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/dashboard')}
                                        className="px-3 py-1.5 rounded-lg border border-amber-400/60 text-amber-100 hover:text-white hover:border-amber-300"
                                    >
                                        {p.backToDashboard}
                                    </button>
                                </div>
                            </div>
                            {previewPublishNotice && (
                                <p className="mt-2 text-[11px] text-amber-100/90">
                                    {previewPublishNotice}
                                    {previewPublishStatus === 'success' && data?.username ? (
                                        <Link to={`/p/${data.username}`} className="ml-2 underline decoration-amber-200/80 hover:text-white">
                                            {p.openPublicPage}
                                        </Link>
                                    ) : null}
                                </p>
                            )}
                        </div>
                    ) : null}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                        <div className={`lg:col-span-2 rounded-3xl p-7 md:p-9 ${themePreset.panel} relative overflow-hidden`}>
                            <div className="absolute -right-24 top-6 w-56 h-56 rounded-full blur-3xl opacity-40" style={{ backgroundColor: `${accentColor}55` }} />
                            <div className="absolute -left-24 -bottom-24 w-56 h-56 rounded-full blur-3xl opacity-20" style={{ backgroundColor: `${accentColor}44` }} />

                            <div className="relative z-10">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
                                    <div className="relative group mx-auto sm:mx-0">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-500"></div>
                                        <img
                                            src={data.profile.avatar_url}
                                            alt="Profile"
                                            className="relative w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-slate-800 object-cover"
                                        />
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-1">{isPreview ? p.draftPreviewLabel : p.publicPortfolioLabel}</p>
                                        <h1 className="font-display text-3xl md:text-5xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500">
                                            {data.profile.name || data.username}
                                        </h1>
                                        <h2 className="text-base md:text-xl font-medium tracking-wide" style={{ color: accentColor }}>
                                            {customization.jobTitle || 'Software Developer'}
                                        </h2>
                                    </div>
                                </div>

                                {customization.headline && (
                                    <p className="text-slate-300 text-sm md:text-base max-w-3xl leading-relaxed mb-6 border border-slate-800 rounded-2xl px-5 py-4 bg-[#111111]/60">
                                        {customization.headline}
                                    </p>
                                )}

                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-4">
                                    <a href={`https://github.com/${data.username}`} target="_blank" rel="noreferrer" className={`flex items-center gap-2 font-medium transition-colors px-5 py-2.5 rounded-full ${themePreset.button}`}>
                                        <Github size={17} /> GitHub
                                    </a>

                                    {customization.linkedinUrl && (
                                        <a href={customization.linkedinUrl} target="_blank" rel="noreferrer" className={`flex items-center gap-2 font-medium transition-colors px-5 py-2.5 rounded-full ${themePreset.button}`}>
                                            <Linkedin size={17} /> LinkedIn
                                        </a>
                                    )}

                                    <Link to={`/cv/${data.username}`} className={`flex items-center gap-2 font-medium transition-colors px-5 py-2.5 rounded-full ${themePreset.button}`}>
                                        <FileText size={17} /> {p.cvView}
                                    </Link>

                                    {!isPreview && (
                                        <a href={`${PORTFOLIO_API_BASE_URL}/${data.username}/share`} target="_blank" rel="noreferrer" className={`flex items-center gap-2 font-medium transition-colors px-5 py-2.5 rounded-full ${themePreset.button}`}>
                                            <ExternalLink size={17} /> {p.shareLink}
                                        </a>
                                    )}
                                </div>

                                <p className="text-slate-400 text-sm md:text-lg max-w-2xl leading-relaxed">
                                    {profile.bio || p.bioFallback}
                                </p>

                                {profile.location && (
                                    <div className="mt-4 inline-flex items-center gap-2 text-slate-500 text-sm tracking-wide px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/40">
                                        <MapPin size={15} className="text-slate-400" /> {profile.location}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={`rounded-3xl p-6 ${themePreset.panel}`}>
                            <p className="text-xs uppercase tracking-[0.15em] text-slate-500 mb-4">{p.insightPanel}</p>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className={`rounded-xl p-4 ${themePreset.softCard}`}>
                                    <p className="text-slate-500 text-[11px] uppercase tracking-wider">{p.projects}</p>
                                    <p className="text-2xl font-display text-white">{repositories.length}</p>
                                </div>
                                {!isPreview && (
                                    <div className={`rounded-xl p-4 ${themePreset.softCard}`}>
                                        <p className="text-slate-500 text-[11px] uppercase tracking-wider">{p.views}</p>
                                        <p className="text-2xl font-display text-white">{analytics.views || 0}</p>
                                    </div>
                                )}
                                <div className={`rounded-xl p-4 ${themePreset.softCard}`}>
                                    <p className="text-slate-500 text-[11px] uppercase tracking-wider">{p.stars}</p>
                                    <p className="text-2xl font-display text-white">{totalStars}</p>
                                </div>
                                <div className={`rounded-xl p-4 ${themePreset.softCard}`}>
                                    <p className="text-slate-500 text-[11px] uppercase tracking-wider">{p.forks}</p>
                                    <p className="text-2xl font-display text-white">{totalForks}</p>
                                </div>
                            </div>

                            {!isPreview && (
                                <div className={`rounded-xl p-4 ${themePreset.softCard} mb-3`}>
                                    <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">{p.projectClicks}</p>
                                    <p className="text-lg font-semibold text-slate-200">{totalProjectClicks}</p>
                                    {topClickedProject && (
                                        <p className="text-xs text-slate-400 mt-1">{p.top}: {topClickedProject.repoName || p.projects} ({topClickedProject.count || 0})</p>
                                    )}
                                </div>
                            )}

                            {customDomain && (
                                <a href={`https://${customDomain}`} target="_blank" rel="noreferrer" className={`text-xs inline-flex px-3 py-2 rounded-lg ${themePreset.softCard}`}>
                                    {p.domain}: {customDomain}
                                </a>
                            )}
                        </div>
                    </div>

                    {techStack.length > 0 && (
                        <div className="mt-6 overflow-x-auto">
                            <div className="inline-flex min-w-full md:min-w-0 md:flex-wrap gap-2">
                                {techStack.map((tech) => (
                                    <span key={tech} className="flex items-center gap-1.5 bg-slate-800/50 border border-slate-700/50 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm shadow-sm whitespace-nowrap">
                                        <Code2 size={14} style={{ color: accentColor }} /> {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </header>

                {(experiences.length > 0 || educations.length > 0 || certifications.length > 0) && (
                    <section data-reveal className="scroll-reveal mb-16 space-y-6" style={{ '--reveal-delay': '80ms' }}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {experiences.length > 0 && (
                                <div className={`${themePreset.panel} rounded-2xl p-6`}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Briefcase size={18} style={{ color: accentColor }} />
                                        <h3 className="text-xl font-bold text-white">{p.experienceTitle}</h3>
                                    </div>
                                    <div className="relative pl-5">
                                        <div className="absolute left-2 top-1 bottom-1 w-px bg-slate-700"></div>
                                        <div className="space-y-5">
                                            {experiences.map((experience, index) => (
                                                <article key={`exp-${index}`} className={`relative rounded-xl p-4 ${themePreset.card}`}>
                                                    <span className="absolute -left-[22px] top-5 w-3 h-3 rounded-full border-2 border-slate-900" style={{ backgroundColor: accentColor }}></span>
                                                    <h4 className="text-slate-100 font-semibold">{experience.role || p.roleFallback}</h4>
                                                    <p className="text-sm text-slate-400">{experience.company || '-'}</p>
                                                    {experience.period && <p className="text-xs mt-1" style={{ color: accentColor }}>{experience.period}</p>}
                                                    {experience.summary && <p className="text-sm text-slate-300 mt-3 leading-relaxed">{experience.summary}</p>}
                                                </article>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {educations.length > 0 && (
                                <div className={`${themePreset.panel} rounded-2xl p-6`}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <GraduationCap size={18} style={{ color: accentColor }} />
                                        <h3 className="text-xl font-bold text-white">{p.educationTitle}</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {educations.map((education, index) => (
                                            <article key={`edu-${index}`} className={`rounded-xl p-4 ${themePreset.card}`}>
                                                <h4 className="text-slate-100 font-semibold">{education.school || p.institutionFallback}</h4>
                                                <p className="text-sm text-slate-400">{education.degree || '-'}</p>
                                                {education.period && <p className="text-xs text-slate-500 mt-1">{education.period}</p>}
                                                {education.summary && <p className="text-sm text-slate-300 mt-3 leading-relaxed">{education.summary}</p>}
                                            </article>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {certifications.length > 0 && (
                            <div className={`${themePreset.panel} rounded-2xl p-6`}>
                                <div className="flex items-center gap-2 mb-4">
                                    <Award size={18} style={{ color: accentColor }} />
                                    <h3 className="text-xl font-bold text-white">{p.certificationTitle}</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {certifications.map((certification, index) => (
                                        <article key={`cert-${index}`} className={`rounded-xl p-4 ${themePreset.card}`}>
                                            <h4 className="text-slate-100 font-semibold">{certification.title || p.certificationFallback}</h4>
                                            <p className="text-sm text-slate-400">{certification.issuer || '-'}</p>
                                            {certification.year && <p className="text-xs mt-1" style={{ color: accentColor }}>{certification.year}</p>}
                                            {certification.credentialUrl && (
                                                <a href={certification.credentialUrl} target="_blank" rel="noreferrer" className="text-xs text-slate-300 hover:text-white mt-3 inline-flex">
                                                    {p.viewCredential}
                                                </a>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                <main data-reveal className="scroll-reveal" style={{ '--reveal-delay': '120ms' }}>
                    <div className="flex items-center gap-3 mb-6 md:mb-10">
                        <FolderGit2 size={28} style={{ color: accentColor }} />
                        <h2 className="text-3xl font-bold text-white tracking-tight">{p.featuredProjects}</h2>
                        <span className="text-xs text-slate-400 border border-slate-700 rounded-full px-2 py-1">{filteredRepositories.length} {p.itemsSuffix}</span>
                        <div className="h-px bg-gradient-to-r from-slate-800 to-transparent flex-1 ml-4"></div>
                    </div>

                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 p-3 rounded-2xl ${themePreset.softCard}`}>
                        <div className="md:col-span-2 relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={p.searchPlaceholder}
                                className="w-full bg-[#111111]/70 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500/60"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3">
                            <select
                                value={languageFilter}
                                onChange={(e) => setLanguageFilter(e.target.value)}
                                className="bg-[#111111]/70 border border-slate-800 rounded-xl px-3 py-3 text-sm text-slate-300 outline-none focus:border-cyan-500/60"
                            >
                                <option value="all">{p.allLanguages}</option>
                                {techStack.map((tech) => (
                                    <option key={tech} value={tech}>{tech}</option>
                                ))}
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-[#111111]/70 border border-slate-800 rounded-xl px-3 py-3 text-sm text-slate-300 outline-none focus:border-cyan-500/60"
                            >
                                <option value="stars">{p.sortStars}</option>
                                <option value="updated">{p.sortUpdated}</option>
                                <option value="name">{p.sortName}</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                        {featuredRepository ? renderProjectCard(featuredRepository, true, 0) : null}
                        {remainingRepositories.map((repo, index) => renderProjectCard(repo, false, index + 1))}
                    </div>

                    {filteredRepositories.length === 0 && (
                        <div className={`text-center border rounded-2xl py-10 px-5 mt-6 ${themePreset.softCard}`}>
                            <svg viewBox="0 0 240 120" className="w-full max-w-[260px] mx-auto mb-4" aria-hidden="true">
                                <rect x="16" y="20" width="208" height="82" rx="14" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                                <circle cx="64" cy="54" r="11" fill="currentColor" opacity="0.22" />
                                <rect x="84" y="46" width="100" height="8" rx="4" fill="#334155" />
                                <rect x="84" y="62" width="72" height="7" rx="3.5" fill="#1e293b" />
                                <path d="M184 28 L206 8" stroke="currentColor" opacity="0.45" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="210" cy="6" r="4" fill="currentColor" opacity="0.65" />
                            </svg>
                            <p className="text-base font-semibold text-slate-200 mb-1">{p.emptySearchTitle}</p>
                            <p className="text-sm text-slate-400">{p.emptySearchDescription}</p>
                        </div>
                    )}
                </main>

                <footer className="mt-24 text-center text-slate-600 text-sm border-t border-slate-800 pt-8">
                    <p>{p.footerText}</p>
                </footer>
            </div>

            {focusedRepo && (
                <div
                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-3 sm:p-4 md:p-8 flex items-end md:items-center justify-center modal-shell"
                    onClick={closeRepoPreview}
                >
                    <div
                        ref={modalRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Quick preview ${focusedRepo.name}`}
                        tabIndex={-1}
                        className={`w-full max-w-3xl rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 ${themePreset.panel} border border-slate-700/70 max-h-[88vh] md:max-h-[92vh] overflow-y-auto modal-panel`}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-1">{p.quickPreviewTitle}</p>
                                <h3 className="text-2xl md:text-3xl font-bold text-white">{focusedRepo.name}</h3>
                                <p className="text-sm mt-1" style={{ color: accentColor }}>{focusedRepo.language || p.codeFallback}</p>
                            </div>
                            <button
                                type="button"
                                onClick={closeRepoPreview}
                                className="text-xs px-3.5 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500"
                            >
                                {p.close}
                            </button>
                        </div>

                        <p className="text-slate-300 leading-relaxed mb-4">
                            {focusedRepo.description || p.projectDescriptionFallback}
                        </p>

                        {focusedRepo.readme_summary && (
                            <div className={`rounded-xl p-4 mb-4 ${themePreset.softCard}`}>
                                <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">{p.projectStory}</p>
                                <p className="text-sm text-slate-300">{focusedRepo.readme_summary}</p>
                            </div>
                        )}

                        {focusedRepo.contribution_highlights?.length > 0 && (
                            <div className={`rounded-xl p-4 mb-4 ${themePreset.softCard}`}>
                                <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">{p.highlights}</p>
                                <div className="space-y-1.5">
                                    {focusedRepo.contribution_highlights.map((item) => (
                                        <p key={item} className="text-sm text-slate-300">- {item}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3 mb-5">
                            <span className={`px-3 py-1.5 rounded-lg text-sm ${themePreset.softCard}`}>{p.stars}: {focusedRepo.stargazers_count || 0}</span>
                            <span className={`px-3 py-1.5 rounded-lg text-sm ${themePreset.softCard}`}>{p.forks}: {focusedRepo.forks_count || 0}</span>
                            <span className={`px-3 py-1.5 rounded-lg text-sm ${themePreset.softCard}`}>{p.clicks}: {projectClickMap.get(focusedRepo.id) || projectClickMap.get(focusedRepo.name) || 0}</span>
                        </div>

                        {focusedRepo.topics?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-5">
                                {focusedRepo.topics.map((topic) => (
                                    <span key={topic} className="text-xs px-2.5 py-1 rounded border border-slate-700 text-slate-300 bg-slate-900/60">#{topic}</span>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => openRepoExternal(focusedRepo, focusedRepo.html_url)}
                                className={`inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2.5 rounded-xl font-medium ${themePreset.button}`}
                            >
                                <Github size={16} /> {p.openGithub}
                            </button>
                            {focusedRepo.homepage && (
                                <button
                                    type="button"
                                    onClick={() => openRepoExternal(focusedRepo, focusedRepo.homepage)}
                                    className={`inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2.5 rounded-xl font-medium ${themePreset.button}`}
                                >
                                    <ExternalLink size={16} /> {p.openDemo}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicPortfolio;
