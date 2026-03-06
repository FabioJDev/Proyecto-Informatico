import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api.js';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import ProductCard from '../../components/ui/ProductCard.jsx';
import StarRating from '../../components/ui/StarRating.jsx';
import { formatDate } from '../../utils/formatters.js';

export default function ProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState({ reviews: [], averageRating: null, totalReviews: 0, profile: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${id}/profile`)
      .then((res) => setUser(res.data.data))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (user?.profile?.id) {
      api.get(`/reviews/profile/${user.profile.id}`)
        .then((res) => setReviews(res.data.data))
        .catch(() => {});
    }
  }, [user]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center text-gray-500">Perfil no encontrado.</div>;

  const profile = user.profile;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-3xl font-bold shrink-0">
            {profile?.photoUrl ? <img src={profile.photoUrl} alt="" className="w-full h-full rounded-full object-cover" /> : profile?.businessName?.[0] || user.email[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{profile?.businessName || user.email}</h1>
            {profile?.description && <p className="text-gray-600 mt-2">{profile.description}</p>}
            {profile?.contactInfo && <p className="text-sm text-gray-500 mt-1">📞 {profile.contactInfo}</p>}
            <div className="flex items-center gap-3 mt-3">
              {reviews.averageRating && (
                <div className="flex items-center gap-1">
                  <StarRating value={Math.round(reviews.averageRating)} readOnly size="sm" />
                  <span className="text-sm font-medium text-gray-700">{reviews.averageRating} ({reviews.totalReviews})</span>
                </div>
              )}
              <span className="text-sm text-gray-400">Miembro desde {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Products */}
        {user.products?.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Productos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {user.products.map((p) => <ProductCard key={p.id} product={{ ...p, seller: user }} />)}
            </div>
          </div>
        )}

        {/* Reviews */}
        {reviews.reviews.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reseñas</h2>
            <div className="space-y-4">
              {reviews.reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{review.reviewer?.email}</span>
                    <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                  </div>
                  <StarRating value={review.rating} readOnly size="sm" />
                  {review.comment && <p className="text-sm text-gray-600 mt-2">{review.comment}</p>}
                  {review.order?.product?.name && <p className="text-xs text-gray-400 mt-1">Producto: {review.order.product.name}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
