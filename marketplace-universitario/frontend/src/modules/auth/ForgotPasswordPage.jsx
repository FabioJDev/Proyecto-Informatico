import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';

function MLogoMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="4" fill="#990100" />
      <path d="M5 21V7l9 10 9-10v14" stroke="#F6F6F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-[#D1FAE5] p-10 max-w-md w-full text-center animate-in shadow-card-hover">
          <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-[#D1FAE5] border border-[#6EE7B7] flex items-center justify-center">
            <svg className="w-8 h-8 text-[#1A7A4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold text-[#1A1A1A] mb-3">Revisa tu correo</h2>
          <p className="text-[#666666] text-sm leading-relaxed mb-2">
            Si el correo <strong className="text-[#1A1A1A]">{email}</strong> está registrado, recibirás instrucciones para restablecer tu contraseña en los próximos minutos.
          </p>
          <p className="text-xs text-[#999999] mb-8">Revisa también tu carpeta de spam.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-[#990100] font-medium hover:text-[#B90504] text-sm transition-colors"
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
    <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <MLogoMark />
          <span className="font-display font-bold text-[#1A1A1A]">MktUni</span>
        </Link>

        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-8 animate-in shadow-sm">
          {/* Icon */}
          <div className="mx-auto mb-6 w-14 h-14 rounded-2xl bg-[rgba(153,1,0,0.06)] border border-[rgba(153,1,0,0.20)] flex items-center justify-center">
            <svg className="w-7 h-7 text-[#990100]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>

          <h1 className="font-display text-2xl font-bold text-[#1A1A1A] mb-2 text-center">
            Recupera tu contraseña
          </h1>
          <p className="text-[#666666] text-sm text-center mb-7 leading-relaxed">
            Ingresa tu correo institucional y te enviaremos instrucciones para restablecer tu contraseña.
          </p>

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-[rgba(153,1,0,0.06)] border border-[rgba(153,1,0,0.20)] text-sm text-[#990100]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#666666]">
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
                  bg-white text-[#1A1A1A]
                  border-[1.5px] border-[#E8E8E8]
                  placeholder:text-[#999999]
                  hover:border-[#CCCCCC]
                  focus:outline-none focus:border-[#990100] focus:ring-[3px] focus:ring-[rgba(153,1,0,0.10)]
                  transition-all duration-200
                "
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full py-3 px-6 rounded-xl
                text-sm font-semibold text-[#F6F6F6]
                bg-[#990100] shadow-glow-primary animate-glow-pulse
                hover:bg-[#B90504] hover:-translate-y-0.5 active:translate-y-0
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
              className="inline-flex items-center gap-1 text-sm text-[#999999] hover:text-[#666666] transition-colors"
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
