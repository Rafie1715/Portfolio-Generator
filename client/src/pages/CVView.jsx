import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { PORTFOLIO_API_BASE_URL } from '../config/api';
import {
    ArrowLeft,
    Printer,
    FileDown,
    ExternalLink,
    Sparkles,
    Briefcase,
    GraduationCap,
    Award,
    FolderGit2,
    Github,
    Linkedin,
    MapPin,
    Star,
    GitFork,
    Code2
} from 'lucide-react';

const CVView = () => {
    const { username } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isPreparingPdf, setIsPreparingPdf] = useState(false);

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const response = await axios.get(`${PORTFOLIO_API_BASE_URL}/${username}`);
                setData(response.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Gagal memuat data CV.');
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolio();
    }, [username]);

    const accentColor = data?.customization?.accentColor || '#0f172a';
    const experiences = Array.isArray(data?.customization?.experiences) ? data.customization.experiences : [];
    const educations = Array.isArray(data?.customization?.educations) ? data.customization.educations : [];
    const certifications = Array.isArray(data?.customization?.certifications) ? data.customization.certifications : [];
    const rawTheme = searchParams.get('theme');
    const cvTheme = ['ats', 'creative', 'executive'].includes(rawTheme) ? rawTheme : 'ats';

    const sortedProjects = useMemo(() => {
        if (!data?.repositories) return [];
        return [...data.repositories].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 8);
    }, [data]);

    const topLanguages = useMemo(() => {
        if (!data?.repositories?.length) return [];

        const counter = new Map();
        data.repositories.forEach((repo) => {
            if (!repo.language) return;
            counter.set(repo.language, (counter.get(repo.language) || 0) + 1);
        });

        return [...counter.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([language]) => language);
    }, [data?.repositories]);

    const totalStars = useMemo(
        () => (data?.repositories || []).reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0),
        [data?.repositories]
    );

    const totalForks = useMemo(
        () => (data?.repositories || []).reduce((sum, repo) => sum + (repo.forks_count || 0), 0),
        [data?.repositories]
    );

    const executiveSkills = useMemo(() => {
        if (!data?.repositories?.length) return [];

        const stats = new Map();
        data.repositories.forEach((repo) => {
            if (!repo.language) return;

            const previous = stats.get(repo.language) || { count: 0, stars: 0, forks: 0 };
            stats.set(repo.language, {
                count: previous.count + 1,
                stars: previous.stars + (repo.stargazers_count || 0),
                forks: previous.forks + (repo.forks_count || 0)
            });
        });

        return [...stats.entries()]
            .map(([name, value]) => {
                const weighted = (value.count * 14) + (value.stars * 2.1) + (value.forks * 1.3);
                const score = Math.min(96, Math.max(32, Math.round(weighted)));
                return { name, score };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 6);
    }, [data?.repositories]);

    const handleDownloadPdf = () => {
        setIsPreparingPdf(true);
        window.setTimeout(() => {
            window.print();
            setIsPreparingPdf(false);
        }, 120);
    };

    if (loading) {
        return <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-500">Memuat CV...</div>;
    }

    if (error || !data) {
        return <div className="min-h-screen bg-slate-100 flex items-center justify-center text-red-500">{error || 'Data tidak ditemukan.'}</div>;
    }

    const isExecutive = cvTheme === 'executive';
    const themePreset = cvTheme === 'creative'
        ? {
            page: 'bg-[#f5f7eb]',
            panel: 'bg-[#fffef8]/95 border border-amber-200 shadow-[0_12px_38px_-26px_rgba(120,53,15,0.45)]',
            section: 'bg-white/90 border border-amber-100',
            heading: 'text-[#172033]',
            body: 'text-[#334155]',
            subtle: 'text-[#64748b]',
            badge: 'bg-amber-100/80 text-amber-900 border border-amber-200'
        }
        : cvTheme === 'executive'
            ? {
                page: 'bg-[#ecf3f8]',
                panel: 'bg-[#fefefe]/95 border border-[#c8d5e3] shadow-[0_12px_42px_-28px_rgba(15,23,42,0.35)]',
                section: 'bg-white/95 border border-[#d7e0ea]',
                heading: 'text-[#0f172a]',
                body: 'text-[#334155]',
                subtle: 'text-[#54657a]',
                badge: 'bg-[#e1ebf5] text-[#12304d] border border-[#c8d5e3]'
            }
            : {
            page: 'bg-[#eef2ff]',
            panel: 'bg-white/95 border border-slate-200 shadow-[0_12px_40px_-26px_rgba(15,23,42,0.35)]',
            section: 'bg-slate-50/90 border border-slate-200',
            heading: 'text-slate-900',
            body: 'text-slate-700',
            subtle: 'text-slate-500',
            badge: 'bg-slate-100 text-slate-800 border border-slate-200'
        };

    return (
        <div className={`min-h-screen ${themePreset.page} py-7 md:py-10 px-3 md:px-5 print:bg-white print:py-0 relative overflow-hidden ${isExecutive ? 'executive-cv' : ''}`}>
            {!isExecutive && (
                <>
                    <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full blur-3xl opacity-35 pointer-events-none" style={{ background: `${accentColor}40` }}></div>
                    <div className="absolute -bottom-20 right-0 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: `${accentColor}33` }}></div>
                </>
            )}

            <div className="max-w-5xl mx-auto print:max-w-none relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 print:hidden">
                    <Link to={`/p/${data.username}`} className={`inline-flex items-center gap-2 text-sm ${themePreset.subtle} hover:text-slate-900 font-tech`}>
                        <ArrowLeft size={16} /> Kembali ke Portfolio
                    </Link>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                        <button
                            type="button"
                            onClick={() => setSearchParams({ theme: 'ats' })}
                            className={`px-3 py-2 rounded-xl text-sm border font-tech transition-colors ${cvTheme === 'ats' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'}`}
                        >
                            ATS
                        </button>
                        <button
                            type="button"
                            onClick={() => setSearchParams({ theme: 'creative' })}
                            className={`px-3 py-2 rounded-xl text-sm border font-tech transition-colors ${cvTheme === 'creative' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'}`}
                        >
                            Creative
                        </button>
                        <button
                            type="button"
                            onClick={() => setSearchParams({ theme: 'executive' })}
                            className={`px-3 py-2 rounded-xl text-sm border font-tech transition-colors ${cvTheme === 'executive' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'}`}
                        >
                            Executive
                        </button>
                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-semibold"
                        >
                            <FileDown size={16} /> {isPreparingPdf ? 'Menyiapkan PDF...' : 'Download PDF'}
                        </button>
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 hover:from-cyan-400 hover:to-emerald-400 font-semibold"
                        >
                            <Printer size={16} /> Print
                        </button>
                    </div>
                </div>

                <main className={`rounded-3xl p-5 md:p-8 lg:p-10 ${themePreset.panel} print:border-0 print:rounded-none print:shadow-none print:p-0`}>
                    <header className={`relative overflow-hidden rounded-2xl p-5 md:p-7 mb-6 border ${themePreset.section} print:border-slate-200`}>
                        {!isExecutive && (
                            <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full blur-2xl opacity-30" style={{ backgroundColor: `${accentColor}66` }}></div>
                        )}
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-5">
                            <div className="md:col-span-8">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    {data.profile?.avatar_url && (
                                        <img
                                            src={data.profile.avatar_url}
                                            alt="Profile"
                                            className="w-14 h-14 rounded-xl object-cover border border-slate-300 shadow-sm"
                                        />
                                    )}
                                    <p className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-[0.14em] uppercase ${themePreset.badge}`}>
                                        <Sparkles size={12} /> {cvTheme === 'executive' ? 'Executive CV' : 'Smart CV'}
                                    </p>
                                </div>
                                <h1 className={`text-3xl md:text-4xl font-display leading-tight ${themePreset.heading}`}>{data.profile?.name || data.username}</h1>
                                <p className="text-base md:text-lg mt-2 font-semibold" style={{ color: accentColor }}>{data.customization?.jobTitle || 'Software Developer'}</p>
                                {data.customization?.headline && (
                                    <p className={`mt-3 leading-relaxed ${themePreset.body}`}>{data.customization.headline}</p>
                                )}
                                <div className={`flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm ${themePreset.subtle}`}>
                                    <a href={`https://github.com/${data.username}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                                        <Github size={14} /> github.com/{data.username}
                                    </a>
                                    {data.customization?.linkedinUrl && (
                                        <a href={data.customization.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                                            <Linkedin size={14} /> LinkedIn
                                        </a>
                                    )}
                                    {data.profile?.location && (
                                        <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> {data.profile.location}</span>
                                    )}
                                </div>
                            </div>

                            <aside className="md:col-span-4 grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-slate-900 text-white px-3 py-3">
                                    <p className="text-[11px] uppercase tracking-wider text-slate-400">Projects</p>
                                    <p className="text-xl font-bold mt-1">{data.repositories?.length || 0}</p>
                                </div>
                                <div className="rounded-xl bg-slate-900 text-white px-3 py-3">
                                    <p className="text-[11px] uppercase tracking-wider text-slate-400">Stars</p>
                                    <p className="text-xl font-bold mt-1">{totalStars}</p>
                                </div>
                                <div className="rounded-xl bg-slate-900 text-white px-3 py-3">
                                    <p className="text-[11px] uppercase tracking-wider text-slate-400">Forks</p>
                                    <p className="text-xl font-bold mt-1">{totalForks}</p>
                                </div>
                                <div className="rounded-xl bg-slate-900 text-white px-3 py-3">
                                    <p className="text-[11px] uppercase tracking-wider text-slate-400">Top Stack</p>
                                    <p className="text-sm font-semibold mt-1 line-clamp-2">{topLanguages.join(', ') || 'Generalist'}</p>
                                </div>
                            </aside>
                        </div>
                    </header>

                    <section className={`mb-6 rounded-2xl p-5 border ${themePreset.section} print:border-slate-200`}>
                        <h2 className={`text-lg font-semibold mb-2 ${themePreset.heading}`}>Ringkasan</h2>
                        <p className={`${themePreset.body} leading-relaxed`}>
                            {data.profile?.bio || 'Membangun software yang andal, terukur, dan berdampak.'}
                        </p>
                    </section>

                    {isExecutive ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <aside className="lg:col-span-4 space-y-6">
                                {executiveSkills.length > 0 && (
                                    <section className={`rounded-2xl p-5 border ${themePreset.section} print:border-slate-300`}>
                                        <h2 className={`text-lg font-semibold mb-4 inline-flex items-center gap-2 ${themePreset.heading}`}>
                                            <Sparkles size={18} style={{ color: accentColor }} /> Skills Matrix
                                        </h2>
                                        <div className="space-y-3">
                                            {executiveSkills.map((skill) => (
                                                <div key={skill.name}>
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <p className={`text-sm font-medium ${themePreset.heading}`}>{skill.name}</p>
                                                        <p className={`text-xs font-semibold ${themePreset.subtle}`}>{skill.score}%</p>
                                                    </div>
                                                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                                                        <div className="h-full rounded-full transition-all duration-700 executive-accent" style={{ width: `${skill.score}%`, backgroundColor: accentColor }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {educations.length > 0 && (
                                    <section className={`rounded-2xl p-5 border ${themePreset.section} print:border-slate-300`}>
                                        <h2 className={`text-lg font-semibold mb-4 inline-flex items-center gap-2 ${themePreset.heading}`}>
                                            <GraduationCap size={18} style={{ color: accentColor }} /> Pendidikan
                                        </h2>
                                        <div className="space-y-3">
                                            {educations.map((item, index) => (
                                                <article key={`edu-${index}`} className="rounded-xl border border-slate-200 px-4 py-3 bg-white/80">
                                                    <h3 className={`font-semibold ${themePreset.heading}`}>{item.school || '-'}</h3>
                                                    <p className={`text-sm ${themePreset.subtle}`}>{item.degree || '-'}</p>
                                                    <p className="text-xs mt-1" style={{ color: accentColor }}>{item.period || ''}</p>
                                                </article>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {certifications.length > 0 && (
                                    <section className={`rounded-2xl p-5 border ${themePreset.section} print:border-slate-300`}>
                                        <h2 className={`text-lg font-semibold mb-4 inline-flex items-center gap-2 ${themePreset.heading}`}>
                                            <Award size={18} style={{ color: accentColor }} /> Sertifikasi
                                        </h2>
                                        <div className="space-y-2.5">
                                            {certifications.map((item, index) => (
                                                <article key={`cert-${index}`} className="rounded-xl border border-slate-200 px-4 py-3 bg-white/80">
                                                    <p className={`font-medium ${themePreset.heading}`}>{item.title || '-'}</p>
                                                    <p className={`text-sm ${themePreset.subtle}`}>{item.issuer || '-'}</p>
                                                    <div className="mt-1 flex items-center justify-between gap-2">
                                                        {item.year && <span className={`text-xs px-2 py-1 rounded-md ${themePreset.badge}`}>{item.year}</span>}
                                                        {item.credentialUrl && (
                                                            <a href={item.credentialUrl} target="_blank" rel="noreferrer" className={`text-xs inline-flex items-center gap-1 ${themePreset.subtle} hover:text-slate-900 print:hidden`}>
                                                                Credential <ExternalLink size={12} />
                                                            </a>
                                                        )}
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </aside>

                            <div className="lg:col-span-8 space-y-6">
                                {experiences.length > 0 && (
                                    <section className={`rounded-2xl p-5 border ${themePreset.section} print:border-slate-300`}>
                                        <h2 className={`text-lg font-semibold mb-4 inline-flex items-center gap-2 ${themePreset.heading}`}>
                                            <Briefcase size={18} style={{ color: accentColor }} /> Pengalaman
                                        </h2>
                                        <div className="space-y-4">
                                            {experiences.map((item, index) => (
                                                <article key={`exp-${index}`} className="rounded-xl border border-slate-200 px-4 py-3 bg-white/85">
                                                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                                                        <h3 className={`font-semibold ${themePreset.heading}`}>{item.role || '-'}</h3>
                                                        <span className="text-sm font-medium executive-accent" style={{ color: accentColor }}>{item.period || ''}</span>
                                                    </div>
                                                    <p className={`text-sm ${themePreset.subtle}`}>{item.company || '-'}</p>
                                                    {item.summary && <p className={`text-sm mt-1.5 leading-relaxed ${themePreset.body}`}>{item.summary}</p>}
                                                </article>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                <section className={`rounded-2xl p-5 border ${themePreset.section} print:border-slate-300`}>
                                    <h2 className={`text-lg font-semibold mb-4 inline-flex items-center gap-2 ${themePreset.heading}`}>
                                        <FolderGit2 size={18} style={{ color: accentColor }} /> Proyek Pilihan
                                    </h2>
                                    <div className="space-y-3">
                                        {sortedProjects.map((repo) => (
                                            <article key={repo.id || repo.name} className="rounded-xl border border-slate-200 px-4 py-3 bg-white/85">
                                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                                    <a href={repo.html_url} target="_blank" rel="noreferrer" className={`font-medium hover:underline ${themePreset.heading}`}>
                                                        {repo.name}
                                                    </a>
                                                    <span className={`text-[11px] ${themePreset.subtle} inline-flex items-center gap-2`}>
                                                        <span className="inline-flex items-center gap-1"><Code2 size={12} /> {repo.language || 'Code'}</span>
                                                        <span className="inline-flex items-center gap-1"><Star size={12} /> {repo.stargazers_count || 0}</span>
                                                        <span className="inline-flex items-center gap-1"><GitFork size={12} /> {repo.forks_count || 0}</span>
                                                    </span>
                                                </div>
                                                {repo.description && <p className={`text-sm mt-1.5 ${themePreset.body}`}>{repo.description}</p>}
                                            </article>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-7 space-y-6">
                                {experiences.length > 0 && (
                                    <section className={`rounded-2xl p-5 border ${themePreset.section} print:border-slate-200`}>
                                        <h2 className={`text-lg font-semibold mb-4 inline-flex items-center gap-2 ${themePreset.heading}`}>
                                            <Briefcase size={18} style={{ color: accentColor }} /> Pengalaman
                                        </h2>
                                        <div className="relative pl-5">
                                            <div className="absolute left-1.5 top-1 bottom-1 w-px bg-slate-300"></div>
                                            <div className="space-y-4">
                                                {experiences.map((item, index) => (
                                                    <article key={`exp-${index}`} className="relative">
                                                        <span className="absolute -left-[18px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ backgroundColor: accentColor }}></span>
                                                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                                                            <h3 className={`font-semibold ${themePreset.heading}`}>{item.role || '-'}</h3>
                                                            <span className="text-sm font-medium" style={{ color: accentColor }}>{item.period || ''}</span>
                                                        </div>
                                                        <p className={`text-sm ${themePreset.subtle}`}>{item.company || '-'}</p>
                                                        {item.summary && <p className={`text-sm mt-1.5 leading-relaxed ${themePreset.body}`}>{item.summary}</p>}
                                                    </article>
                                                ))}
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {educations.length > 0 && (
                                    <section className={`rounded-2xl p-5 border ${themePreset.section} print:border-slate-200`}>
                                        <h2 className={`text-lg font-semibold mb-4 inline-flex items-center gap-2 ${themePreset.heading}`}>
                                            <GraduationCap size={18} style={{ color: accentColor }} /> Pendidikan
                                        </h2>
                                        <div className="space-y-4">
                                            {educations.map((item, index) => (
                                                <article key={`edu-${index}`} className="rounded-xl border border-slate-200/80 px-4 py-3 bg-white/70">
                                                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                                                        <h3 className={`font-semibold ${themePreset.heading}`}>{item.school || '-'}</h3>
                                                        <span className="text-sm font-medium" style={{ color: accentColor }}>{item.period || ''}</span>
                                                    </div>
                                                    <p className={`text-sm ${themePreset.subtle}`}>{item.degree || '-'}</p>
                                                    {item.summary && <p className={`text-sm mt-1.5 leading-relaxed ${themePreset.body}`}>{item.summary}</p>}
                                                </article>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>

                            <div className="lg:col-span-5 space-y-6">
                                {certifications.length > 0 && (
                                    <section className={`rounded-2xl p-5 border ${themePreset.section} print:border-slate-200`}>
                                        <h2 className={`text-lg font-semibold mb-4 inline-flex items-center gap-2 ${themePreset.heading}`}>
                                            <Award size={18} style={{ color: accentColor }} /> Sertifikasi
                                        </h2>
                                        <div className="space-y-2.5">
                                            {certifications.map((item, index) => (
                                                <article key={`cert-${index}`} className="rounded-xl border border-slate-200/80 px-4 py-3 bg-white/80">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <p className={`font-medium ${themePreset.heading}`}>{item.title || '-'}</p>
                                                            <p className={`text-sm ${themePreset.subtle}`}>{item.issuer || '-'}</p>
                                                        </div>
                                                        {item.year && <span className={`text-xs px-2 py-1 rounded-md ${themePreset.badge}`}>{item.year}</span>}
                                                    </div>
                                                    {item.credentialUrl && (
                                                        <a href={item.credentialUrl} target="_blank" rel="noreferrer" className={`mt-2 inline-flex items-center gap-1 text-xs ${themePreset.subtle} hover:text-slate-900 print:hidden`}>
                                                            Credential <ExternalLink size={12} />
                                                        </a>
                                                    )}
                                                </article>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                <section className={`rounded-2xl p-5 border ${themePreset.section} print:border-slate-200`}>
                                    <h2 className={`text-lg font-semibold mb-4 inline-flex items-center gap-2 ${themePreset.heading}`}>
                                        <FolderGit2 size={18} style={{ color: accentColor }} /> Proyek Pilihan
                                    </h2>
                                    <div className="space-y-3">
                                        {sortedProjects.map((repo) => (
                                            <article key={repo.id || repo.name} className="rounded-xl border border-slate-200/80 px-4 py-3 bg-white/80">
                                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                                    <a href={repo.html_url} target="_blank" rel="noreferrer" className={`font-medium hover:underline ${themePreset.heading}`}>
                                                        {repo.name}
                                                    </a>
                                                    <span className={`text-[11px] ${themePreset.subtle} inline-flex items-center gap-2`}>
                                                        <span className="inline-flex items-center gap-1"><Code2 size={12} /> {repo.language || 'Code'}</span>
                                                        <span className="inline-flex items-center gap-1"><Star size={12} /> {repo.stargazers_count || 0}</span>
                                                        <span className="inline-flex items-center gap-1"><GitFork size={12} /> {repo.forks_count || 0}</span>
                                                    </span>
                                                </div>
                                                {repo.description && <p className={`text-sm mt-1.5 ${themePreset.body}`}>{repo.description}</p>}
                                            </article>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}

                    <section className="mt-6 print:hidden">
                        <p className={`text-xs ${themePreset.subtle}`}>
                            Tip: Gunakan mode ATS untuk screening HR, Creative untuk personal branding, dan Executive untuk tampilan corporate premium.
                        </p>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default CVView;
