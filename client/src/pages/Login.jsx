// client/src/pages/Login.jsx
import { useEffect, useRef, useState } from 'react';
import { Github, Sparkles, Code2, Volume2, VolumeX } from 'lucide-react';
import { AUTH_GITHUB_URL } from '../config/api';

const TYPEWRITER_WORDS = ['Shine Everywhere.', 'Get Hired Faster.', 'Tell Better Story.'];

const Login = () => {
  const sceneRef = useRef(null);
  const [typedText, setTypedText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [motionLite, setMotionLite] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');

    const detectCapability = () => {
      const isReduced = media.matches;
      const memory = navigator.deviceMemory || 8;
      const cores = navigator.hardwareConcurrency || 8;
      const isTouchPrimary = window.matchMedia('(pointer: coarse)').matches;
      const lowEnd = memory <= 4 || cores <= 4 || isTouchPrimary;

      setReducedMotion(isReduced);
      setMotionLite(!isReduced && lowEnd);
    };

    detectCapability();
    media.addEventListener('change', detectCapability);

    return () => media.removeEventListener('change', detectCapability);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setIntroDone(true);
      return undefined;
    }

    const introTimer = window.setTimeout(() => setIntroDone(true), motionLite ? 700 : 1200);
    return () => window.clearTimeout(introTimer);
  }, [reducedMotion, motionLite]);

  useEffect(() => {
    if (reducedMotion) {
      setTypedText(TYPEWRITER_WORDS[0]);
      return undefined;
    }

    const currentWord = TYPEWRITER_WORDS[wordIndex % TYPEWRITER_WORDS.length];
    const nextText = isDeleting
      ? currentWord.slice(0, Math.max(0, typedText.length - 1))
      : currentWord.slice(0, typedText.length + 1);

    const timeout = window.setTimeout(() => {
      setTypedText(nextText);

      if (!isDeleting && nextText === currentWord) {
        window.setTimeout(() => setIsDeleting(true), 1100);
      }

      if (isDeleting && nextText.length === 0) {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % TYPEWRITER_WORDS.length);
      }
    }, isDeleting ? 48 : 82);

    return () => window.clearTimeout(timeout);
  }, [typedText, isDeleting, wordIndex, reducedMotion]);

  const playLaunchSound = () => {
    if (!soundEnabled) return;

    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;

    const context = new Context();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(660, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(980, context.currentTime + 0.18);

    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.04, context.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.2);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.22);

    window.setTimeout(() => context.close(), 280);
  };

  const handleLogin = () => {
    if (isRedirecting) return;
    playLaunchSound();
    setIsRedirecting(true);
    window.setTimeout(() => {
      window.location.href = AUTH_GITHUB_URL;
    }, reducedMotion ? 120 : 920);
  };

  const handleMouseMove = (event) => {
    if (reducedMotion || motionLite) return;

    const element = sceneRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 14;

    element.style.setProperty('--parallax-x', `${x}px`);
    element.style.setProperty('--parallax-y', `${y}px`);
  };

  return (
    <div
      ref={sceneRef}
      onMouseMove={handleMouseMove}
      className={`min-h-screen relative overflow-hidden px-4 py-10 md:py-16 login-scene ${motionLite ? 'motion-lite' : ''} ${reducedMotion ? 'motion-reduced' : ''}`}
    >
      <div className="login-gradient-orb orb-a parallax-depth-a" />
      <div className="login-gradient-orb orb-b parallax-depth-b" />
      <div className="login-gradient-orb orb-c parallax-depth-c" />

      <div className="login-particle-layer parallax-depth-c" aria-hidden>
        {Array.from({ length: motionLite ? 10 : 18 }).map((_, idx) => (
          <span
            key={idx}
            className="login-particle"
            style={{
              left: `${(idx * 17) % 100}%`,
              animationDelay: `${idx * 0.35}s`,
              animationDuration: `${7 + (idx % 5)}s`
            }}
          />
        ))}
      </div>

      {!introDone && (
        <div className="login-intro-overlay" aria-hidden>
          <div className="login-intro-brand">
            <span className="font-display text-2xl text-white">Auto Portfolio</span>
            <span className="font-tech text-xs text-cyan-200">initializing experience...</span>
            <div className="login-intro-bar" />
          </div>
        </div>
      )}

      <div className={`relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 md:gap-8 items-stretch login-parallax-layer ${introDone ? 'login-enter' : 'opacity-0'}`}>
        <section className="glass-card rounded-3xl p-8 md:p-10 border border-cyan-300/20 login-reveal-up parallax-depth-a">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-300/40 text-cyan-200 text-xs font-tech mb-6">
            <Sparkles size={14} /> Next Gen Portfolio System
          </div>

          <h1 className="font-display text-4xl md:text-6xl text-white leading-[1.05] tracking-tight">
            Build Once,
            <br />
            <span className="login-typewriter">{typedText}<span className="login-caret">|</span></span>
          </h1>

          <p className="text-slate-300 mt-6 max-w-xl leading-relaxed text-base md:text-lg">
            Ubah profil GitHub jadi landing portfolio yang berkarakter, interaktif, dan siap dibagikan ke recruiter atau klien.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="glass-card rounded-xl p-4 border border-slate-700/40 login-card-pop" style={{ animationDelay: '0.1s' }}>
              <p className="font-tech text-[11px] text-slate-400">SYNC</p>
              <p className="text-sm font-semibold text-white mt-1">GitHub + README Story</p>
            </div>
            <div className="glass-card rounded-xl p-4 border border-slate-700/40 login-card-pop" style={{ animationDelay: '0.2s' }}>
              <p className="font-tech text-[11px] text-slate-400">STYLE</p>
              <p className="text-sm font-semibold text-white mt-1">Multi Theme Experience</p>
            </div>
            <div className="glass-card rounded-xl p-4 border border-slate-700/40 login-card-pop" style={{ animationDelay: '0.3s' }}>
              <p className="font-tech text-[11px] text-slate-400">OUTPUT</p>
              <p className="text-sm font-semibold text-white mt-1">Public Page + CV + OG</p>
            </div>
          </div>
        </section>

        <section className="glass-card rounded-3xl p-8 md:p-10 text-center border border-slate-700/50 login-reveal-up parallax-depth-b" style={{ animationDelay: '0.08s' }}>
          <div className="inline-flex items-center justify-center p-5 bg-cyan-400/10 rounded-2xl border border-cyan-300/30 mb-6 login-float">
            <Code2 size={44} className="text-cyan-300" />
          </div>

          <h2 className="font-display text-3xl md:text-4xl text-white">Auto Portfolio</h2>
          <p className="text-slate-400 text-sm md:text-base mt-3 mb-8 leading-relaxed">
            Login, pilih repositori, sesuaikan branding, lalu publish halaman profesionalmu dalam hitungan detik.
          </p>

          <div className="glass-card rounded-xl border border-emerald-300/30 p-3 mb-5 text-left font-tech text-xs text-emerald-200 login-terminal">
            <p>&gt; initializing portfolio engine...</p>
            <p>&gt; fetching your github profile...</p>
            <p>&gt; ready to generate.</p>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="mb-5 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-xs font-tech text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            Sound Cue: {soundEnabled ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={handleLogin}
            disabled={isRedirecting}
            className={`group relative w-full flex justify-center items-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-semibold rounded-xl transition-all duration-300 border border-cyan-300/50 overflow-hidden login-button-glow ${isRedirecting ? 'login-button-launch' : ''}`}
          >
            <div className="absolute inset-0 w-full h-full login-button-shine" />
            <span className={`login-launch-ring ${isRedirecting ? 'active' : ''}`} />
            <Github size={22} className="relative z-10" />
            <span className="relative z-10">{isRedirecting ? 'Menghubungkan...' : 'Masuk dengan GitHub'}</span>
            <Sparkles size={18} className="relative z-10" />
          </button>

          <p className="text-center text-slate-500 text-xs mt-6 font-tech">
            OAuth aman. Data yang dipakai hanya sesuai izin akunmu.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Login;