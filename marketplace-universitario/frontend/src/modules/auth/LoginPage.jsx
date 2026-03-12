import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useToast } from '../../components/ui/Toast.jsx';

function EyeIcon({ open }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function MLogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="4" fill="#990100" />
      <path d="M5 21V7l9 10 9-10v14" stroke="#F6F6F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate     = useNavigate();
  const [searchParams] = useSearchParams();
  const login        = useAuthStore((s) => s.login);
  const { addToast } = useToast();

  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetSuccess = searchParams.get('reset') === 'success';

  const handleChange  = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await login(form.email, form.password);
      addToast(`Bienvenido de vuelta, ${user.email.split('@')[0]}`, 'success');
      if (user.role === 'ADMIN')           navigate('/admin');
      else if (user.role === 'EMPRENDEDOR') navigate('/dashboard');
      else                                  navigate('/');
    } catch (err) {
      setError(err.userMessage || 'Error al iniciar sesión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F6F6F6]">

      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col justify-between p-12 bg-white border-r border-[#E8E8E8]">
        {/* Background patterns */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at 80% 20%, rgba(153,1,0,0.06) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(153,1,0,0.04) 0%, transparent 50%)'
        }} />
        <div className="absolute inset-0 grid-bg opacity-40" />

        {/* Top: brand */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 mb-16">
            <MLogoMark />
            <span className="font-display font-bold text-[#1A1A1A] text-lg">MktUni</span>
          </Link>

          <p className="text-xs font-mono text-[#990100] uppercase tracking-widest mb-4">
            Bienvenido de vuelta
          </p>
          <h2 className="font-display text-[#1A1A1A] text-3xl font-extrabold leading-snug mb-4">
            Tu comunidad<br />universitaria<br />
            <span className="gradient-text">está aquí</span>
          </h2>
          <p className="text-[#666666] text-sm leading-relaxed max-w-xs">
            Inicia sesión para acceder al marketplace y conectar con emprendedores de tu universidad.
          </p>
        </div>

        {/* Bottom: perks */}
        <div className="relative z-10 space-y-3">
          {[
            { icon: '🛍️', text: 'Compra productos locales y únicos' },
            { icon: '💼', text: 'Vende tus productos y servicios' },
            { icon: '🤝', text: 'Apoya el emprendimiento universitario' },
          ].map(({ icon, text }, i) => (
            <div
              key={text}
              className="flex items-center gap-3 bg-[#F6F6F6] border border-[#E8E8E8] rounded-xl px-4 py-3 animate-in hover:border-[#990100] transition-colors duration-200"
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <span className="text-xl">{icon}</span>
              <span className="text-sm text-[#666666]">{text}</span>
            </div>
          ))}

          {/* Social proof */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#E8E8E8]">
            <div className="flex -space-x-2">
              {['A','B','C','D'].map((l) => (
                <div key={l} className="w-7 h-7 rounded-full bg-[#990100] flex items-center justify-center text-[10px] font-bold text-white border-2 border-white">
                  {l}
                </div>
              ))}
            </div>
            <p className="text-xs text-[#999999]">
              <span className="text-[#333333] font-medium">+127 estudiantes</span> ya activos
            </p>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-[#F6F6F6]">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
            <MLogoMark />
            <span className="font-display font-bold text-[#1A1A1A]">MktUni</span>
          </Link>

          <div className="animate-in">
            <h1 className="font-display text-3xl font-extrabold text-[#1A1A1A] mb-1">
              Iniciar sesión
            </h1>
            <p className="text-[#666666] text-sm mb-8">
              Ingresa con tu correo institucional.
            </p>
          </div>

          {/* Success banner */}
          {resetSuccess && (
            <div className="mb-5 p-4 rounded-xl bg-[#D1FAE5] border border-[#6EE7B7] text-sm text-[#065F46] flex items-start gap-2 animate-in">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Contraseña actualizada exitosamente. Inicia sesión con tu nueva contraseña.
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="mb-5 p-4 rounded-xl bg-[rgba(153,1,0,0.06)] border border-[rgba(153,1,0,0.20)] text-sm text-[#990100] flex items-start gap-2 animate-in">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 animate-in delay-1">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#666666]">
                Correo institucional
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
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

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#666666]">Contraseña</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#990100] hover:text-[#B90504] transition-colors duration-200"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Tu contraseña"
                  required
                  autoComplete="current-password"
                  className="
                    w-full px-4 py-3 pr-11 rounded-xl text-sm
                    bg-white text-[#1A1A1A]
                    border-[1.5px] border-[#E8E8E8]
                    placeholder:text-[#999999]
                    hover:border-[#CCCCCC]
                    focus:outline-none focus:border-[#990100] focus:ring-[3px] focus:ring-[rgba(153,1,0,0.10)]
                    transition-all duration-200
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#666666] transition-colors"
                  aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full py-3 px-6 rounded-xl
                text-sm font-semibold text-[#F6F6F6]
                bg-[#990100]
                shadow-glow-primary animate-glow-pulse
                hover:bg-[#B90504] hover:-translate-y-0.5 active:translate-y-0
                disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:animate-none
                transition-all duration-200
                flex items-center justify-center gap-2
              "
            >
              {isLoading && (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin-ring" />
              )}
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-sm text-[#999999] mt-6 animate-in delay-2">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-[#990100] font-medium hover:text-[#B90504] transition-colors duration-200">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
