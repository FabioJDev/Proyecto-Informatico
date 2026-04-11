import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import ProductCard from '../../components/ui/ProductCard.jsx';
import StarRating from '../../components/ui/StarRating.jsx';
import ReviewsSection from '../reviews/ReviewsSection.jsx';
import { formatDate } from '../../utils/formatters.js';

export default function ProfilePage() {
  const { id } = useParams();
  const currentUser = useAuthStore((s) => s.user);
  const isOwner = currentUser?.id === id && currentUser?.role === 'EMPRENDEDOR';
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${id}/profile`)
      .then((res) => setUser(res.data.data))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F6F6]">
      <div className="w-8 h-8 border-2 border-transparent animate-spin-ring"
        style={{ borderTopColor: '#990100', borderRightColor: 'rgba(153,1,0,0.2)', borderRadius: '50%' }} />
    </div>
  );
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F6F6] text-[#999999]">
      Perfil no encontrado.
    </div>
  );

  const profile = user.profile;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F6]">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">

        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6 flex flex-col sm:flex-row items-start gap-5 animate-in hover:shadow-card-hover transition-shadow duration-200">
          <div className="w-20 h-20 rounded-full bg-[rgba(153,1,0,0.08)] border-2 border-[#E8E8E8] text-[#990100] flex items-center justify-center text-3xl font-bold shrink-0 font-display hover:border-[#990100] transition-colors duration-200">
            {profile?.photoUrl
              ? <img src={profile.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
              : profile?.businessName?.[0] || user.email[0].toUpperCase()
            }
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-2xl font-bold text-[#1A1A1A]">{profile?.businessName || user.email}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium uppercase tracking-wider bg-[#990100] text-[#F6F6F6]">
                Emprendedor UAO
              </span>
              {isOwner && (
                <Link
                  to="/profile/edit"
                  className="
                    ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium
                    border border-[#333333] rounded-lg text-[#333333]
                    hover:border-[#990100] hover:text-[#990100]
                    transition-all duration-200
                  "
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                  </svg>
                  Editar perfil
                </Link>
              )}
            </div>
            {profile?.description && <p className="text-[#666666] mt-2 leading-relaxed">{profile.description}</p>}
            {profile?.contactInfo && <p className="text-sm text-[#999999] mt-1">📞 {profile.contactInfo}</p>}
            <p className="text-sm text-[#999999] font-mono mt-3">Miembro desde {formatDate(user.createdAt)}</p>
          </div>
        </div>

        {/* Products */}
        {user.products?.length > 0 && (
          <div className="animate-in delay-1">
            <h2 className="font-display text-xl font-bold text-[#1A1A1A] mb-4">Productos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {user.products.map((p) => <ProductCard key={p.id} product={{ ...p, seller: user }} />)}
            </div>
          </div>
        )}

        {/* Reviews */}
        {profile?.id && (
          <div className="animate-in delay-2">
            <h2 className="font-display text-xl font-bold text-[#1A1A1A] mb-4">Reseñas</h2>
            <ReviewsSection profileId={profile.id} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
