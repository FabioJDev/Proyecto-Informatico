import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import { useAuthStore } from '../../store/authStore.js';

/* ── Animated counter ── */
function CountUp({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1200;
        const step = Math.ceil(target / (duration / 16));
        let cur = 0;
        const timer = setInterval(() => {
          cur = Math.min(cur + step, target);
          setCount(cur);
          if (cur >= target) clearInterval(timer);
        }, 16);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Feature card ── */
function FeatureCard({ icon, title, desc, delay }) {
  return (
    <div
      className={`
        group glass p-7 text-center
        hover:border-[var(--accent-primary)]/30 hover:-translate-y-1
        transition-all duration-300
        animate-in ${delay}
      `}
      style={{ borderRadius: '4px 16px 4px 16px' }}
    >
      <div className="
        mx-auto mb-5 w-14 h-14 rounded-xl
        bg-[var(--accent-primary-dim)] border border-[var(--accent-primary)]/20
        flex items-center justify-center
        text-[var(--accent-primary-soft)]
        group-hover:bg-[var(--accent-primary-dim)] group-hover:shadow-glow-primary
        transition-all duration-300
      ">
        {icon}
      </div>
      <h3 className="font-display font-bold text-[var(--text-primary)] text-lg mb-2">{title}</h3>
      <p className="text-[var(--text-muted)] text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

const FEATURES = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
    title: 'Regístrate',
    desc: 'Crea tu cuenta con tu correo institucional en menos de 2 minutos.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'Explora',
    desc: 'Descubre productos y servicios únicos de emprendedores de tu universidad.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Compra o vende',
    desc: 'Realiza pedidos directamente a los emprendedores o publica tus propios productos.',
  },
];

const STATS = [
  { value: 127, suffix: '+', label: 'Emprendedores' },
  { value: 830, suffix: '+', label: 'Productos' },
  { value: 48,  suffix: '★', label: 'Calificación' },
];

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F6]">
      <Navbar />

      {/* ── HERO — asymmetric 65/35 ── */}
      <section className="relative overflow-hidden grid-bg bg-[#F6F6F6] py-24 sm:py-32 px-4">
        {/* Faded watermark */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden="true"
        >
          <span
            className="font-display font-extrabold uppercase whitespace-nowrap"
            style={{
              fontSize: '8vw',
              color: 'rgba(220,30,60,0.06)',
              letterSpacing: '0.2em',
              transform: 'translateY(10%)',
            }}
          >
            MARKETPLACE
          </span>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-0">

            {/* Left — 65% — Headline + CTAs */}
            <div className="lg:w-[65%] lg:pr-12">
              {/* Eyebrow */}
              <div className="animate-in delay-1 inline-flex items-center gap-2 px-4 py-1.5 glass border border-[var(--accent-primary)]/30 text-xs font-mono font-medium text-[var(--accent-primary-soft)] uppercase tracking-widest mb-8" style={{ borderRadius: '2px 12px 2px 12px' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse-dot" />
                Marketplace Universitario
              </div>

              {/* Mixed-weight headline */}
              <h1 className="leading-[1.05] tracking-tight mb-6 animate-in delay-2">
                <span className="block font-body font-normal text-[var(--text-muted)] text-3xl sm:text-4xl lg:text-5xl">
                  Conecta tu
                </span>
                <span className="block font-display font-extrabold text-[var(--text-primary)] text-5xl sm:text-6xl lg:text-7xl uppercase tracking-tight">
                  TALENTO
                </span>
                <span className="block font-body font-normal text-[var(--text-muted)] text-3xl sm:text-4xl lg:text-5xl">
                  con el campus
                </span>
              </h1>

              <p className="text-[var(--text-secondary)] text-lg max-w-lg mb-10 leading-relaxed animate-in delay-3">
                Compra y vende dentro de tu comunidad universitaria. Apoya el emprendimiento local, descubre productos únicos.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 animate-in delay-4">
                {isAuthenticated ? (
                  user?.role === 'EMPRENDEDOR' ? (
                    <Link
                      to="/dashboard"
                      className="
                        inline-flex items-center justify-center
                        px-8 py-3.5 text-base font-semibold text-white
                        bg-[var(--accent-primary)]
                        hover:bg-[var(--accent-primary-soft)] hover:-translate-y-0.5
                        shadow-glow-primary animate-glow-pulse
                        transition-all duration-200
                      "
                      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)' }}
                    >
                      Ir a mi dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/products"
                      className="
                        inline-flex items-center justify-center
                        px-8 py-3.5 text-base font-semibold text-white
                        bg-[var(--accent-primary)]
                        hover:bg-[var(--accent-primary-soft)] hover:-translate-y-0.5
                        shadow-glow-primary animate-glow-pulse
                        transition-all duration-200
                      "
                      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)' }}
                    >
                      Ver catálogo →
                    </Link>
                  )
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="
                        inline-flex items-center justify-center
                        px-8 py-3.5 text-base font-semibold text-white
                        bg-[var(--accent-primary)]
                        hover:bg-[var(--accent-primary-soft)] hover:-translate-y-0.5
                        shadow-glow-primary animate-glow-pulse
                        transition-all duration-200
                      "
                      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)' }}
                    >
                      Crear cuenta gratis
                    </Link>
                    <Link
                      to="/login"
                      className="
                        inline-flex items-center justify-center
                        px-8 py-3.5 rounded-xl text-base font-semibold text-[var(--text-primary)]
                        glass border border-[var(--border-strong)]
                        hover:border-[var(--accent-primary)]/40 hover:-translate-y-0.5
                        transition-all duration-200 backdrop-blur-sm
                      "
                    >
                      Iniciar sesión
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right — 35% — Stats column with vertical red divider */}
            <div className="lg:w-[35%] lg:border-l-2 lg:border-[var(--accent-primary)] lg:pl-10 animate-in delay-5">
              <div className="flex lg:flex-col gap-6 flex-wrap">
                {STATS.map(({ value, suffix, label }, i) => (
                  <div key={label} className="flex-1 min-w-[80px]" style={{ animationDelay: `${i * 0.15}s` }}>
                    <p className="font-mono font-bold text-3xl lg:text-4xl text-[var(--accent-primary-soft)]">
                      <CountUp target={value} suffix={suffix} />
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--text-muted)] mt-1">
                      {label}
                    </p>
                    {i < STATS.length - 1 && (
                      <div className="hidden lg:block mt-6 w-8 h-px bg-[var(--border-strong)]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24 w-full">
        <div className="text-center mb-14">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-3 animate-in">
            ¿Cómo funciona?
          </h2>
          <p className="text-[var(--text-muted)] text-sm animate-in delay-1">
            Tres pasos para empezar en el marketplace
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {FEATURES.map(({ icon, title, desc }, i) => (
            <FeatureCard
              key={title}
              icon={icon}
              title={title}
              desc={desc}
              delay={`delay-${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      {!isAuthenticated && (
        <section className="px-4 pb-24">
          <div
            className="max-w-3xl mx-auto bg-[#333333] p-12 text-center relative overflow-hidden"
            style={{ borderRadius: '4px 24px 4px 24px' }}
          >
            <div className="relative z-10">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
                ¿Tienes un emprendimiento?
              </h2>
              <p className="text-[#CCCCCC] mb-8 max-w-md mx-auto">
                Publica tus productos y llega a toda la comunidad universitaria sin comisiones.
              </p>
              <Link
                to="/register"
                className="
                  inline-flex items-center justify-center
                  px-8 py-3.5 text-base font-semibold text-white
                  bg-[var(--accent-primary)]
                  hover:bg-[var(--accent-primary-soft)] hover:-translate-y-0.5
                  shadow-glow-primary animate-glow-pulse
                  transition-all duration-200
                "
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)' }}
              >
                Empieza a vender gratis
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
