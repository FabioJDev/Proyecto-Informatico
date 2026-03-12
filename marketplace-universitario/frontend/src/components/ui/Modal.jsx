import { useEffect } from 'react';
import Button from './Button.jsx';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  confirmLabel = 'Confirmar',
  confirmVariant = 'danger',
  onConfirm,
  isLoading = false,
}) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else        document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="
        relative z-10 w-full max-w-md
        bg-white rounded-2xl
        border border-[#E8E8E8]
        shadow-xl
        p-6
        animate-in
      ">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-[#1A1A1A]">{title}</h3>
          <button
            onClick={onClose}
            className="
              w-8 h-8 rounded-lg flex items-center justify-center
              text-[#999999] hover:text-[#333333]
              hover:bg-[#F6F6F6]
              transition-colors duration-150
            "
            aria-label="Cerrar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-sm text-[#666666] mb-6 leading-relaxed">
          {children}
        </div>

        {onConfirm && (
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button variant={confirmVariant} onClick={onConfirm} isLoading={isLoading}>
              {confirmLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
