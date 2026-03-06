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
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none">&times;</button>
        </div>

        <div className="text-gray-600 mb-6">{children}</div>

        {onConfirm && (
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancelar</Button>
            <Button variant={confirmVariant} onClick={onConfirm} isLoading={isLoading}>
              {confirmLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
