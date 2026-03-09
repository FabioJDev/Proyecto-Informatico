import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';

function DiamondLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L18 10L10 18L2 10L10 2Z" fill="url(#fpDiamond)" />
      <defs>
        <linearGradient id="fpDiamond" x1="2" y1="2" x2="18" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6C63FF" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.userMessage || 'Error al enviar el correo. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center px-4">
        <div className="glass rounded-2xl border border-emerald-500/20 p-10 max-w-md w-full text-center animate-in">
          <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-3">Revisa tu correo</h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-2">
            Si el correo <strong className="text-[var(--text-primary)]">{email}</strong> está registrado, recibirás instrucciones para restablecer tu contraseña en los próximos minutos.
          </p>
          <p className="text-xs text-[var(--text-muted)] mb-8">Revisa también tu carpeta de spam.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-[var(--accent-primary-soft)] font-medium hover:text-[var(--accent-primary)] text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <DiamondLogo />
          <span className="font-display font-bold text-[var(--text-primary)]">MktUni</span>
        </Link>

        <div className="glass rounded-2xl border border-[var(--border-subtle)] p-8 animate-in">
          {/* Icon */}
          <div className="mx-auto mb-6 w-14 h-14 rounded-2xl bg-[var(--accent-primary-dim)] border border-[var(--accent-primary)]/20 flex items-center justify-center">
            <svg className="w-7 h-7 text-[var(--accent-primary-soft)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>

          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-2 text-center">
            Recupera tu contraseña
          </h1>
          <p className="text-[var(--text-secondary)] text-sm text-center mb-7 leading-relaxed">
            Ingresa tu correo institucional y te enviaremos instrucciones para restablecer tu contraseña.
          </p>

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Correo institucional
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@universidad.edu.co"
                required
                autoComplete="email"
                className="
                  w-full px-4 py-3 rounded-xl text-sm
                  bg-[var(--bg-surface)] text-[var(--text-primary)]
                  border border-[var(--border-subtle)]
                  placeholder:text-[var(--text-muted)]
                  hover:border-[var(--border-strong)]
                  focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20
                  transition-all duration-200
                "
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full py-3 px-6 rounded-xl
                text-sm font-semibold text-white
                bg-gradient-primary shadow-glow-primary animate-glow-pulse
                hover:-translate-y-0.5 active:translate-y-0
                disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:animate-none
                transition-all duration-200
                flex items-center justify-center gap-2
              "
            >
              {isLoading && (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin-ring" />
              )}
              {isLoading ? 'Enviando...' : 'Enviar instrucciones'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
