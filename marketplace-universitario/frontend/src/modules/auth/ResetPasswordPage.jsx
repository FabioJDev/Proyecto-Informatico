import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api.js';

function getStrength(password) {
  let score = 0;
  if (password.length >= 8)          score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[0-9]/.test(password))        score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const strengthLabel = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
const strengthColor  = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];

function PasswordStrength({ password }) {
  if (!password) return null;
  const score = getStrength(password);
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= score ? strengthColor[score] : 'bg-gray-200'}`} />
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

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => navigate('/login?reset=success'), 2000);
    } catch (err) {
      setError(err.userMessage || 'Token inválido o expirado. Solicita un nuevo enlace.');
    } finally {
      setIsLoading(false);
    }
  };

  // No token in URL
  if (!token) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="mx-auto mb-4 w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="font-heading text-xl font-bold text-gray-900 mb-2">Enlace inválido</h2>
          <p className="text-gray-500 text-sm mb-6">Este enlace de recuperación no es válido o ya fue usado.</p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
          >
            Solicitar un nuevo enlace
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">¡Contraseña actualizada!</h2>
          <p className="text-gray-500 text-sm">
            Tu contraseña fue cambiada exitosamente. Redirigiendo al inicio de sesión…
          </p>
          <div className="mt-4 flex justify-center">
            <span className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-10">
        {/* Icon */}
        <div className="mx-auto mb-6 w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center">
          <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 className="font-heading text-2xl font-bold text-gray-900 mb-2 text-center">Nueva contraseña</h1>
        <p className="text-gray-500 text-sm text-center mb-8">Elige una contraseña segura para tu cuenta.</p>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}{' '}
            {error.includes('expirado') || error.includes('inválido') ? (
              <Link to="/forgot-password" className="font-medium underline hover:no-underline">
                Solicitar nuevo enlace
              </Link>
            ) : null}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nueva contraseña <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
                required
                autoComplete="new-password"
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 bg-white rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <EyeIcon open={showPw} />
              </button>
            </div>
            <PasswordStrength password={form.password} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirmar contraseña <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCpw ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Repite la contraseña"
                required
                autoComplete="new-password"
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 bg-white rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
              <button type="button" onClick={() => setShowCpw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <EyeIcon open={showCpw} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Guardar contraseña
          </button>
        </form>
      </div>
    </div>
  );
}
