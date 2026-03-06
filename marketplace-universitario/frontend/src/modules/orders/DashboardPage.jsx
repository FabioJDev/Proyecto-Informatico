import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import Navbar from '../../components/layout/Navbar.jsx';
import StarRating from '../../components/ui/StarRating.jsx';
import { OrderBadge } from '../../components/ui/Badge.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

function StatCard({ label, value, color = 'gray' }) {
  const colors = { blue: 'bg-blue-50 text-blue-700', green: 'bg-green-50 text-green-700', yellow: 'bg-yellow-50 text-yellow-700', gray: 'bg-gray-50 text-gray-700', red: 'bg-red-50 text-red-700' };
  return (
    <div className={`rounded-xl p-5 ${colors[color]}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm mt-1 opacity-80">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/entrepreneur')
      .then((res) => setData(res.data.data))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;

  const s = data?.summary || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            {data?.profile && <p className="text-gray-500 mt-0.5">{data.profile.businessName}</p>}
          </div>
          <Link to="/my-products/new" className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">+ Nuevo producto</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total pedidos" value={s.totalOrders || 0} color="blue" />
          <StatCard label="Pendientes" value={s.pending || 0} color="yellow" />
          <StatCard label="Entregados" value={s.delivered || 0} color="green" />
          <StatCard label="Productos activos" value={s.totalProducts || 0} color="gray" />
        </div>

        {/* Rating */}
        {s.averageRating && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="text-4xl font-bold text-yellow-500">{s.averageRating}</div>
            <div>
              <StarRating value={Math.round(s.averageRating)} readOnly />
              <p className="text-sm text-gray-500 mt-1">{s.totalReviews} reseñas</p>
            </div>
          </div>
        )}

        {/* Recent orders */}
        {data?.recentOrders?.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Pedidos recientes</h2>
              <Link to="/seller-orders" className="text-sm text-primary-600 hover:text-primary-700">Ver todos →</Link>
            </div>
            <div className="space-y-3">
              {data.recentOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{order.product?.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{order.buyer?.email} · {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {order.product?.price && <span className="text-sm font-medium text-primary-700">{formatCurrency(order.product.price)}</span>}
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
