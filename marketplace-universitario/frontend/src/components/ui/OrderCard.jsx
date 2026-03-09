import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { OrderBadge } from './Badge.jsx';
import Button from './Button.jsx';

export default function OrderCard({ order, role, onAccept, onReject, onDeliver, onCancel, onReview }) {
  const { id, status, product, buyer, seller, quantity, createdAt, review } = order;

  return (
    <div className="
      glass rounded-2xl border border-[var(--border-subtle)] p-5 space-y-4
      hover:border-[var(--border-strong)] transition-colors duration-200
    ">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono text-[var(--text-muted)] mb-1">#{id.slice(-8)}</p>
          <h3 className="font-display font-semibold text-[var(--text-primary)] truncate">
            {product?.name}
          </h3>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {role === 'EMPRENDEDOR'
              ? `Comprador: ${buyer?.email}`
              : `Vendedor: ${seller?.profile?.businessName || seller?.email}`
            }
          </p>
        </div>
        <OrderBadge status={status} />
      </div>

      {/* Details */}
      <div className="flex flex-wrap items-center gap-5 text-sm">
        <span className="text-[var(--text-muted)]">
          Cantidad: <span className="text-[var(--text-secondary)] font-medium">{quantity}</span>
        </span>
        {product?.price && (
          <span className="text-[var(--text-muted)]">
            Total:{' '}
            <span className="font-mono font-semibold text-[var(--accent-secondary)]">
              {formatCurrency(product.price * quantity)}
            </span>
          </span>
        )}
        <span className="text-[var(--text-muted)]">{formatDate(createdAt)}</span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-[var(--border-subtle)]">
        {role === 'EMPRENDEDOR' && status === 'PENDING' && (
          <>
            <Button size="sm" onClick={() => onAccept?.(id)}>Aceptar</Button>
            <Button size="sm" variant="danger" onClick={() => onReject?.(id)}>Rechazar</Button>
          </>
        )}
        {role === 'EMPRENDEDOR' && status === 'ACCEPTED' && (
          <Button size="sm" variant="secondary" onClick={() => onDeliver?.(id)}>
            Marcar Entregado
          </Button>
        )}
        {role === 'COMPRADOR' && status === 'PENDING' && (
          <Button size="sm" variant="ghost" onClick={() => onCancel?.(id)}>
            Cancelar pedido
          </Button>
        )}
        {role === 'COMPRADOR' && status === 'DELIVERED' && !review && (
          <Button size="sm" variant="secondary" onClick={() => onReview?.(id)}>
            Dejar Reseña
          </Button>
        )}
        {review && (
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Reseñado ({review.rating}/5)
          </span>
        )}
      </div>
    </div>
  );
}
