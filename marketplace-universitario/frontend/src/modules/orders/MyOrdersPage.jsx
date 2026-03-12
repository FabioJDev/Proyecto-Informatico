import { useState } from 'react';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import OrderCard from '../../components/ui/OrderCard.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Modal from '../../components/ui/Modal.jsx';
import StarRating from '../../components/ui/StarRating.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { useOrders } from '../../hooks/useOrders.js';
import api from '../../services/api.js';

function SkeletonOrder() {
  return (
    <div className="rounded-2xl border border-[#E8E8E8] bg-white p-5 space-y-3">
      <div className="flex justify-between">
        <div className="space-y-1.5 flex-1">
          <div className="h-3 w-20 rounded skeleton" />
          <div className="h-5 w-2/3 rounded skeleton" />
          <div className="h-3 w-1/3 rounded skeleton" />
        </div>
        <div className="h-6 w-20 rounded-full skeleton" />
      </div>
      <div className="flex gap-6">
        <div className="h-3 w-16 rounded skeleton" />
        <div className="h-3 w-24 rounded skeleton" />
        <div className="h-3 w-20 rounded skeleton" />
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  const { addToast } = useToast();
  const { orders, pagination, isLoading, error, cancelOrder, setPage, refetch } = useOrders();

  const [reviewModal, setReviewModal] = useState(null);
  const [review,      setReview]      = useState({ rating: 5, comment: '' });
  const [submitting,  setSubmitting]  = useState(false);

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
    <div className="min-h-screen flex flex-col bg-[#F6F6F6]">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        <h1 className="font-display text-3xl font-bold text-[#1A1A1A] mb-8 animate-in">
          Mis pedidos
        </h1>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-[rgba(153,1,0,0.06)] border border-[rgba(153,1,0,0.20)] text-sm text-[#990100]">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonOrder key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 animate-in">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-[rgba(153,1,0,0.06)] border border-[rgba(153,1,0,0.20)] flex items-center justify-center">
              <svg className="w-10 h-10 text-[#990100]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-[#1A1A1A] text-lg mb-2">Sin pedidos</h3>
            <p className="text-[#999999] text-sm">Aún no tienes pedidos. ¡Explora el catálogo!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <div key={order.id} className="animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <OrderCard
                  order={order}
                  role="COMPRADOR"
                  onCancel={handleCancel}
                  onReview={(id) => setReviewModal(id)}
                />
              </div>
            ))}
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={setPage} />
      </main>

      <Footer />

      {/* Review modal */}
      <Modal
        isOpen={!!reviewModal}
        onClose={() => setReviewModal(null)}
        title="Dejar reseña"
        confirmLabel="Publicar reseña"
        confirmVariant="primary"
        onConfirm={handleSubmitReview}
        isLoading={submitting}
      >
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-[#666666] mb-3">Calificación</p>
            <StarRating
              value={review.rating}
              onChange={(r) => setReview((p) => ({ ...p, rating: r }))}
              size="lg"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#666666] block mb-2">
              Comentario (opcional)
            </label>
            <textarea
              value={review.comment}
              onChange={(e) => setReview((p) => ({ ...p, comment: e.target.value }))}
              maxLength={300}
              rows={3}
              placeholder="¿Cómo fue tu experiencia?"
              className="
                w-full px-4 py-3 rounded-xl text-sm
                bg-white text-[#1A1A1A]
                border-[1.5px] border-[#E8E8E8]
                placeholder:text-[#999999]
                hover:border-[#CCCCCC]
                focus:outline-none focus:border-[#990100] focus:ring-[3px] focus:ring-[rgba(153,1,0,0.10)]
                transition-all duration-200 resize-none
              "
            />
            <p className="text-xs text-[#999999] font-mono text-right mt-1">
              {review.comment.length}/300
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
