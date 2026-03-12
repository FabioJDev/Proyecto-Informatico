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

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl skeleton" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4 p-4 bg-[rgba(153,1,0,0.06)] rounded-xl border border-[rgba(153,1,0,0.20)]">
        <span className="font-mono text-4xl font-bold text-[#990100]">
          {data.averageRating ? Number(data.averageRating).toFixed(1) : '—'}
        </span>
        <div>
          {data.averageRating && <StarRating value={Math.round(data.averageRating)} readOnly />}
          <p className="text-sm text-[#666666] mt-0.5">
            {data.totalReviews} reseña{data.totalReviews !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* List */}
      {data.reviews.length === 0 ? (
        <p className="text-center text-[#999999] py-6 text-sm">
          Aún no hay reseñas para este emprendedor.
        </p>
      ) : (
        data.reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl border border-[#E8E8E8] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#1A1A1A]">
                {review.reviewer?.email}
              </span>
              <span className="text-xs text-[#999999] font-mono">{formatDate(review.createdAt)}</span>
            </div>
            <StarRating value={review.rating} readOnly size="sm" />
            {review.comment && (
              <p className="text-sm text-[#666666] leading-relaxed">{review.comment}</p>
            )}
            {review.order?.product?.name && (
              <p className="text-xs text-[#999999] font-mono">
                Producto: {review.order.product.name}
              </p>
            )}
          </div>
        ))
      )}

      <Pagination pagination={pagination} onPageChange={fetchReviews} />
    </div>
  );
}
