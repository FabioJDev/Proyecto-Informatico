import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
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
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
          {/* Success icon */}
          <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-3">Revisa tu correo</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-2">
            Si el correo <strong className="text-gray-700">{email}</strong> está registrado en nuestra plataforma, recibirás instrucciones para restablecer tu contraseña en los próximos minutos.
          </p>
          <p className="text-xs text-gray-400 mb-8">
            Revisa también tu carpeta de spam.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 text-sm hover:underline"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio de sesión
          </Link>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>

        <h1 className="font-heading text-2xl font-bold text-gray-900 mb-2 text-center">Recupera tu contraseña</h1>
        <p className="text-gray-500 text-sm text-center mb-8 leading-relaxed">
          Ingresa tu correo institucional y te enviaremos instrucciones para restablecer tu contraseña.
        </p>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo institucional</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@universidad.edu.co"
              required
              autoComplete="email"
              className="w-full px-4 py-2.5 border border-gray-300 bg-white rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Enviar instrucciones
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
