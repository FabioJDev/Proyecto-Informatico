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
const strengthColor = ['', 'bg-[#990100]', 'bg-[#B45309]', 'bg-[#1A7A4A]', 'bg-[#1A7A4A]'];
const strengthText  = ['', 'text-[#990100]', 'text-[#B45309]', 'text-[#1A7A4A]', 'text-[#1A7A4A]'];

function PasswordStrength({ password }) {
  if (!password) return null;
  const score = getStrength(password);
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? strengthColor[score] : 'bg-[#E8E8E8]'}`} />
        ))}
      </div>
      <p className={`text-xs font-mono ${strengthText[score]}`}>Seguridad: {strengthLabel[score]}</p>
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

const inputBase = `
  w-full px-4 py-3 pr-11 rounded-xl text-sm
  bg-white text-[#1A1A1A]
  border-[1.5px] border-[#E8E8E8]
  placeholder:text-[#999999]
  hover:border-[#CCCCCC]
  focus:outline-none focus:border-[#990100] focus:ring-[3px] focus:ring-[rgba(153,1,0,0.10)]
  transition-all duration-200
`;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [form, setForm]           = useState({ password: '', confirmPassword: '' });
  const [showPw,  setShowPw]      = useState(false);
  const [showCpw, setShowCpw]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);
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
      setTimeout(() => navigate('/login?reset=success'), 2000);
    } catch (err) {
      setError(err.userMessage || 'Token inválido o expirado. Solicita un nuevo enlace.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-[rgba(153,1,0,0.20)] p-8 max-w-md w-full text-center animate-in shadow-sm">
          <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-[rgba(153,1,0,0.06)] border border-[rgba(153,1,0,0.20)] flex items-center justify-center">
            <svg className="w-7 h-7 text-[#990100]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-[#1A1A1A] mb-2">Enlace inválido</h2>
          <p className="text-[#999999] text-sm mb-6">Este enlace no es válido o ya fue usado.</p>
          <Link to="/forgot-password" className="text-sm font-medium text-[#990100] hover:text-[#B90504] transition-colors">
            Solicitar un nuevo enlace →
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-[#D1FAE5] p-8 max-w-md w-full text-center animate-in shadow-sm">
          <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-[#D1FAE5] border border-[#6EE7B7] flex items-center justify-center">
            <svg className="w-8 h-8 text-[#1A7A4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold text-[#1A1A1A] mb-2">¡Contraseña actualizada!</h2>
          <p className="text-[#999999] text-sm mb-4">Redirigiendo al inicio de sesión…</p>
          <div className="flex justify-center">
            <span className="w-5 h-5 border-2 border-transparent border-t-[#990100] rounded-full animate-spin-ring" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[#E8E8E8] p-8 max-w-md w-full animate-in shadow-sm">
        <div className="mx-auto mb-6 w-14 h-14 rounded-2xl bg-[rgba(153,1,0,0.06)] border border-[rgba(153,1,0,0.20)] flex items-center justify-center">
          <svg className="w-7 h-7 text-[#990100]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 className="font-display text-2xl font-bold text-[#1A1A1A] mb-2 text-center">
          Nueva contraseña
        </h1>
        <p className="text-[#666666] text-sm text-center mb-7">
          Elige una contraseña segura para tu cuenta.
        </p>

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-[rgba(153,1,0,0.06)] border border-[rgba(153,1,0,0.20)] text-sm text-[#990100]">
            {error}{' '}
            {(error.includes('expirado') || error.includes('inválido')) && (
              <Link to="/forgot-password" className="font-medium underline hover:no-underline">
                Solicitar nuevo enlace
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#666666]">
              Nueva contraseña <span className="text-[#990100]">*</span>
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
                required
                autoComplete="new-password"
                className={inputBase}
              />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#666666] transition-colors">
                <EyeIcon open={showPw} />
              </button>
            </div>
            <PasswordStrength password={form.password} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#666666]">
              Confirmar contraseña <span className="text-[#990100]">*</span>
            </label>
            <div className="relative">
              <input
                type={showCpw ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Repite la contraseña"
                required
                autoComplete="new-password"
                className={inputBase}
              />
              <button type="button" onClick={() => setShowCpw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#666666] transition-colors">
                <EyeIcon open={showCpw} />
              </button>
            </div>
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
            {isLoading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin-ring" />}
            {isLoading ? 'Guardando...' : 'Guardar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
