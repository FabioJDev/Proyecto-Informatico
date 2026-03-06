import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useToast } from '../../components/ui/Toast.jsx';

// Password strength helpers
function getStrength(password) {
  let score = 0;
  if (password.length >= 8)         score++;
  if (/[A-Z]/.test(password))       score++;
  if (/[0-9]/.test(password))       score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score; // 0-4
}

const strengthLabel = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];

function PasswordStrength({ password }) {
  if (!password) return null;
  const score = getStrength(password);
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i <= score ? strengthColor[score] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${score <= 1 ? 'text-red-500' : score === 2 ? 'text-yellow-600' : score === 3 ? 'text-blue-600' : 'text-green-600'}`}>
        Seguridad: {strengthLabel[score]}
      </p>
    </div>
  );
}

function EyeIcon({ open }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const { addToast } = useToast();

  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', role: 'COMPRADOR' });
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [errors, setErrors]   = useState({});
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
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      title: 'Quiero vender',
      subtitle: 'Publica productos y servicios',
    },
    {
      value: 'COMPRADOR',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      title: 'Quiero comprar',
      subtitle: 'Explora el catálogo universitario',
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* ── Left decorative panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-5/12 bg-primary-600 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-auth-pattern opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <span className="text-white font-heading font-bold text-lg">Marketplace Universitario</span>
          </div>
          <h2 className="font-heading text-white text-3xl font-bold leading-snug">
            Conecta con tu<br />comunidad universitaria
          </h2>
          <p className="text-primary-200 mt-4 text-base leading-relaxed">
            Únete a cientos de estudiantes que ya compran y venden dentro de su universidad.
          </p>
        </div>

        {/* Testimonial / stats */}
        <div className="relative z-10 space-y-4">
          {[
            { icon: '🚀', text: 'Emprendedores vendiendo sus productos' },
            { icon: '🎓', text: 'Comunidad universitaria activa' },
            { icon: '🔒', text: 'Plataforma segura y confiable' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-primary-100 text-sm">
              <span className="text-xl">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#FAFAF8]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              </svg>
            </div>
            <span className="font-heading font-bold text-gray-900">Marketplace Universitario</span>
          </div>

          <h1 className="font-heading text-3xl font-bold text-gray-900 mb-1">Únete al Marketplace</h1>
          <p className="text-gray-500 text-sm mb-8">Usa tu correo institucional para registrarte.</p>

          {apiError && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo institucional <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tu@universidad.edu.co"
                required
                autoComplete="email"
                className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent ${
                  errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña <span className="text-red-500">*</span>
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
                  className={`w-full px-4 py-2.5 pr-10 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent ${
                    errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <EyeIcon open={showPw} />
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirmar contraseña <span className="text-red-500">*</span>
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
                  className={`w-full px-4 py-2.5 pr-10 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent ${
                    errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                />
                <button type="button" onClick={() => setShowCpw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <EyeIcon open={showCpw} />
                </button>
                {/* Checkmark when passwords match */}
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 text-green-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de cuenta <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map(({ value, icon, title, subtitle }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, role: value }))}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                      form.role === value
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className={form.role === value ? 'text-primary-600' : 'text-gray-400'}>{icon}</span>
                    <div className="text-center">
                      <p className="font-semibold leading-tight">{title}</p>
                      <p className="text-xs font-normal text-gray-400 mt-0.5 leading-tight">{subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Crear cuenta
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
