import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import Navbar from '../../components/layout/Navbar.jsx';
import StarRating from '../../components/ui/StarRating.jsx';
import { OrderBadge } from '../../components/ui/Badge.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

const STAT_PALETTE = {
  primary: { bg: 'bg-white', border: 'border-[#E8E8E8]', text: 'text-[#990100]',  icon: 'text-[#990100]' },
  amber:   { bg: 'bg-white', border: 'border-[#E8E8E8]', text: 'text-[#B45309]',  icon: 'text-[#B45309]' },
  emerald: { bg: 'bg-white', border: 'border-[#E8E8E8]', text: 'text-[#1A7A4A]',  icon: 'text-[#1A7A4A]' },
  slate:   { bg: 'bg-white', border: 'border-[#E8E8E8]', text: 'text-[#1A1A1A]',  icon: 'text-[#999999]' },
};

function StatCard({ label, value, color = 'primary', icon }) {
  const p = STAT_PALETTE[color] ?? STAT_PALETTE.slate;
  return (
    <div className={`
      rounded-2xl border p-5 transition-all duration-300
      hover:-translate-y-0.5 hover:shadow-card-hover
      ${p.bg} ${p.border}
    `}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-mono text-[#999999] uppercase tracking-wider">{label}</p>
        {icon && <span className={`${p.icon}`}>{icon}</span>}
      </div>
      <p className={`font-display text-3xl font-bold ${p.text}`}>{value ?? 0}</p>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F6F6]">
      <div
        className="w-10 h-10 rounded-full border-2 border-transparent animate-spin-ring"
        style={{ borderTopColor: '#990100', borderRightColor: 'rgba(153,1,0,0.2)' }}
      />
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData]         = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/entrepreneur')
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <PageLoader />;

  const s = data?.summary || {};

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F6]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between animate-in">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#1A1A1A]">Dashboard</h1>
            {data?.profile?.businessName && (
              <p className="text-[#999999] mt-1 text-sm">{data.profile.businessName}</p>
            )}
          </div>
          <Link
            to="/my-products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#990100] shadow-glow-primary animate-glow-pulse hover:bg-[#B90504] hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo producto
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in delay-1">
          <StatCard
            label="Total pedidos"
            value={s.totalOrders || 0}
            color="primary"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>}
          />
          <StatCard
            label="Pendientes"
            value={s.pending || 0}
            color="amber"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            label="Entregados"
            value={s.delivered || 0}
            color="emerald"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            label="Productos"
            value={s.totalProducts || 0}
            color="slate"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>}
          />
        </div>

        {/* Rating */}
        {s.averageRating && (
          <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 flex items-center gap-5 animate-in delay-2 hover:shadow-card-hover transition-shadow duration-200">
            <div className="font-display text-4xl font-bold text-[#990100] font-mono">
              {s.averageRating}
            </div>
            <div>
              <StarRating value={Math.round(s.averageRating)} readOnly />
              <p className="text-sm text-[#999999] mt-1">{s.totalReviews} reseñas</p>
            </div>
          </div>
        )}

        {/* Recent orders */}
        {data?.recentOrders?.length > 0 && (
          <div className="animate-in delay-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-[#1A1A1A]">Pedidos recientes</h2>
              <Link to="/seller-orders" className="text-sm text-[#990100] hover:text-[#B90504] transition-colors">
                Ver todos →
              </Link>
            </div>
            <div className="space-y-3">
              {data.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-[#E8E8E8] p-4 flex items-center justify-between hover:border-[#CCCCCC] hover:shadow-card-hover transition-all duration-200"
                >
                  <div>
                    <p className="font-medium text-sm text-[#1A1A1A]">{order.product?.name}</p>
                    <p className="text-xs text-[#999999] mt-0.5">
                      {order.buyer?.email} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {order.product?.price && (
                      <span className="text-sm font-mono font-semibold text-[#990100]">
                        {formatCurrency(order.product.price)}
                      </span>
                    )}
                    <OrderBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
