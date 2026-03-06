import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import Navbar from '../../components/layout/Navbar.jsx';
import StarRating from '../../components/ui/StarRating.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

function StatCard({ label, value, sub, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="text-3xl font-bold mt-1">{value ?? '—'}</p>
      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/reports/admin')
      .then((res) => setReport(res.data.data))
      .catch(() => setError('No se pudo cargar el reporte.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Panel de administración</h1>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
          </div>
        ) : report && (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              <StatCard label="Usuarios totales" value={report.totalUsers} color="blue" />
              <StatCard label="Emprendedores" value={report.totalEntrepreneurs} color="purple" />
              <StatCard label="Compradores" value={report.totalBuyers} color="green" />
              <StatCard label="Productos activos" value={report.totalActiveProducts} color="yellow" />
              <StatCard label="Órdenes totales" value={report.totalOrders} color="red" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Revenue by month */}
              {report.revenueByMonth?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h2 className="font-semibold text-gray-800 mb-4">Ingresos mensuales (últimos 6 meses)</h2>
                  <div className="space-y-2">
                    {report.revenueByMonth.map((row) => (
                      <div key={row.month} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 w-24 shrink-0">{row.month}</span>
                        <div className="flex-1 mx-3 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary-500 h-2 rounded-full"
                            style={{ width: `${Math.min(100, (row.revenue / (report.revenueByMonth[0]?.revenue || 1)) * 100)}%` }}
                          />
                        </div>
                        <span className="font-medium text-gray-800 w-28 text-right">{formatCurrency(row.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders by status */}
              {report.ordersByStatus?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h2 className="font-semibold text-gray-800 mb-4">Órdenes por estado</h2>
                  <div className="space-y-3">
                    {report.ordersByStatus.map((row) => {
                      const statusLabels = {
                        PENDING: { label: 'Pendientes', color: 'bg-yellow-100 text-yellow-800' },
                        ACCEPTED: { label: 'Aceptadas', color: 'bg-blue-100 text-blue-800' },
                        DELIVERED: { label: 'Entregadas', color: 'bg-green-100 text-green-800' },
                        REJECTED: { label: 'Rechazadas', color: 'bg-red-100 text-red-800' },
                        CANCELLED: { label: 'Canceladas', color: 'bg-gray-100 text-gray-800' },
                      };
                      const meta = statusLabels[row.status] || { label: row.status, color: 'bg-gray-100 text-gray-800' };
                      return (
                        <div key={row.status} className="flex items-center justify-between">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${meta.color}`}>{meta.label}</span>
                          <span className="font-semibold text-gray-800">{row.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Top entrepreneurs */}
              {report.topEntrepreneurs?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-2">
                  <h2 className="font-semibold text-gray-800 mb-4">Top emprendedores</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b border-gray-100">
                          <th className="pb-2 font-medium">Emprendedor</th>
                          <th className="pb-2 font-medium">Órdenes</th>
                          <th className="pb-2 font-medium">Ingresos</th>
                          <th className="pb-2 font-medium">Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {report.topEntrepreneurs.map((e) => (
                          <tr key={e.id}>
                            <td className="py-2.5">
                              <p className="font-medium text-gray-800">{e.profile?.displayName || e.email}</p>
                              <p className="text-xs text-gray-400">{e.email}</p>
                            </td>
                            <td className="py-2.5 text-gray-700">{e.totalOrders}</td>
                            <td className="py-2.5 font-medium text-green-700">{formatCurrency(e.totalRevenue)}</td>
                            <td className="py-2.5">
                              {e.avgRating ? (
                                <div className="flex items-center gap-1">
                                  <StarRating value={Math.round(e.avgRating)} readOnly size="sm" />
                                  <span className="text-xs text-gray-500">({e.avgRating})</span>
                                </div>
                              ) : <span className="text-gray-400 text-xs">Sin reseñas</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-6 text-right">
              Generado el {formatDate(new Date().toISOString())}
            </p>
          </>
        )}
      </main>
    </div>
  );
}
