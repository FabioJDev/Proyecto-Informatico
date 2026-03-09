import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useToast } from '../../components/ui/Toast.jsx';

function getStrength(password) {
  let score = 0;
  if (password.length >= 8)          score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[0-9]/.test(password))        score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const strengthLabel = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-[var(--accent-primary-soft)]', 'bg-emerald-400'];
const strengthText  = ['', 'text-red-400', 'text-amber-400', 'text-[var(--accent-primary-soft)]', 'text-emerald-400'];

function PasswordStrength({ password }) {
  if (!password) return null;
  const score = getStrength(password);
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? strengthColor[score] : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-mono ${strengthText[score]}`}>
        Seguridad: {strengthLabel[score]}
      </p>
    </div>
  );
}

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

function DiamondLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L18 10L10 18L2 10L10 2Z" fill="url(#regDiamond)" />
      <defs>
        <linearGradient id="regDiamond" x1="2" y1="2" x2="18" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6C63FF" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const inputClass = (hasError) => `
  w-full px-4 py-3 rounded-xl text-sm
  bg-[var(--bg-surface)] text-[var(--text-primary)]
  border placeholder:text-[var(--text-muted)]
  hover:border-[var(--border-strong)]
  focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20
  transition-all duration-200
  ${hasError
    ? 'border-red-500/60 bg-red-500/5 focus:ring-red-500/20 focus:border-red-500'
    : 'border-[var(--border-subtle)]'
  }
`;

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const { addToast } = useToast();

  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', role: 'COMPRADOR' });
  const [showPw,  setShowPw]  = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [errors,  setErrors]  = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email)    errs.email    = 'El correo es requerido.';
    if (!form.password) errs.password = 'La contraseña es requerida.';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Las contraseñas no coinciden.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setApiError('');
    setIsLoading(true);
    try {
      const user = await register(form.email, form.password, form.confirmPassword, form.role);
      addToast('¡Bienvenido al Marketplace! Tu cuenta fue creada exitosamente.', 'success');
      if (user.role === 'EMPRENDEDOR') navigate('/profile/edit');
      else navigate('/');
    } catch (err) {
      if (err.validationErrors) {
        const fieldErrors = {};
        err.validationErrors.forEach(({ field, message }) => { fieldErrors[field] = message; });
        setErrors(fieldErrors);
      } else {
        setApiError(err.userMessage || 'Error al registrarse. Intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    {
      value: 'EMPRENDEDOR',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      title: 'Quiero vender',
      subtitle: 'Publica productos y servicios',
    },
    {
      value: 'COMPRADOR',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      title: 'Quiero comprar',
      subtitle: 'Explora el catálogo universitario',
    },
  ];

  return (
    <div className="min-h-screen flex">

      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/08 via-[var(--bg-surface)] to-[var(--accent-secondary)]/06" />
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-amber-500/8 blur-3xl" />

        {/* Brand */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 mb-16">
            <DiamondLogo />
            <span className="font-display font-bold text-[var(--text-primary)] text-lg">MktUni</span>
          </Link>

          <p className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-4">
            Únete al marketplace
          </p>
          <h2 className="font-display text-white text-3xl font-bold leading-snug mb-4">
            Conecta con tu<br />comunidad<br />
            <span className="gradient-text">universitaria</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-xs">
            Únete a cientos de estudiantes que ya compran y venden dentro de su universidad.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {[
            { icon: '🚀', text: 'Emprendedores vendiendo sus productos' },
            { icon: '🎓', text: 'Comunidad universitaria activa' },
            { icon: '🔒', text: 'Plataforma segura y confiable' },
          ].map(({ icon, text }, i) => (
            <div
              key={text}
              className="flex items-center gap-3 glass rounded-xl px-4 py-3 border border-[var(--border-subtle)] animate-in"
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <span className="text-xl">{icon}</span>
              <span className="text-sm text-[var(--text-secondary)]">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0 bg-[var(--bg-base)]" />
        <div className="w-full max-w-md relative z-10">

          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <DiamondLogo />
            <span className="font-display font-bold text-[var(--text-primary)]">MktUni</span>
          </Link>

          <div className="animate-in">
            <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-1">
              Únete al Marketplace
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mb-6">
              Usa tu correo institucional para registrarte.
            </p>
          </div>

          {apiError && (
            <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400 flex items-start gap-2 animate-in">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 animate-in delay-1">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Correo institucional <span className="text-[var(--accent-primary-soft)]">*</span>
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tu@universidad.edu.co"
                required
                autoComplete="email"
                className={inputClass(!!errors.email)}
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Contraseña <span className="text-[var(--accent-primary-soft)]">*</span>
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
                  required
                  autoComplete="new-password"
                  className={inputClass(!!errors.password) + ' pr-11'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Confirmar contraseña <span className="text-[var(--accent-primary-soft)]">*</span>
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showCpw ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repite tu contraseña"
                  required
                  autoComplete="new-password"
                  className={inputClass(!!errors.confirmPassword) + ' pr-11'}
                />
                <button
                  type="button"
                  onClick={() => setShowCpw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  <EyeIcon open={showCpw} />
                </button>
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <div className="absolute right-9 top-1/2 -translate-y-1/2 text-emerald-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
            </div>

            {/* Role selector */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Tipo de cuenta <span className="text-[var(--accent-primary-soft)]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map(({ value, icon, title, subtitle }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, role: value }))}
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-xl border-2
                      text-sm font-medium transition-all duration-200
                      ${form.role === value
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-dim)] text-[var(--accent-primary-soft)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-secondary)]'
                      }
                    `}
                  >
                    <span className={form.role === value ? 'text-[var(--accent-primary-soft)]' : 'text-[var(--text-muted)]'}>
                      {icon}
                    </span>
                    <div className="text-center">
                      <p className="font-semibold leading-tight">{title}</p>
                      <p className="text-xs font-normal text-[var(--text-muted)] mt-0.5 leading-tight">{subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
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
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-6 animate-in delay-2">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-[var(--accent-primary-soft)] font-medium hover:text-[var(--accent-primary)] transition-colors">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
