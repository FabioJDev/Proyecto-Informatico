import { useState } from 'react';
import Navbar from '../../components/layout/Navbar.jsx';
import OrderCard from '../../components/ui/OrderCard.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Modal from '../../components/ui/Modal.jsx';
import StarRating from '../../components/ui/StarRating.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { useOrders } from '../../hooks/useOrders.js';
import api from '../../services/api.js';

export default function MyOrdersPage() {
  const { addToast } = useToast();
  const { orders, pagination, isLoading, error, cancelOrder, setPage, refetch } = useOrders();

  const [reviewModal, setReviewModal] = useState(null); // orderId
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleCancel = async (id) => {
    try {
      await cancelOrder(id);
      addToast('Pedido cancelado.', 'info');
    } catch (err) {
      addToast(err.userMessage || 'Error al cancelar.', 'error');
    }
  };

  const handleSubmitReview = async () => {
    setSubmitting(true);
    try {
      await api.post('/reviews', { orderId: reviewModal, ...review });
      addToast('Reseña publicada. ¡Gracias!', 'success');
      setReviewModal(null);
      refetch();
    } catch (err) {
      addToast(err.userMessage || 'Error al publicar reseña.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis pedidos</h1>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {isLoading ? (
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="text-5xl">🛒</span>
            <p className="mt-3">Aún no tienes pedidos.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} role="COMPRADOR"
                onCancel={handleCancel}
                onReview={(id) => setReviewModal(id)} />
            ))}
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={refetch} />
      </main>

      <Modal isOpen={!!reviewModal} onClose={() => setReviewModal(null)} title="Dejar reseña"
        confirmLabel="Publicar reseña" confirmVariant="primary" onConfirm={handleSubmitReview} isLoading={submitting}>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Calificación</p>
            <StarRating value={review.rating} onChange={(r) => setReview((p) => ({ ...p, rating: r }))} size="lg" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Comentario (opcional)</label>
            <textarea value={review.comment} onChange={(e) => setReview((p) => ({ ...p, comment: e.target.value }))}
              maxLength={300} rows={3} placeholder="¿Cómo fue tu experiencia?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none" />
            <p className="text-xs text-gray-400 text-right">{review.comment.length}/300</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
