import { useState, useEffect, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext(null);
let toastId = 0;

const ICONS = {
  success: (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
};

const TYPE_STYLES = {
  success: {
    bg:       'bg-white',
    border:   'border-l-[#1A7A4A]',
    icon:     'text-[#1A7A4A]',
    progress: 'bg-[#1A7A4A]',
    shadow:   '0 4px 20px rgba(0,0,0,0.10)',
  },
  error: {
    bg:       'bg-white',
    border:   'border-l-[#990100]',
    icon:     'text-[#990100]',
    progress: 'bg-[#990100]',
    shadow:   '0 4px 20px rgba(0,0,0,0.10)',
  },
  info: {
    bg:       'bg-white',
    border:   'border-l-[#1D4ED8]',
    icon:     'text-[#1D4ED8]',
    progress: 'bg-[#1D4ED8]',
    shadow:   '0 4px 20px rgba(0,0,0,0.10)',
  },
  warning: {
    bg:       'bg-white',
    border:   'border-l-[#B45309]',
    icon:     'text-[#B45309]',
    progress: 'bg-[#B45309]',
    shadow:   '0 4px 20px rgba(0,0,0,0.10)',
  },
};

function Toast({ toast, onRemove }) {
  const s = TYPE_STYLES[toast.type] ?? TYPE_STYLES.info;
  const duration = toast.duration ?? 4000;

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl
        border border-[#E8E8E8] border-l-4 ${s.border}
        ${s.bg}
        animate-slide-in
        max-w-sm w-full
      `}
      style={{ boxShadow: s.shadow }}
    >
      <div className="flex items-start gap-3 p-4">
        <span className={`mt-0.5 ${s.icon}`}>{ICONS[toast.type]}</span>
        <p className="flex-1 text-sm text-[#333333] leading-relaxed">
          {toast.message}
        </p>
        <button
          onClick={() => onRemove(toast.id)}
          className="text-[#999999] hover:text-[#333333] transition-colors shrink-0 mt-0.5"
          aria-label="Cerrar"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8E8E8]">
        <div
          className={`h-full ${s.progress} toast-progress`}
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration + 200);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        className="fixed top-4 right-4 z-[9998] flex flex-col gap-2 pointer-events-none"
        style={{ width: 'min(380px, calc(100vw - 2rem))' }}
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
