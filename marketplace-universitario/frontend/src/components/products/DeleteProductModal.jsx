import { useEffect, useRef } from 'react';
import { useDeleteProduct } from '../../hooks/useDeleteProduct.js';

export default function DeleteProductModal({ product, isOpen, onClose, onDeleted }) {
  const { deleteProduct, isDeleting, error, resetError } = useDeleteProduct();
  const cancelBtnRef = useRef(null);

  // Reset error state when modal opens or closes
  useEffect(() => {
    if (!isOpen) resetError();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && !isDeleting) onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, isDeleting, onClose]);

  // Focus cancel button on open
  useEffect(() => {
    if (isOpen) setTimeout(() => cancelBtnRef.current?.focus(), 50);
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const isActiveOrdersError = error?.code === 'HAS_ACTIVE_ORDERS';
  const isGenericError = error && !isActiveOrdersError;

  const handleConfirm = async () => {
    const result = await deleteProduct(product.id);
    if (result.success) {
      onDeleted(product.id);
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isDeleting) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white w-full max-w-[440px] p-8 animate-in"
        style={{ borderRadius: '4px 16px 4px 16px', borderTop: '4px solid #990100' }}
      >
        {isActiveOrdersError ? (
          /* CA-03: Blocked by active orders */
          <>
            <div className="flex flex-col items-center text-center mb-6">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'rgba(232,160,69,0.12)', border: '1.5px solid rgba(232,160,69,0.30)' }}
              >
                <svg className="w-6 h-6" style={{ color: '#E8A045' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-bold text-[#1A1A1A] mb-2">
                No puedes eliminar esta publicación
              </h2>
              <p className="text-[#666666] text-sm leading-relaxed">
                Tienes pedidos activos asociados a este producto.<br />
                Resuelve los pedidos primero.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm text-white transition-all"
              style={{ background: '#990100' }}
            >
              Entendido
            </button>
          </>
        ) : isGenericError ? (
          /* Generic error — offer retry */
          <>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[rgba(153,1,0,0.08)] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#990100]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-bold text-[#1A1A1A] mb-2">Ocurrió un error</h2>
              <p className="text-[#666666] text-sm">Inténtalo de nuevo.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors"
                style={{ border: '1.5px solid #333333', color: '#333333' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm text-white transition-all disabled:opacity-70"
                style={{ background: '#990100' }}
              >
                Reintentar
              </button>
            </div>
          </>
        ) : (
          /* Normal confirmation state */
          <>
            {/* Trash icon */}
            <div className="flex justify-center mb-5">
              <div className="w-12 h-12 rounded-full bg-[rgba(153,1,0,0.08)] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#990100]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </div>
            </div>

            <h2 className="font-display text-xl font-bold text-[#1A1A1A] text-center mb-5">
              ¿Eliminar esta publicación?
            </h2>

            {/* Product preview */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F6F6F6] border border-[#E8E8E8] mb-5">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#E8E8E8] shrink-0">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#999999]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="font-semibold text-[#1A1A1A] text-sm truncate">{product.name}</p>
            </div>

            <p className="text-sm text-[#666666] text-center leading-relaxed mb-6">
              Esta acción no se puede deshacer.<br />
              El producto dejará de ser visible en el catálogo inmediatamente.
            </p>

            <div className="flex gap-3">
              <button
                ref={cancelBtnRef}
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
                style={{ border: '1.5px solid #333333', color: '#333333' }}
                onMouseEnter={(e) => {
                  if (!isDeleting) {
                    e.currentTarget.style.borderColor = '#990100';
                    e.currentTarget.style.color = '#990100';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#333333';
                  e.currentTarget.style.color = '#333333';
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-70 transition-all"
                style={{ background: '#990100' }}
              >
                {isDeleting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Eliminando...
                  </>
                ) : (
                  'Eliminar publicación'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
