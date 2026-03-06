import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import StarRating from '../../components/ui/StarRating.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { formatDate } from '../../utils/formatters.js';

export default function ReviewsSection({ profileId }) {
  const [data, setData] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, pages: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = (page = 1) => {
    setIsLoading(true);
    api.get(`/reviews/profile/${profileId}`, { params: { page, limit: 5 } })
      .then((res) => {
        setData(res.data.data);
        setPagination(res.data.pagination);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { if (profileId) fetchReviews(); }, [profileId]);

  if (isLoading) return <div className="text-center py-8 text-gray-400">Cargando reseñas…</div>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
        <span className="text-4xl font-bold text-yellow-600">{data.averageRating || '—'}</span>
        <div>
          {data.averageRating && <StarRating value={Math.round(data.averageRating)} readOnly />}
          <p className="text-sm text-gray-600 mt-0.5">{data.totalReviews} reseña(s)</p>
        </div>
      </div>

      {/* List */}
      {data.reviews.length === 0 ? (
        <p className="text-center text-gray-400 py-6">Aún no hay reseñas para este emprendedor.</p>
      ) : (
        data.reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-800">{review.reviewer?.email}</span>
              <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
            </div>
            <StarRating value={review.rating} readOnly size="sm" />
            {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
            {review.order?.product?.name && <p className="text-xs text-gray-400">Producto: {review.order.product.name}</p>}
          </div>
        ))
      )}

      <Pagination pagination={pagination} onPageChange={fetchReviews} />
    </div>
  );
}
