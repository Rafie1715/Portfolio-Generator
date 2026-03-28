import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut, Star, Code2, Rocket, LayoutDashboard, Terminal, Linkedin, Sparkles, GitFork, Search, Briefcase, GraduationCap, Plus, Trash2, Award, WandSparkles, CheckCircle2, Circle } from 'lucide-react';
import { PORTFOLIO_API_BASE_URL } from '../config/api';

const MAX_SELECTED_REPOS = 9;
const VISUAL_THEMES = [
    { value: 'neo-brutalism', label: 'Neo Brutalism' },
    { value: 'glassmorphism', label: 'Glassmorphism' },
    { value: 'terminal-hacker', label: 'Terminal Hacker' }
];
const DASHBOARD_LAYOUT_MODES = [
    { value: 'minimal', label: 'Minimal' },
    { value: 'cinematic', label: 'Cinematic' }
];
const DASHBOARD_LOCALES = [
    { value: 'id', label: 'ID' },
    { value: 'en', label: 'EN' }
];
const STYLE_PRESETS = [
    {
        key: 'corporate',
        label: 'Corporate',
        accentColor: '#22d3ee',
        visualTheme: 'glassmorphism',
        layoutMode: 'minimal'
    },
    {
        key: 'creative',
        label: 'Creative',
        accentColor: '#f97316',
        visualTheme: 'neo-brutalism',
        layoutMode: 'cinematic'
    },
    {
        key: 'futuristic',
        label: 'Futuristic',
        accentColor: '#a78bfa',
        visualTheme: 'terminal-hacker',
        layoutMode: 'cinematic'
    }
];
const I18N = {
    id: {
        dashboardSetup: 'Dashboard Setup',
        logout: 'Logout',
        sessionEnded: 'Sesi kamu telah berakhir atau belum login.',
        backToLogin: 'Kembali ke Login',
        syncingGithub: 'Menyinkronkan data dari GitHub...',
        controlRoom: 'Portfolio Control Room',
        heroTitle: 'Bikin portofolio yang bukan cuma rapi, tapi juga punya karakter.',
        heroSubtitle: 'Kurasi project, atur narasi profesional, lalu publish ke halaman publikmu. Semua dari satu dashboard.',
        viewMode: 'Mode Tampilan:',
        setupProgress: 'Setup Progress',
        stageFilled: 'tahap setup sudah terisi.',
        publishNow: 'Publish Sekarang',
        previewDraft: 'Preview Draft',
        previewDraftHint: 'Lihat tampilan draft sebelum publish',
        soundCue: 'Sound Cue',
        particleFx: 'Particle FX',
        celebration: 'Celebration',
        fxLiteInfo: 'Lite mode: visual FX disederhanakan untuk performa.',
        stylePacks: 'Style Pack 1-Click',
        stylePacksSubtitle: 'Pilih mood visual instan untuk dashboard dan halaman publik.',
        apply: 'Apply',
        onboardingTitle: 'Onboarding Checklist',
        onboardingSubtitle: 'Checklist ini membantu memastikan portofoliomu siap tampil profesional.',
        done: 'selesai',
        livePreviewTitle: 'Live Public Preview',
        livePreviewSubtitle: 'Snapshot real-time dari data yang sedang kamu atur.',
        writeHeadlineHint: 'Tulis headline personalmu untuk menampilkan value proposition yang kuat di halaman publik.',
        selectedRepoHint: 'Pilih repo untuk menampilkan tech stack.',
        highlightedProject: 'Highlighted Project',
        noRepoSelected: 'Belum ada repo dipilih',
        noRepoDesc: 'Deskripsi repo akan tampil di sini saat kamu memilih project.',
        repoEmptyTitle: 'Tidak ada repositori yang cocok',
        repoEmptyDesc: 'Coba ubah kata kunci pencarian atau filter urutan supaya hasilnya muncul lagi.',
        readyToPublish: 'Ready to Publish',
        selectedRepoCount: 'repo dipilih',
        setupDone: 'Setup',
        publishPortfolio: 'Publish Portofolio',
        checklistRepos: 'Pilih minimal 1 repositori',
        checklistJob: 'Isi posisi atau keahlian utama',
        checklistHeadline: 'Tulis headline personal',
        checklistDomain: 'Set custom domain (opsional)',
        checklistExp: 'Tambah pengalaman kerja',
        checklistEdu: 'Tambah riwayat pendidikan',
        checklistCert: 'Tambah sertifikasi/achievement',
        profileData: 'Data Profil',
        careerCustomization: 'Kustomisasi Karir',
        primaryRole: 'Posisi / Keahlian Utama',
        primaryRolePlaceholder: 'Contoh: Web & Mobile Developer',
        linkedinLabel: 'URL LinkedIn',
        shortHeadline: 'Headline Singkat',
        autoFromGithub: 'Auto dari GitHub',
        headlinePlaceholder: 'Contoh: Saya suka membangun produk yang cepat, bersih, dan berdampak.',
        accentColor: 'Warna Aksen',
        publicVisualTheme: 'Tema Visual Publik',
        customDomainOptional: 'Custom Domain (Opsional)',
        customDomainPlaceholder: 'portfolio.namadomain.com',
        experience: 'Pengalaman',
        education: 'Pendidikan',
        certification: 'Sertifikasi / Achievement',
        add: 'Tambah',
        delete: 'Hapus',
        expRolePlaceholder: 'Role / Posisi',
        expCompanyPlaceholder: 'Perusahaan',
        expPeriodPlaceholder: 'Periode (mis. 2023 - Sekarang)',
        expSummaryPlaceholder: 'Highlight pekerjaan / pencapaian',
        eduSchoolPlaceholder: 'Nama institusi',
        eduDegreePlaceholder: 'Jurusan / Gelar',
        eduPeriodPlaceholder: 'Periode (mis. 2020 - 2024)',
        eduSummaryPlaceholder: 'Fokus studi / aktivitas penting',
        certTitlePlaceholder: 'Nama sertifikasi / achievement',
        certIssuerPlaceholder: 'Penerbit / Organisasi',
        certYearPlaceholder: 'Tahun',
        certUrlPlaceholder: 'URL credential (opsional)',
        chooseRepositories: 'Pilih Repositori',
        searchRepoPlaceholder: 'Cari repo, bahasa, atau topik...',
        sortStars: 'Urutkan: Bintang',
        sortUpdated: 'Urutkan: Terbaru Update',
        sortName: 'Urutkan: Nama',
        selected: 'Dipilih',
        choose: 'Pilih',
        noDescription: 'Tidak ada deskripsi.',
        codeFallback: 'Code',
        publishRequireRepo: 'Pilih minimal 1 repositori untuk dipublish.',
        publishRedirectNote: 'Kamu akan diarahkan ke halaman publikmu!',
        publishFailed: 'Gagal mem-publish portofolio.',
        maxRepoReached: 'Maksimal {count} repositori.',
        generatedHeadlineTemplate: '{name} adalah {role} yang fokus membangun produk web berkualitas. Terbiasa bekerja dengan {stack} serta mengembangkan {count} proyek pilihan yang siap digunakan.',
        localDraftRecovered: 'Draft lokal ditemukan dan berhasil dipulihkan.',
        serverDraftRecovered: 'Draft cloud ditemukan dan berhasil dipulihkan.',
        draftSyncFailed: 'Gagal sinkronisasi draft ke server.',
        draftSyncTitle: 'Status Sync Draft',
        draftSyncIdle: 'Belum ada perubahan',
        draftSyncSaving: 'Menyimpan perubahan...',
        draftSyncSynced: 'Sinkron ke cloud',
        draftSyncError: 'Gagal sinkron',
        draftSyncNever: 'Belum pernah sinkron',
        draftSyncJustNow: 'baru saja'
    },
    en: {
        dashboardSetup: 'Dashboard Setup',
        logout: 'Logout',
        sessionEnded: 'Your session has ended or you are not logged in yet.',
        backToLogin: 'Back to Login',
        syncingGithub: 'Syncing data from GitHub...',
        controlRoom: 'Portfolio Control Room',
        heroTitle: 'Build a portfolio that is not only clean, but full of personality.',
        heroSubtitle: 'Curate projects, shape your professional story, then publish it to your public page.',
        viewMode: 'View Mode:',
        setupProgress: 'Setup Progress',
        stageFilled: 'setup steps completed.',
        publishNow: 'Publish Now',
        previewDraft: 'Preview Draft',
        previewDraftHint: 'See draft appearance before publishing',
        soundCue: 'Sound Cue',
        particleFx: 'Particle FX',
        celebration: 'Celebration',
        fxLiteInfo: 'Lite mode: visual FX simplified for performance.',
        stylePacks: '1-Click Style Pack',
        stylePacksSubtitle: 'Pick an instant visual mood for dashboard and public page.',
        apply: 'Apply',
        onboardingTitle: 'Onboarding Checklist',
        onboardingSubtitle: 'This checklist helps ensure your portfolio is ready to look professional.',
        done: 'done',
        livePreviewTitle: 'Live Public Preview',
        livePreviewSubtitle: 'A real-time snapshot of the data you are currently editing.',
        writeHeadlineHint: 'Write your personal headline to highlight a strong value proposition on your public page.',
        selectedRepoHint: 'Select repositories to display your tech stack.',
        highlightedProject: 'Highlighted Project',
        noRepoSelected: 'No repository selected yet',
        noRepoDesc: 'Repository description will appear here once you pick a project.',
        repoEmptyTitle: 'No repositories matched',
        repoEmptyDesc: 'Try changing your search query or sorting filter to bring results back.',
        readyToPublish: 'Ready to Publish',
        selectedRepoCount: 'repos selected',
        setupDone: 'Setup',
        publishPortfolio: 'Publish Portfolio',
        checklistRepos: 'Pick at least 1 repository',
        checklistJob: 'Fill in your role or primary skill',
        checklistHeadline: 'Write a personal headline',
        checklistDomain: 'Set custom domain (optional)',
        checklistExp: 'Add work experience',
        checklistEdu: 'Add education history',
        checklistCert: 'Add certifications/achievements',
        profileData: 'Profile Data',
        careerCustomization: 'Career Customization',
        primaryRole: 'Primary Role / Core Skill',
        primaryRolePlaceholder: 'Example: Web & Mobile Developer',
        linkedinLabel: 'LinkedIn URL',
        shortHeadline: 'Short Headline',
        autoFromGithub: 'Auto from GitHub',
        headlinePlaceholder: 'Example: I love building fast, clean, and impactful products.',
        accentColor: 'Accent Color',
        publicVisualTheme: 'Public Visual Theme',
        customDomainOptional: 'Custom Domain (Optional)',
        customDomainPlaceholder: 'portfolio.yourdomain.com',
        experience: 'Experience',
        education: 'Education',
        certification: 'Certification / Achievement',
        add: 'Add',
        delete: 'Delete',
        expRolePlaceholder: 'Role / Position',
        expCompanyPlaceholder: 'Company',
        expPeriodPlaceholder: 'Period (e.g. 2023 - Present)',
        expSummaryPlaceholder: 'Key responsibilities / achievements',
        eduSchoolPlaceholder: 'Institution name',
        eduDegreePlaceholder: 'Major / Degree',
        eduPeriodPlaceholder: 'Period (e.g. 2020 - 2024)',
        eduSummaryPlaceholder: 'Study focus / important activities',
        certTitlePlaceholder: 'Certification / achievement name',
        certIssuerPlaceholder: 'Issuer / Organization',
        certYearPlaceholder: 'Year',
        certUrlPlaceholder: 'Credential URL (optional)',
        chooseRepositories: 'Choose Repositories',
        searchRepoPlaceholder: 'Search repos, language, or topic...',
        sortStars: 'Sort: Stars',
        sortUpdated: 'Sort: Recently Updated',
        sortName: 'Sort: Name',
        selected: 'Selected',
        choose: 'Choose',
        noDescription: 'No description available.',
        codeFallback: 'Code',
        publishRequireRepo: 'Please select at least 1 repository before publishing.',
        publishRedirectNote: 'You will be redirected to your public page!',
        publishFailed: 'Failed to publish portfolio.',
        maxRepoReached: 'Maximum {count} repositories.',
        generatedHeadlineTemplate: '{name} is a {role} focused on building high-quality web products. Comfortable working with {stack} and delivering {count} selected projects ready to use.',
        localDraftRecovered: 'Local draft found and restored successfully.',
        serverDraftRecovered: 'Cloud draft found and restored successfully.',
        draftSyncFailed: 'Failed to sync draft to server.',
        draftSyncTitle: 'Draft Sync Status',
        draftSyncIdle: 'No recent changes',
        draftSyncSaving: 'Saving changes...',
        draftSyncSynced: 'Synced to cloud',
        draftSyncError: 'Sync failed',
        draftSyncNever: 'Never synced',
        draftSyncJustNow: 'just now'
    }
};
const EMPTY_EXPERIENCE = { role: '', company: '', period: '', summary: '' };
const EMPTY_EDUCATION = { school: '', degree: '', period: '', summary: '' };
const EMPTY_CERTIFICATION = { title: '', issuer: '', year: '', credentialUrl: '' };
const API_BASE_URL = PORTFOLIO_API_BASE_URL;
const DASHBOARD_DRAFT_PREFIX = 'portfolio_dashboard_draft_';

const formatDraftSyncRelativeTime = (timestamp, locale, t) => {
    if (!timestamp) return t.draftSyncNever;

    const timestampMs = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
    if (!Number.isFinite(timestampMs)) return t.draftSyncNever;

    const diffSeconds = Math.max(0, Math.floor((Date.now() - timestampMs) / 1000));
    if (diffSeconds < 10) return t.draftSyncJustNow;

    const rtf = new Intl.RelativeTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', { numeric: 'auto' });

    if (diffSeconds < 3600) {
        return rtf.format(-Math.max(1, Math.floor(diffSeconds / 60)), 'minute');
    }

    if (diffSeconds < 86400) {
        return rtf.format(-Math.floor(diffSeconds / 3600), 'hour');
    }

    return rtf.format(-Math.floor(diffSeconds / 86400), 'day');
};

const Dashboard = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [token, setToken] = useState(localStorage.getItem('github_token'));
    const [portfolioData, setPortfolioData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [jobTitle, setJobTitle] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [headline, setHeadline] = useState('');
    const [accentColor, setAccentColor] = useState('#38bdf8');
    const [visualTheme, setVisualTheme] = useState('glassmorphism');
    const [customDomain, setCustomDomain] = useState('');
    const [repoQuery, setRepoQuery] = useState('');
    const [sortBy, setSortBy] = useState('stars');
    const [selectedRepoIds, setSelectedRepoIds] = useState([]);
    const [experiences, setExperiences] = useState([{ ...EMPTY_EXPERIENCE }]);
    const [educations, setEducations] = useState([{ ...EMPTY_EDUCATION }]);
    const [certifications, setCertifications] = useState([{ ...EMPTY_CERTIFICATION }]);
    const [layoutMode, setLayoutMode] = useState(localStorage.getItem('dashboard_layout_mode') || 'cinematic');
    const [locale, setLocale] = useState(localStorage.getItem('dashboard_locale') || 'id');
    const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem('dashboard_sound_enabled') !== '0');
    const [lowSpecMode, setLowSpecMode] = useState(false);
    const [particleFxEnabled, setParticleFxEnabled] = useState(localStorage.getItem('dashboard_particle_fx') !== '0');
    const [celebrationEnabled, setCelebrationEnabled] = useState(localStorage.getItem('dashboard_celebration_enabled') !== '0');
    const [confettiBursts, setConfettiBursts] = useState([]);
    const [draftRecoveredFrom, setDraftRecoveredFrom] = useState(null);
    const [draftSyncStatus, setDraftSyncStatus] = useState('idle');
    const [lastDraftSyncedAt, setLastDraftSyncedAt] = useState(null);
    const [draftSyncTick, setDraftSyncTick] = useState(0);
    const draftHydratedRef = useRef(false);
    const draftSyncFailedMessage = (I18N[locale] || I18N.id).draftSyncFailed;

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            localStorage.setItem('github_token', tokenFromUrl);
            setToken(tokenFromUrl);
            navigate('/dashboard', { replace: true });
        }
    }, [searchParams, navigate]);

    useEffect(() => {
        localStorage.setItem('dashboard_layout_mode', layoutMode);
    }, [layoutMode]);

    useEffect(() => {
        localStorage.setItem('dashboard_locale', locale);
    }, [locale]);

    useEffect(() => {
        localStorage.setItem('dashboard_sound_enabled', soundEnabled ? '1' : '0');
    }, [soundEnabled]);

    useEffect(() => {
        try {
            const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
            const lowThreads = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
            const lowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;
            const likelyLowSpec = Boolean(prefersReducedMotion || lowThreads || lowMemory);
            setLowSpecMode(likelyLowSpec);
            if (likelyLowSpec) {
                setParticleFxEnabled(false);
            }
        } catch (error) {
            console.warn('Gagal mendeteksi spesifikasi device:', error);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('dashboard_particle_fx', particleFxEnabled ? '1' : '0');
    }, [particleFxEnabled]);

    useEffect(() => {
        localStorage.setItem('dashboard_celebration_enabled', celebrationEnabled ? '1' : '0');
    }, [celebrationEnabled]);

    useEffect(() => {
        const fetchPortfolioData = async () => {
            if (!token) return;
            setLoading(true);
            try {
                // PERHATIKAN: Ini harus GET dan mengarah ke /api/portfolio/data
                const response = await axios.get(`${API_BASE_URL}/data`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPortfolioData(response.data);
                const username = response.data.profile?.username || '';
                const draftKey = `${DASHBOARD_DRAFT_PREFIX}${username}`;

                let localDraft = null;
                try {
                    const rawDraft = localStorage.getItem(draftKey);
                    localDraft = rawDraft ? JSON.parse(rawDraft) : null;
                } catch (draftError) {
                    console.warn('Gagal membaca draft dashboard lokal:', draftError);
                }

                const savedCustomization = response.data.customization || {};
                const serverDraft = response.data.draft || null;
                const resolvedCustomization = localDraft?.customization || serverDraft?.customization || savedCustomization;
                const resolvedRepoIds = Array.isArray(localDraft?.selectedRepoIds)
                    ? localDraft.selectedRepoIds
                    : (Array.isArray(serverDraft?.selectedRepoIds) && serverDraft.selectedRepoIds.length
                        ? serverDraft.selectedRepoIds
                    : (response.data.selectedRepoIds?.length
                        ? response.data.selectedRepoIds
                        : response.data.repositories.slice(0, 6).map((repo) => repo.id)));

                if (localDraft) {
                    setDraftRecoveredFrom('local');
                } else if (serverDraft) {
                    setDraftRecoveredFrom('server');
                } else {
                    setDraftRecoveredFrom(null);
                }

                if (serverDraft?.updatedAt) {
                    setLastDraftSyncedAt(serverDraft.updatedAt);
                    setDraftSyncStatus('synced');
                } else {
                    setLastDraftSyncedAt(null);
                    setDraftSyncStatus('idle');
                }

                setSelectedRepoIds(resolvedRepoIds);
                setJobTitle(resolvedCustomization.jobTitle || '');
                setLinkedinUrl(resolvedCustomization.linkedinUrl || '');
                setHeadline(resolvedCustomization.headline || '');
                setAccentColor(resolvedCustomization.accentColor || '#38bdf8');
                setVisualTheme(resolvedCustomization.visualTheme || 'glassmorphism');
                setCustomDomain(resolvedCustomization.customDomain || '');
                setExperiences(resolvedCustomization.experiences?.length ? resolvedCustomization.experiences : [{ ...EMPTY_EXPERIENCE }]);
                setEducations(resolvedCustomization.educations?.length ? resolvedCustomization.educations : [{ ...EMPTY_EDUCATION }]);
                setCertifications(resolvedCustomization.certifications?.length ? resolvedCustomization.certifications : [{ ...EMPTY_CERTIFICATION }]);
                draftHydratedRef.current = true;
            } catch (error) {
                console.error("Gagal mengambil data:", error);
                if (error.response?.status === 401) handleLogout();
            } finally {
                setLoading(false);
            }
        };
        fetchPortfolioData();
    }, [token]);

    useEffect(() => {
        const username = portfolioData?.profile?.username;
        if (!username) return;

        const draftKey = `${DASHBOARD_DRAFT_PREFIX}${username}`;
        const draftPayload = {
            selectedRepoIds,
            customization: {
                jobTitle,
                linkedinUrl,
                headline,
                accentColor,
                visualTheme,
                customDomain,
                experiences,
                educations,
                certifications
            },
            updatedAt: Date.now()
        };

        localStorage.setItem(draftKey, JSON.stringify(draftPayload));
    }, [
        portfolioData?.profile?.username,
        selectedRepoIds,
        jobTitle,
        linkedinUrl,
        headline,
        accentColor,
        visualTheme,
        customDomain,
        experiences,
        educations,
        certifications
    ]);

    useEffect(() => {
        const username = portfolioData?.profile?.username;
        if (!username || !token || !draftHydratedRef.current) return;

        const timeoutId = window.setTimeout(async () => {
            try {
                setDraftSyncStatus('saving');
                await axios.post(`${API_BASE_URL}/save-draft`, {
                    username,
                    selectedRepoIds,
                    customization: {
                        jobTitle,
                        linkedinUrl,
                        headline,
                        accentColor,
                        visualTheme,
                        customDomain,
                        experiences,
                        educations,
                        certifications
                    }
                });
                setDraftSyncStatus('synced');
                setLastDraftSyncedAt(Date.now());
            } catch (error) {
                setDraftSyncStatus('error');
                console.warn(draftSyncFailedMessage, error);
            }
        }, 1000);

        return () => window.clearTimeout(timeoutId);
    }, [
        token,
        portfolioData?.profile?.username,
        selectedRepoIds,
        jobTitle,
        linkedinUrl,
        headline,
        accentColor,
        visualTheme,
        customDomain,
        experiences,
        educations,
        certifications,
        draftSyncFailedMessage
    ]);

    useEffect(() => {
        if (!lastDraftSyncedAt) return undefined;

        const intervalId = window.setInterval(() => {
            setDraftSyncTick((current) => current + 1);
        }, 30000);

        return () => window.clearInterval(intervalId);
    }, [lastDraftSyncedAt]);

    const filteredRepositories = useMemo(() => {
        if (!portfolioData) return [];

        const query = repoQuery.trim().toLowerCase();
        let repos = [...portfolioData.repositories];

        if (query) {
            repos = repos.filter((repo) =>
                repo.name.toLowerCase().includes(query)
                || (repo.description || '').toLowerCase().includes(query)
                || (repo.language || '').toLowerCase().includes(query)
                || (repo.topics || []).some((topic) => topic.toLowerCase().includes(query))
            );
        }

        repos.sort((a, b) => {
            if (sortBy === 'updated') {
                return new Date(b.updated_at) - new Date(a.updated_at);
            }
            if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            }
            return b.stargazers_count - a.stargazers_count;
        });

        return repos;
    }, [portfolioData, repoQuery, sortBy]);

    const selectedRepositories = useMemo(() => {
        if (!portfolioData) return [];
        return portfolioData.repositories.filter((repo) => selectedRepoIds.includes(repo.id));
    }, [portfolioData, selectedRepoIds]);

    const t = I18N[locale] || I18N.id;

    const draftSyncLabel = useMemo(() => {
        if (draftSyncStatus === 'saving') return t.draftSyncSaving;
        if (draftSyncStatus === 'synced') return t.draftSyncSynced;
        if (draftSyncStatus === 'error') return t.draftSyncError;
        return t.draftSyncIdle;
    }, [draftSyncStatus, t]);

    const draftSyncRelativeTime = useMemo(
        () => formatDraftSyncRelativeTime(lastDraftSyncedAt, locale, t),
        [lastDraftSyncedAt, locale, t, draftSyncTick]
    );

    const setupChecks = useMemo(() => ([
        { key: 'repos', label: t.checklistRepos, done: selectedRepositories.length > 0, targetId: 'repo-selection' },
        { key: 'job', label: t.checklistJob, done: Boolean(jobTitle.trim()), targetId: 'profile-setup' },
        { key: 'headline', label: t.checklistHeadline, done: Boolean(headline.trim()), targetId: 'profile-setup' },
        { key: 'domain', label: t.checklistDomain, done: Boolean(customDomain.trim()), targetId: 'profile-setup' },
        { key: 'exp', label: t.checklistExp, done: experiences.some((item) => item.role || item.company), targetId: 'experience-section' },
        { key: 'edu', label: t.checklistEdu, done: educations.some((item) => item.school || item.degree), targetId: 'education-section' },
        { key: 'cert', label: t.checklistCert, done: certifications.some((item) => item.title || item.issuer), targetId: 'certification-section' }
    ]), [selectedRepositories, jobTitle, headline, customDomain, experiences, educations, certifications, t]);

    const setupProgress = useMemo(() => {
        const done = setupChecks.filter((item) => item.done).length;
        return {
            done,
            total: setupChecks.length,
            percent: Math.round((done / setupChecks.length) * 100)
        };
    }, [setupChecks]);

    const weeklyProgress = useMemo(() => {
        const today = setupProgress.percent;
        const base = Math.max(8, today - 36);
        const values = [
            Math.max(0, base - 14),
            Math.max(0, base - 8),
            Math.max(0, base - 5),
            Math.max(0, base),
            Math.min(100, base + 8),
            Math.min(100, base + 15),
            today
        ];
        const labels = locale === 'en' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
        return values.map((value, index) => ({ label: labels[index], value }));
    }, [setupProgress.percent, locale]);

    const particleDots = useMemo(() => (
        Array.from({ length: 22 }, (_, index) => ({
            id: index,
            left: `${6 + ((index * 17) % 88)}%`,
            top: `${8 + ((index * 23) % 82)}%`,
            size: 2 + (index % 3),
            duration: 2.8 + ((index % 7) * 0.55),
            delay: (index % 6) * 0.45,
            opacity: 0.18 + ((index % 5) * 0.08)
        }))
    ), []);

    const showCinematicParticles = layoutMode === 'cinematic' && particleFxEnabled && !lowSpecMode;

    const dashboardStats = useMemo(() => {
        const totalStars = selectedRepositories.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
        const totalForks = selectedRepositories.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
        const techStack = [...new Set(selectedRepositories.map((repo) => repo.language).filter(Boolean))].length;

        return [
            {
                label: 'Repo Terpilih',
                value: `${selectedRepositories.length}/${MAX_SELECTED_REPOS}`,
                hint: 'Kurasi project terbaikmu',
                icon: <Code2 size={16} className="text-cyan-300" />
            },
            {
                label: 'Total Stars',
                value: totalStars,
                hint: 'Dari repo yang dipilih',
                icon: <Star size={16} className="text-amber-300" />
            },
            {
                label: 'Total Forks',
                value: totalForks,
                hint: 'Indikasi ketertarikan komunitas',
                icon: <GitFork size={16} className="text-emerald-300" />
            },
            {
                label: 'Tech Variety',
                value: techStack,
                hint: 'Bahasa utama terdeteksi',
                icon: <Terminal size={16} className="text-fuchsia-300" />
            }
        ];
    }, [selectedRepositories]);

    const previewRepo = selectedRepositories[0] || null;
    const previewName = portfolioData?.profile?.name || portfolioData?.profile?.username || 'Nama Kamu';
    const previewRole = jobTitle || 'Software Developer';
    const previewHeadline = headline;
    const previewLanguages = [...new Set(selectedRepositories.map((repo) => repo.language).filter(Boolean))].slice(0, 3);

    const scrollToSection = (targetId) => {
        const section = document.getElementById(targetId);
        if (!section) return;

        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        section.classList.add('ring-2', 'ring-cyan-400/50', 'rounded-2xl');
        setTimeout(() => {
            section.classList.remove('ring-2', 'ring-cyan-400/50', 'rounded-2xl');
        }, 900);
    };

    const playSuccessCue = () => {
        if (!soundEnabled) return;

        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;

            const audioCtx = new AudioCtx();
            const oscillator = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(780, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1180, audioCtx.currentTime + 0.12);

            gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.06, audioCtx.currentTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.16);

            oscillator.connect(gain);
            gain.connect(audioCtx.destination);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.18);
        } catch (error) {
            console.warn('Sound cue gagal diputar:', error);
        }
    };

    const triggerCelebration = () => {
        if (!celebrationEnabled || lowSpecMode) return;

        const bursts = Array.from({ length: 22 }, (_, index) => ({
            id: `${Date.now()}-${index}`,
            left: `${38 + ((index * 5) % 28)}%`,
            color: ['#22d3ee', '#34d399', '#f59e0b', '#a78bfa'][index % 4],
            delay: `${(index % 6) * 60}ms`,
            duration: `${680 + ((index % 5) * 90)}ms`,
            rotate: `${-24 + ((index * 11) % 48)}deg`
        }));

        setConfettiBursts(bursts);
        setTimeout(() => setConfettiBursts([]), 1200);
    };

    const applyStylePreset = (preset) => {
        setAccentColor(preset.accentColor);
        setVisualTheme(preset.visualTheme);
        setLayoutMode(preset.layoutMode);
        if (preset.layoutMode === 'cinematic' && !lowSpecMode) {
            setParticleFxEnabled(true);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('github_token');
        setToken(null);
        setPortfolioData(null);
        navigate('/');
    };

    const handlePublish = async () => {
        if (selectedRepositories.length === 0) {
            alert(t.publishRequireRepo);
            return;
        }

        try {
            // PERHATIKAN: Ini harus POST dan mengarah ke /api/portfolio/save
            const response = await axios.post(`${API_BASE_URL}/save`, {
                profile: portfolioData.profile,
                repositories: selectedRepositories,
                theme: 'dark',
                customization: {
                    jobTitle,
                    linkedinUrl,
                    headline,
                    accentColor,
                    visualTheme,
                    customDomain,
                    experiences,
                    educations,
                    certifications
                }
            });

            playSuccessCue();
            triggerCelebration();
            localStorage.removeItem(`${DASHBOARD_DRAFT_PREFIX}${portfolioData.profile.username}`);
            setDraftRecoveredFrom(null);
            alert(`${response.data.message}\n${t.publishRedirectNote}`);
            navigate(`/p/${portfolioData.profile.username}`);

        } catch (error) {
            alert(t.publishFailed);
            console.error(error);
        }
    };

    const toggleRepoSelection = (repoId) => {
        setSelectedRepoIds((current) => {
            if (current.includes(repoId)) {
                return current.filter((id) => id !== repoId);
            }

            if (current.length >= MAX_SELECTED_REPOS) {
                alert(t.maxRepoReached.replace('{count}', String(MAX_SELECTED_REPOS)));
                return current;
            }

            return [...current, repoId];
        });
    };

    const updateExperience = (index, field, value) => {
        setExperiences((current) => current.map((item, itemIndex) => (
            itemIndex === index ? { ...item, [field]: value } : item
        )));
    };

    const addExperience = () => {
        setExperiences((current) => [...current, { ...EMPTY_EXPERIENCE }]);
    };

    const removeExperience = (index) => {
        setExperiences((current) => current.length <= 1 ? current : current.filter((_, itemIndex) => itemIndex !== index));
    };

    const updateEducation = (index, field, value) => {
        setEducations((current) => current.map((item, itemIndex) => (
            itemIndex === index ? { ...item, [field]: value } : item
        )));
    };

    const addEducation = () => {
        setEducations((current) => [...current, { ...EMPTY_EDUCATION }]);
    };

    const removeEducation = (index) => {
        setEducations((current) => current.length <= 1 ? current : current.filter((_, itemIndex) => itemIndex !== index));
    };

    const updateCertification = (index, field, value) => {
        setCertifications((current) => current.map((item, itemIndex) => (
            itemIndex === index ? { ...item, [field]: value } : item
        )));
    };

    const addCertification = () => {
        setCertifications((current) => [...current, { ...EMPTY_CERTIFICATION }]);
    };

    const removeCertification = (index) => {
        setCertifications((current) => current.length <= 1 ? current : current.filter((_, itemIndex) => itemIndex !== index));
    };

    const generateHeadlineFromGithub = () => {
        if (!portfolioData) return;

        const topLanguages = [...new Set(selectedRepositories.map((repo) => repo.language).filter(Boolean))]
            .slice(0, 3)
            .join(', ');

        const profileName = portfolioData.profile?.name || portfolioData.profile?.username || (locale === 'en' ? 'I' : 'Saya');
        const fallbackJob = jobTitle || 'Software Developer';
        const projectCount = selectedRepositories.length;

        const generatedHeadline = t.generatedHeadlineTemplate
            .replace('{name}', profileName)
            .replace('{role}', fallbackJob)
            .replace('{stack}', topLanguages || (locale === 'en' ? 'modern technologies' : 'teknologi modern'))
            .replace('{count}', String(projectCount));
        setHeadline(generatedHeadline);
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center p-8 bg-[#111] border border-slate-800 rounded-2xl text-slate-300">
                    <p className="mb-4">{t.sessionEnded}</p>
                    <button onClick={() => navigate('/')} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors">
                        {t.backToLogin}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen text-slate-200 selection:bg-blue-500/30 relative overflow-hidden soft-grid transition-all duration-500 ${layoutMode === 'cinematic' ? '' : 'bg-[#090b11]'}`}>
            {confettiBursts.length > 0 ? (
                <div className="absolute inset-0 pointer-events-none z-40" aria-hidden="true">
                    {confettiBursts.map((item) => (
                        <span
                            key={item.id}
                            className="absolute h-2 w-1 rounded-sm"
                            style={{
                                left: item.left,
                                top: '7%',
                                background: item.color,
                                opacity: 0.9,
                                transform: `rotate(${item.rotate})`,
                                animation: `ping ${item.duration} ease-out ${item.delay} 1`
                            }}
                        />
                    ))}
                </div>
            ) : null}
            <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-cyan-500/15 blur-[90px] rounded-full pointer-events-none ${layoutMode === 'minimal' ? 'opacity-40' : ''}`} />
            {showCinematicParticles ? (
                <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                    {particleDots.map((dot) => (
                        <span
                            key={dot.id}
                            className="absolute rounded-full animate-pulse"
                            style={{
                                left: dot.left,
                                top: dot.top,
                                width: `${dot.size}px`,
                                height: `${dot.size}px`,
                                background: 'linear-gradient(180deg, rgba(103,232,249,1) 0%, rgba(16,185,129,1) 100%)',
                                opacity: dot.opacity,
                                filter: 'blur(0.2px)',
                                animationDuration: `${dot.duration}s`,
                                animationDelay: `${dot.delay}s`
                            }}
                        />
                    ))}
                    <span
                        className="absolute h-[2px] w-40 bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent"
                        style={{
                            left: '68%',
                            top: '14%',
                            transform: 'rotate(-28deg)',
                            opacity: 0.4,
                            animation: 'pulse 3.8s ease-in-out infinite'
                        }}
                    />
                </div>
            ) : null}
            {layoutMode === 'cinematic' ? (
                <>
                    <div className="absolute right-[-120px] top-[180px] w-[340px] h-[340px] border border-cyan-400/20 rounded-full pointer-events-none" />
                    <div className="absolute left-[-80px] top-[420px] w-[240px] h-[240px] border border-emerald-400/20 rounded-full pointer-events-none" />
                </>
            ) : null}

            {/* Navbar Dashboard */}
            <nav className="sticky top-0 z-50 bg-[#06070d]/75 backdrop-blur-xl border-b border-slate-800/80">
                <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <LayoutDashboard className="text-cyan-300" />
                        <h1 className="text-xl font-display text-white tracking-tight">{t.dashboardSetup}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setParticleFxEnabled((current) => !current)}
                            disabled={lowSpecMode}
                            className={`text-[11px] px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${particleFxEnabled ? 'border-cyan-500/60 text-cyan-300 bg-cyan-900/20' : 'border-slate-700 text-slate-400 hover:text-slate-200'}`}
                        >
                            {t.particleFx}: {particleFxEnabled ? 'On' : 'Off'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setSoundEnabled((current) => !current)}
                            className={`text-[11px] px-3 py-1.5 rounded-lg border transition-colors ${soundEnabled ? 'border-emerald-500/60 text-emerald-300 bg-emerald-900/20' : 'border-slate-700 text-slate-400 hover:text-slate-200'}`}
                        >
                            {t.soundCue}: {soundEnabled ? 'On' : 'Off'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setCelebrationEnabled((current) => !current)}
                            disabled={lowSpecMode}
                            className={`text-[11px] px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${celebrationEnabled ? 'border-fuchsia-500/60 text-fuchsia-300 bg-fuchsia-900/20' : 'border-slate-700 text-slate-400 hover:text-slate-200'}`}
                        >
                            {t.celebration}: {celebrationEnabled ? 'On' : 'Off'}
                        </button>
                        <div className="rounded-lg border border-slate-700 p-1 bg-slate-900/50 flex items-center">
                            {DASHBOARD_LOCALES.map((item) => (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => setLocale(item.value)}
                                    className={`text-[11px] px-2.5 py-1 rounded transition-colors ${locale === item.value ? 'bg-cyan-600/30 text-cyan-200' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-900/50 hover:text-red-400 text-slate-300 rounded-lg transition-colors border border-slate-700 hover:border-red-900"
                        >
                            <LogOut size={16} /> <span className="hidden sm:inline">{t.logout}</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Konten Utama */}
            <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-400">{t.syncingGithub}</p>
                    </div>
                ) : portfolioData ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {draftRecoveredFrom ? (
                            <div className="rounded-xl border border-cyan-500/30 bg-cyan-900/20 px-4 py-2.5 text-xs text-cyan-100">
                                {draftRecoveredFrom === 'local' ? t.localDraftRecovered : t.serverDraftRecovered}
                            </div>
                        ) : null}

                        <div className="rounded-xl border border-slate-700/70 bg-slate-900/60 px-4 py-3 text-xs text-slate-200 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex h-2.5 w-2.5 rounded-full ${draftSyncStatus === 'saving' ? 'bg-cyan-300 animate-pulse' : draftSyncStatus === 'synced' ? 'bg-emerald-300' : draftSyncStatus === 'error' ? 'bg-red-400' : 'bg-slate-500'}`} />
                                <span className="font-medium text-slate-100">{t.draftSyncTitle}:</span>
                                <span>{draftSyncLabel}</span>
                            </div>
                            <span className="text-[11px] text-slate-400">{draftSyncRelativeTime}</span>
                        </div>

                        {lowSpecMode ? (
                            <div className="rounded-xl border border-amber-500/30 bg-amber-900/15 px-4 py-2.5 text-xs text-amber-200">
                                {t.fxLiteInfo}
                            </div>
                        ) : null}

                        {/* Hero */}
                        <div className={`glass-card border border-cyan-300/20 rounded-3xl p-6 md:p-8 relative overflow-hidden transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 ${layoutMode === 'cinematic' ? '' : 'bg-[#101521]/90'}`}>
                            {layoutMode === 'cinematic' ? (
                                <>
                                    <div
                                        className="absolute inset-0 pointer-events-none"
                                        style={{
                                            background: 'radial-gradient(circle at 18% 28%, rgba(14,165,233,0.14) 0%, transparent 42%), radial-gradient(circle at 82% 74%, rgba(16,185,129,0.14) 0%, transparent 40%)',
                                            animation: 'pulse 8s ease-in-out infinite'
                                        }}
                                    />
                                    <div
                                        className="absolute inset-0 pointer-events-none"
                                        style={{
                                            background: 'radial-gradient(circle at 70% 24%, rgba(167,139,250,0.12) 0%, transparent 44%)',
                                            animation: 'pulse 11s ease-in-out infinite'
                                        }}
                                    />
                                </>
                            ) : null}
                            <div className="absolute -right-24 -top-20 w-72 h-72 bg-cyan-500/20 blur-[90px] rounded-full" />
                            <div className="absolute -left-24 -bottom-28 w-72 h-72 bg-emerald-500/10 blur-[90px] rounded-full" />

                            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
                                <div className="xl:col-span-2">
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80 mb-3">{t.controlRoom}</p>
                                    <h2 className="text-2xl md:text-3xl font-display text-white leading-tight mb-3">{t.heroTitle}</h2>
                                    <p className="text-slate-400 max-w-2xl">{t.heroSubtitle}</p>

                                    <div className="mt-5 flex flex-wrap items-center gap-2">
                                        <p className="text-[11px] text-slate-500 mr-1">{t.viewMode}</p>
                                        {DASHBOARD_LAYOUT_MODES.map((modeItem) => (
                                            <button
                                                key={modeItem.value}
                                                type="button"
                                                onClick={() => setLayoutMode(modeItem.value)}
                                                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${layoutMode === modeItem.value ? 'border-cyan-400/60 bg-cyan-900/30 text-cyan-200' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                            >
                                                {modeItem.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-5 rounded-xl border border-slate-700/70 bg-slate-900/45 p-3">
                                        <div className="mb-2">
                                            <p className="text-xs font-semibold text-slate-200">{t.stylePacks}</p>
                                            <p className="text-[11px] text-slate-500">{t.stylePacksSubtitle}</p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            {STYLE_PRESETS.map((preset) => (
                                                <button
                                                    key={preset.key}
                                                    type="button"
                                                    onClick={() => applyStylePreset(preset)}
                                                    className="text-left rounded-lg border border-slate-700 hover:border-cyan-500/50 bg-slate-950/70 px-3 py-2 transition-all hover:-translate-y-0.5"
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-semibold text-slate-200">{preset.label}</span>
                                                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: preset.accentColor }} />
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 mb-1">{preset.visualTheme}</p>
                                                    <p className="text-[11px] text-cyan-300">{t.apply}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                        {dashboardStats.map((stat) => (
                                            <div key={stat.label} className="rounded-xl border border-slate-700/70 bg-slate-900/40 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-[0_10px_25px_-18px_rgba(34,211,238,0.8)]">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[11px] text-slate-400">{stat.label}</span>
                                                    {stat.icon}
                                                </div>
                                                <p className="text-lg font-bold text-white leading-none mb-1">{stat.value}</p>
                                                <p className="text-[11px] text-slate-500">{stat.hint}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-700/70 bg-slate-950/70 p-5 flex flex-col">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs text-slate-400">{t.setupProgress}</p>
                                        <span className="text-xs font-semibold text-cyan-300">{setupProgress.percent}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 transition-all duration-500"
                                            style={{ width: `${setupProgress.percent}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-slate-300 mb-4">{setupProgress.done} / {setupProgress.total} {t.stageFilled}</p>

                                    <div className="mb-4 rounded-lg border border-slate-700/70 bg-slate-900/60 p-3">
                                        <p className="text-[11px] uppercase tracking-[0.1em] text-slate-500 mb-2">Weekly Setup Trend</p>
                                        <div className="flex items-end gap-1.5 h-16">
                                            {weeklyProgress.map((item, index) => (
                                                <div key={item.label + index} className="flex-1 flex flex-col items-center gap-1">
                                                    <div className="w-full rounded bg-slate-800/80 overflow-hidden">
                                                        <div
                                                            className="w-full bg-gradient-to-t from-cyan-500 to-emerald-400 transition-all duration-500"
                                                            style={{ height: `${Math.max(8, item.value)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[9px] text-slate-500">{item.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => navigate(`/preview/${portfolioData.profile.username}`)}
                                        className="w-full mb-2.5 flex items-center justify-center gap-2 px-5 py-2.5 border border-cyan-400/40 text-cyan-200 hover:text-white hover:border-cyan-300 rounded-xl transition-colors"
                                    >
                                        <ExternalLink size={16} /> {t.previewDraft}
                                    </button>
                                    <p className="text-[11px] text-slate-500 mb-3 text-center">{t.previewDraftHint}</p>

                                    <button
                                        onClick={handlePublish}
                                        className="group mt-auto w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5"
                                    >
                                        <Rocket size={18} className="transition-transform group-hover:translate-x-0.5" /> {t.publishNow}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style={{ animationDelay: '100ms' }} className={`glass-card border border-slate-700/60 rounded-2xl p-5 md:p-6 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 ${layoutMode === 'cinematic' ? 'duration-500' : ''}`}>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                                <div>
                                    <p className="text-sm font-semibold text-white">{t.onboardingTitle}</p>
                                    <p className="text-xs text-slate-400">{t.onboardingSubtitle}</p>
                                </div>
                                <span className="text-xs px-2.5 py-1 rounded-full border border-cyan-400/30 bg-cyan-900/20 text-cyan-200">
                                    {setupProgress.done}/{setupProgress.total} {t.done}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                                {setupChecks.map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => scrollToSection(item.targetId)}
                                        className={`rounded-xl border px-3 py-2.5 text-xs flex items-center gap-2 text-left transition-all hover:-translate-y-0.5 ${item.done ? 'border-emerald-500/40 bg-emerald-900/20 text-emerald-200' : 'border-slate-700 bg-slate-900/40 text-slate-300 hover:border-cyan-500/50'}`}
                                    >
                                        {item.done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ animationDelay: '180ms' }} className="glass-card border border-slate-700/60 rounded-2xl p-5 md:p-6 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm font-semibold text-white">{t.livePreviewTitle}</p>
                                    <p className="text-xs text-slate-400">{t.livePreviewSubtitle}</p>
                                </div>
                                <span className="text-[11px] px-2 py-1 rounded border border-slate-700 text-slate-400">{visualTheme}</span>
                            </div>

                            <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-[#090d19] to-[#111827] p-4 md:p-5">
                                <div className="flex items-start gap-3 mb-4">
                                    <img
                                        src={portfolioData.profile.avatar_url}
                                        alt="Preview avatar"
                                        className="w-12 h-12 rounded-full border border-slate-600 object-cover"
                                    />
                                    <div>
                                        <h4 className="text-white font-semibold leading-none mb-1">{previewName}</h4>
                                        <p className="text-xs" style={{ color: accentColor }}>{previewRole}</p>
                                        <p className="text-[11px] text-slate-500 mt-1">@{portfolioData.profile.username}</p>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-300 mb-4 line-clamp-2">{previewHeadline || t.writeHeadlineHint}</p>

                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {previewLanguages.length ? previewLanguages.map((lang) => (
                                        <span key={lang} className="text-[10px] px-2 py-1 rounded-full border border-slate-600 text-slate-300 bg-slate-800/70">
                                            {lang}
                                        </span>
                                    )) : (
                                        <span className="text-[11px] text-slate-500">{t.selectedRepoHint}</span>
                                    )}
                                </div>

                                <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
                                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500 mb-1">{t.highlightedProject}</p>
                                    <p className="text-sm font-semibold text-cyan-300">{previewRepo?.name || t.noRepoSelected}</p>
                                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{previewRepo?.description || t.noRepoDesc}</p>
                                </div>
                            </div>
                        </div>

                        {/* Grid Layout untuk Preview Data */}
                        <div style={{ animationDelay: '260ms' }} className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Kolom Kiri: Profil */}
                            <div id="profile-setup" className="lg:col-span-1">
                                <div className="glass-card border border-slate-700/60 rounded-2xl p-6 sticky top-24">
                                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
                                        <Terminal size={18} className="text-slate-400" /> {t.profileData}
                                    </h3>
                                    <div className="text-center">
                                        <img
                                            src={portfolioData.profile.avatar_url}
                                            alt="Profile"
                                            className="w-24 h-24 rounded-full border-2 border-slate-700 mx-auto mb-4 object-cover"
                                        />
                                        <h2 className="text-xl font-bold text-white mb-1">{portfolioData.profile.name}</h2>
                                        <p className="text-blue-400 text-sm mb-4">@{portfolioData.profile.username}</p>
                                        <p className="text-slate-400 text-sm bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                            {portfolioData.profile.bio || 'Belum ada bio.'}
                                        </p>
                                        <div className="mt-8 pt-6 border-t border-slate-800 text-left">
                                            <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                                                <Sparkles size={16} className="text-blue-400" /> {t.careerCustomization}
                                            </h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1.5">{t.primaryRole}</label>
                                                    <input
                                                        type="text"
                                                        value={jobTitle}
                                                        onChange={(e) => setJobTitle(e.target.value)}
                                                        placeholder={t.primaryRolePlaceholder}
                                                        className="w-full bg-[#0a0a0a] border border-slate-700 hover:border-slate-600 rounded-lg px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                                                        <Linkedin size={12} /> {t.linkedinLabel}
                                                    </label>
                                                    <input
                                                        type="url"
                                                        value={linkedinUrl}
                                                        onChange={(e) => setLinkedinUrl(e.target.value)}
                                                        placeholder="https://linkedin.com/in/username"
                                                        className="w-full bg-[#0a0a0a] border border-slate-700 hover:border-slate-600 rounded-lg px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <label className="block text-xs font-medium text-slate-500">{t.shortHeadline}</label>
                                                        <button
                                                            type="button"
                                                            onClick={generateHeadlineFromGithub}
                                                            className="text-[11px] inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                                                        >
                                                            <WandSparkles size={12} /> {t.autoFromGithub}
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        value={headline}
                                                        onChange={(e) => setHeadline(e.target.value)}
                                                        rows={3}
                                                        placeholder={t.headlinePlaceholder}
                                                        className="w-full bg-[#0a0a0a] border border-slate-700 hover:border-slate-600 rounded-lg px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1.5">{t.accentColor}</label>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="color"
                                                            value={accentColor}
                                                            onChange={(e) => setAccentColor(e.target.value)}
                                                            className="h-10 w-12 bg-transparent border border-slate-700 rounded cursor-pointer"
                                                        />
                                                        <span className="text-xs text-slate-400">{accentColor}</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1.5">{t.publicVisualTheme}</label>
                                                    <select
                                                        value={visualTheme}
                                                        onChange={(e) => setVisualTheme(e.target.value)}
                                                        className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                                    >
                                                        {VISUAL_THEMES.map((themeItem) => (
                                                            <option key={themeItem.value} value={themeItem.value}>{themeItem.label}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1.5">{t.customDomainOptional}</label>
                                                    <input
                                                        type="text"
                                                        value={customDomain}
                                                        onChange={(e) => setCustomDomain(e.target.value)}
                                                        placeholder={t.customDomainPlaceholder}
                                                        className="w-full bg-[#0a0a0a] border border-slate-700 hover:border-slate-600 rounded-lg px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                                                    />
                                                </div>

                                                <div id="experience-section" className="pt-2 border-t border-slate-800/80">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                                                            <Briefcase size={12} /> {t.experience}
                                                        </label>
                                                        <button type="button" onClick={addExperience} className="text-[11px] flex items-center gap-1 text-blue-400 hover:text-blue-300">
                                                            <Plus size={12} /> {t.add}
                                                        </button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {experiences.map((experience, index) => (
                                                            <div key={`exp-${index}`} className="p-3 rounded-lg border border-slate-700 bg-slate-900/40 space-y-2">
                                                                <input
                                                                    type="text"
                                                                    value={experience.role}
                                                                    onChange={(e) => updateExperience(index, 'role', e.target.value)}
                                                                    placeholder={t.expRolePlaceholder}
                                                                    className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={experience.company}
                                                                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                                                    placeholder={t.expCompanyPlaceholder}
                                                                    className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={experience.period}
                                                                    onChange={(e) => updateExperience(index, 'period', e.target.value)}
                                                                    placeholder={t.expPeriodPlaceholder}
                                                                    className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                                                                />
                                                                <textarea
                                                                    value={experience.summary}
                                                                    onChange={(e) => updateExperience(index, 'summary', e.target.value)}
                                                                    placeholder={t.expSummaryPlaceholder}
                                                                    rows={2}
                                                                    className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                                                                />
                                                                {experiences.length > 1 && (
                                                                    <button type="button" onClick={() => removeExperience(index)} className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1">
                                                                        <Trash2 size={12} /> {t.delete}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div id="education-section" className="pt-2 border-t border-slate-800/80">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                                                            <GraduationCap size={12} /> {t.education}
                                                        </label>
                                                        <button type="button" onClick={addEducation} className="text-[11px] flex items-center gap-1 text-blue-400 hover:text-blue-300">
                                                            <Plus size={12} /> {t.add}
                                                        </button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {educations.map((education, index) => (
                                                            <div key={`edu-${index}`} className="p-3 rounded-lg border border-slate-700 bg-slate-900/40 space-y-2">
                                                                <input
                                                                    type="text"
                                                                    value={education.school}
                                                                    onChange={(e) => updateEducation(index, 'school', e.target.value)}
                                                                    placeholder={t.eduSchoolPlaceholder}
                                                                    className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={education.degree}
                                                                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                                                    placeholder={t.eduDegreePlaceholder}
                                                                    className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={education.period}
                                                                    onChange={(e) => updateEducation(index, 'period', e.target.value)}
                                                                    placeholder={t.eduPeriodPlaceholder}
                                                                    className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                                                                />
                                                                <textarea
                                                                    value={education.summary}
                                                                    onChange={(e) => updateEducation(index, 'summary', e.target.value)}
                                                                    placeholder={t.eduSummaryPlaceholder}
                                                                    rows={2}
                                                                    className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                                                                />
                                                                {educations.length > 1 && (
                                                                    <button type="button" onClick={() => removeEducation(index)} className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1">
                                                                        <Trash2 size={12} /> {t.delete}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div id="certification-section" className="pt-2 border-t border-slate-800/80">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                                                            <Award size={12} /> {t.certification}
                                                        </label>
                                                        <button type="button" onClick={addCertification} className="text-[11px] flex items-center gap-1 text-blue-400 hover:text-blue-300">
                                                            <Plus size={12} /> {t.add}
                                                        </button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {certifications.map((certification, index) => (
                                                            <div key={`cert-${index}`} className="p-3 rounded-lg border border-slate-700 bg-slate-900/40 space-y-2">
                                                                <input
                                                                    type="text"
                                                                    value={certification.title}
                                                                    onChange={(e) => updateCertification(index, 'title', e.target.value)}
                                                                    placeholder={t.certTitlePlaceholder}
                                                                    className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={certification.issuer}
                                                                    onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                                                                    placeholder={t.certIssuerPlaceholder}
                                                                    className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                                                                />
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                    <input
                                                                        type="text"
                                                                        value={certification.year}
                                                                        onChange={(e) => updateCertification(index, 'year', e.target.value)}
                                                                        placeholder={t.certYearPlaceholder}
                                                                        className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                                                                    />
                                                                    <input
                                                                        type="url"
                                                                        value={certification.credentialUrl}
                                                                        onChange={(e) => updateCertification(index, 'credentialUrl', e.target.value)}
                                                                        placeholder={t.certUrlPlaceholder}
                                                                        className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                                                                    />
                                                                </div>
                                                                {certifications.length > 1 && (
                                                                    <button type="button" onClick={() => removeCertification(index)} className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1">
                                                                        <Trash2 size={12} /> {t.delete}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Kolom Kanan: Repositori */}
                            <div id="repo-selection" className="lg:col-span-2">
                                <div className="glass-card border border-slate-700/60 rounded-2xl p-6">
                                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
                                        <Code2 size={18} className="text-slate-400" /> {t.chooseRepositories} ({selectedRepoIds.length}/{MAX_SELECTED_REPOS})
                                    </h3>

                                    <div className="flex flex-col sm:flex-row gap-3 mb-5">
                                        <div className="flex-1 relative">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                            <input
                                                type="text"
                                                value={repoQuery}
                                                onChange={(e) => setRepoQuery(e.target.value)}
                                                placeholder={t.searchRepoPlaceholder}
                                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="bg-[#0a0a0a] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="stars">{t.sortStars}</option>
                                            <option value="updated">{t.sortUpdated}</option>
                                            <option value="name">{t.sortName}</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {filteredRepositories.length === 0 ? (
                                            <div className="sm:col-span-2 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-7 text-center">
                                                <svg viewBox="0 0 220 120" className="w-full max-w-[280px] mx-auto mb-4" aria-hidden="true">
                                                    <rect x="12" y="20" width="196" height="84" rx="14" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                                                    <circle cx="52" cy="50" r="10" fill="#0ea5e9" fillOpacity="0.35" />
                                                    <rect x="72" y="42" width="98" height="8" rx="4" fill="#334155" />
                                                    <rect x="72" y="58" width="70" height="7" rx="3.5" fill="#1e293b" />
                                                    <rect x="24" y="76" width="172" height="14" rx="7" fill="#111827" stroke="#1f2937" />
                                                    <path d="M180 26 L196 10" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
                                                    <circle cx="200" cy="8" r="4" fill="#22d3ee" fillOpacity="0.7" />
                                                </svg>
                                                <p className="text-sm font-semibold text-slate-200 mb-1">{t.repoEmptyTitle}</p>
                                                <p className="text-xs text-slate-500 max-w-md mx-auto">{t.repoEmptyDesc}</p>
                                            </div>
                                        ) : filteredRepositories.map(repo => {
                                            const isSelected = selectedRepoIds.includes(repo.id);
                                            return (
                                            <div
                                                key={repo.id}
                                                className={`relative overflow-hidden p-4 border bg-[#0a0a0a] rounded-xl transition-all ${isSelected ? 'border-cyan-400/70 shadow-[0_0_0_1px_rgba(34,211,238,0.3)]' : 'border-slate-800 hover:border-slate-600 hover:-translate-y-0.5'}`}
                                            >
                                                <div className={`absolute inset-x-0 top-0 h-0.5 ${isSelected ? 'bg-gradient-to-r from-cyan-400 to-emerald-400' : 'bg-slate-800'}`} />
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <h4 className="font-semibold text-blue-400 truncate">{repo.name}</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleRepoSelection(repo.id)}
                                                        className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${isSelected ? 'bg-blue-600/20 border-blue-500/60 text-blue-300' : 'border-slate-700 text-slate-400 hover:text-white'}`}
                                                    >
                                                        {isSelected ? t.selected : t.choose}
                                                    </button>
                                                </div>
                                                <p className="text-xs text-slate-500 line-clamp-2 mb-3 h-8">
                                                    {repo.description || t.noDescription}
                                                </p>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-300">{repo.language || t.codeFallback}</span>
                                                    <div className="flex items-center gap-3 text-slate-400">
                                                        <span className="flex items-center gap-1"><Star size={12} /> {repo.stargazers_count}</span>
                                                        <span className="flex items-center gap-1"><GitFork size={12} /> {repo.forks_count || 0}</span>
                                                    </div>
                                                </div>
                                                {repo.topics?.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                                        {repo.topics.slice(0, 3).map((topic) => (
                                                            <span key={topic} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                                                {topic}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )})}
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                ) : null}
            </div>

            {!loading && portfolioData ? (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] sm:w-auto">
                    <div className="glass-card border border-cyan-300/20 rounded-2xl px-4 py-3 sm:px-5 sm:py-3 flex items-center gap-4 shadow-2xl shadow-cyan-900/20">
                        <div className="hidden sm:block">
                            <p className="text-[11px] uppercase tracking-[0.12em] text-cyan-300/80">{t.readyToPublish}</p>
                            <p className="text-sm text-slate-300">{selectedRepoIds.length} {t.selectedRepoCount} • {t.setupDone} {setupProgress.percent}% {t.done}</p>
                        </div>
                        <button
                            onClick={handlePublish}
                            className="group flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl transition-all"
                        >
                            <Rocket size={16} className="transition-transform group-hover:translate-x-0.5" /> {t.publishPortfolio}
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default Dashboard;