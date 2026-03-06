import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useToast } from '../../components/ui/Toast.jsx';

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

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const { addToast } = useToast();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError]   = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Show success message if coming from reset-password
  const resetSuccess = searchParams.get('reset') === 'success';

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await login(form.email, form.password);
      addToast(`Bienvenido de vuelta, ${user.email.split('@')[0]}`, 'success');
      if (user.role === 'ADMIN')        navigate('/admin');
      else if (user.role === 'EMPRENDEDOR') navigate('/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.userMessage || 'Error al iniciar sesión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-5/12 bg-primary-600 flex-col justify-between p-12 relative overflow-hidden">
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
            Tu comunidad universitaria<br />está aquí
          </h2>
          <p className="text-primary-200 mt-4 text-base leading-relaxed">
            Inicia sesión para acceder al marketplace y conectar con emprendedores de tu universidad.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { icon: '🛍️', text: 'Compra productos locales y únicos' },
            { icon: '💼', text: 'Vende tus productos y servicios' },
            { icon: '🤝', text: 'Apoya el emprendimiento universitario' },
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

          <h1 className="font-heading text-3xl font-bold text-gray-900 mb-1">Bienvenido de vuelta</h1>
          <p className="text-gray-500 text-sm mb-8">Ingresa con tu correo institucional.</p>

          {/* Reset success banner */}
          {resetSuccess && (
            <div className="mb-5 p-3.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Contraseña actualizada exitosamente. Inicia sesión con tu nueva contraseña.
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                className="w-full px-4 py-2.5 border border-gray-300 bg-white rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Contraseña</label>
                <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 hover:underline">
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
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 bg-white rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Iniciar sesión
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700 hover:underline">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
