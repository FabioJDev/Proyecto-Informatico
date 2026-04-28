import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import StarRating from '../../components/ui/StarRating.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { formatDate } from '../../utils/formatters.js';

export default function ProductReviewsSection({ productId }) {
  const [data, setData] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, pages: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = (page = 1) => {
    setIsLoading(true);
    api.get(`/reviews/product/${productId}`, { params: { page, limit: 5 } })
      .then((res) => {
        setData(res.data.data);
        setPagination(res.data.pagination);
      })
      .catch(() => {
        setData(null);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { if (productId) fetchReviews(); }, [productId]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg skeleton" />
        ))}
      </div>
    );
  }

  if (!data || data.reviews.length === 0) {
    return (
      <div className="p-6 bg-[#F6F6F6] rounded-lg border border-[#E8E8E8]">
        <p className="text-center text-[#999999] text-sm">
          Aún no hay reseñas para este producto.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      {data.averageRating && (
        <div className="flex items-center gap-4 p-4 bg-[rgba(153,1,0,0.06)] rounded-lg border border-[rgba(153,1,0,0.20)]">
          <span className="font-mono text-3xl font-bold text-[#990100]">
            {Number(data.averageRating).toFixed(1)}
          </span>
          <div>
            <StarRating value={Math.round(data.averageRating)} readOnly size="sm" />
            <p className="text-sm text-[#666666] mt-0.5">
              {data.totalReviews} reseña{data.totalReviews !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {data.reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg border border-[#E8E8E8] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#1A1A1A]">
                {review.reviewer?.email}
              </span>
              <span className="text-xs text-[#999999] font-mono">
                {formatDate(review.createdAt)}
              </span>
            </div>
            <StarRating value={review.rating} readOnly size="sm" />
            {review.comment && (
              <p className="text-sm text-[#666666] leading-relaxed">{review.comment}</p>
            )}
          </div>
        ))}
      </div>

      {pagination.pages > 1 && (
        <Pagination pagination={pagination} onPageChange={fetchReviews} />
      )}
    </div>
  );
}
