import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { OrderBadge } from './Badge.jsx';
import Button from './Button.jsx';

export default function OrderCard({ order, role, onAccept, onReject, onDeliver, onCancel, onReview }) {
  const { id, status, product, buyer, seller, quantity, createdAt, review } = order;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 font-mono mb-1">#{id.slice(-8)}</p>
          <h3 className="font-semibold text-gray-900 truncate">{product?.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {role === 'EMPRENDEDOR' ? `Comprador: ${buyer?.email}` : `Vendedor: ${seller?.profile?.businessName || seller?.email}`}
          </p>
        </div>
        <OrderBadge status={status} />
      </div>

      <div className="flex items-center gap-6 text-sm text-gray-600">
        <span>Cantidad: <strong>{quantity}</strong></span>
        {product?.price && (
          <span>Total: <strong className="text-primary-700">{formatCurrency(product.price * quantity)}</strong></span>
        )}
        <span>{formatDate(createdAt)}</span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
        {role === 'EMPRENDEDOR' && status === 'PENDING' && (
          <>
            <Button size="sm" onClick={() => onAccept?.(id)}>Aceptar</Button>
            <Button size="sm" variant="danger" onClick={() => onReject?.(id)}>Rechazar</Button>
          </>
        )}
        {role === 'EMPRENDEDOR' && status === 'ACCEPTED' && (
          <Button size="sm" variant="secondary" onClick={() => onDeliver?.(id)}>Marcar Entregado</Button>
        )}
        {role === 'COMPRADOR' && status === 'PENDING' && (
          <Button size="sm" variant="ghost" onClick={() => onCancel?.(id)}>Cancelar</Button>
        )}
        {role === 'COMPRADOR' && status === 'DELIVERED' && !review && (
          <Button size="sm" variant="secondary" onClick={() => onReview?.(id)}>Dejar Reseña</Button>
        )}
        {review && (
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            ★ Reseñado ({review.rating}/5)
          </span>
        )}
      </div>
    </div>
  );
}
