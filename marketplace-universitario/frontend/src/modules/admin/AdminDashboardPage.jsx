import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import Navbar from '../../components/layout/Navbar.jsx';
import StarRating from '../../components/ui/StarRating.jsx';
import Button from '../../components/ui/Button.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

const KPI_PALETTE = {
  primary: { bg: 'bg-white', border: 'border-[#E8E8E8]', text: 'text-[#990100]', hover: 'hover:border-l-[#990100] hover:border-l-4' },
  violet:  { bg: 'bg-white', border: 'border-[#E8E8E8]', text: 'text-[#5B21B6]', hover: 'hover:border-l-[#7C3AED] hover:border-l-4' },
  emerald: { bg: 'bg-white', border: 'border-[#E8E8E8]', text: 'text-[#1A7A4A]', hover: 'hover:border-l-[#1A7A4A] hover:border-l-4' },
  amber:   { bg: 'bg-white', border: 'border-[#E8E8E8]', text: 'text-[#B45309]', hover: 'hover:border-l-[#B45309] hover:border-l-4' },
  red:     { bg: 'bg-white', border: 'border-[#E8E8E8]', text: 'text-[#990100]', hover: 'hover:border-l-[#990100] hover:border-l-4' },
};

function KpiCard({ label, value, sub, color = 'primary' }) {
  const p = KPI_PALETTE[color] ?? KPI_PALETTE.primary;
  return (
    <div className={`rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-card-hover duration-300 ${p.bg} ${p.border} ${p.hover}`}>
      <p className="text-xs font-mono text-[#999999] uppercase tracking-wider mb-2">{label}</p>
      <p className={`font-display text-3xl font-bold ${p.text}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-[#999999] mt-1">{sub}</p>}
    </div>
  );
}

const STATUS_META = {
  PENDING:   { label: 'Pendientes',  color: 'text-[#B45309]',  bg: 'bg-[#FEF3C7]',                   bar: 'bg-[#B45309]' },
  ACCEPTED:  { label: 'Aceptadas',   color: 'text-[#990100]',  bg: 'bg-[rgba(153,1,0,0.08)]',         bar: 'bg-[#990100]' },
  DELIVERED: { label: 'Entregadas',  color: 'text-[#1A7A4A]',  bg: 'bg-[#D1FAE5]',                   bar: 'bg-[#1A7A4A]' },
  REJECTED:  { label: 'Rechazadas',  color: 'text-[#990100]',  bg: 'bg-[rgba(153,1,0,0.08)]',         bar: 'bg-[#990100]' },
  CANCELLED: { label: 'Canceladas',  color: 'text-[#6B7280]',  bg: 'bg-[#F3F4F6]',                   bar: 'bg-[#9CA3AF]' },
};

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F6F6]">
      <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin-ring"
        style={{ borderTopColor: '#990100', borderRightColor: 'rgba(153,1,0,0.2)' }} />
    </div>
  );
}

const ADMIN_SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', path: '/admin' },
  { id: 'users', label: 'Usuarios', path: '/admin/users' },
  { id: 'products', label: 'Productos', path: '/admin/products' },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [report,    setReport]    = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    api.get('/reports/admin')
      .then((res) => setReport(res.data.data))
      .catch(() => setError('No se pudo cargar el reporte.'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <PageLoader />;

  const maxRevenue = report?.revenueByMonth?.[0]?.revenue || 1;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F6]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">

        <h1 className="font-display text-3xl font-bold text-[#1A1A1A] mb-4 animate-in">
          Panel de administración
        </h1>

        {/* Admin Navigation */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-4 mb-8 flex flex-wrap gap-2 animate-in delay-1">
          {ADMIN_SECTIONS.map((section) => (
            <Button
              key={section.id}
              onClick={() => navigate(section.path)}
              variant={section.path === '/admin' ? 'primary' : 'ghost'}
              size="md"
              className={section.path === '/admin' ? '' : 'text-[#666666] hover:text-[#990100]'}
            >
              {section.label}
            </Button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[rgba(153,1,0,0.06)] border border-[rgba(153,1,0,0.20)] text-sm text-[#990100]">
            {error}
          </div>
        )}

        {report && (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 animate-in delay-1">
              <KpiCard label="Usuarios"        value={report.totalUsers}             color="primary" />
              <KpiCard label="Emprendedores"   value={report.totalEntrepreneurs}     color="violet" />
              <KpiCard label="Compradores"     value={report.totalBuyers}            color="emerald" />
              <KpiCard label="Productos"       value={report.totalActiveProducts}    color="amber" />
              <KpiCard label="Órdenes"         value={report.totalOrders}            color="red" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Revenue chart */}
              {report.revenueByMonth?.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 animate-in delay-2 hover:shadow-card-hover transition-shadow duration-200">
                  <h2 className="font-display font-bold text-[#1A1A1A] mb-5">
                    Ingresos mensuales
                  </h2>
                  <div className="space-y-3">
                    {report.revenueByMonth.map((row) => (
                      <div key={row.month} className="flex items-center gap-3 text-sm">
                        <span className="text-[#999999] font-mono text-xs w-20 shrink-0">
                          {row.month}
                        </span>
                        <div className="flex-1 bg-[#E8E8E8] rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#990100] h-1.5 rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(100, (row.revenue / maxRevenue) * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono font-semibold text-[#990100] text-xs w-24 text-right shrink-0">
                          {formatCurrency(row.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders by status */}
              {report.ordersByStatus?.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 animate-in delay-3 hover:shadow-card-hover transition-shadow duration-200">
                  <h2 className="font-display font-bold text-[#1A1A1A] mb-5">
                    Órdenes por estado
                  </h2>
                  <div className="space-y-3">
                    {report.ordersByStatus.map((row) => {
                      const meta = STATUS_META[row.status] || { label: row.status, color: 'text-[#666666]', bg: 'bg-[#F3F4F6]' };
                      return (
                        <div key={row.status} className="flex items-center justify-between">
                          <span className={`text-xs font-mono font-medium px-2.5 py-1 rounded-full border border-[#E8E8E8] ${meta.bg} ${meta.color}`}>
                            {meta.label}
                          </span>
                          <span className="font-display font-bold text-[#1A1A1A]">{row.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Top entrepreneurs */}
              {report.topEntrepreneurs?.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 lg:col-span-2 animate-in delay-4 hover:shadow-card-hover transition-shadow duration-200">
                  <h2 className="font-display font-bold text-[#1A1A1A] mb-5">
                    Top emprendedores
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left border-b border-[#E8E8E8]">
                          {['Emprendedor', 'Órdenes', 'Ingresos', 'Rating'].map((h) => (
                            <th key={h} className="pb-3 font-mono text-xs text-[#999999] uppercase tracking-wider font-medium pr-4">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8E8E8]">
                        {report.topEntrepreneurs.map((e) => (
                          <tr key={e.id} className="hover:bg-[#F6F6F6] transition-colors">
                            <td className="py-3 pr-4">
                              <p className="font-medium text-[#1A1A1A]">
                                {e.profile?.businessName || e.email}
                              </p>
                              <p className="text-xs text-[#999999]">{e.email}</p>
                            </td>
                            <td className="py-3 pr-4 font-mono text-[#666666]">
                              {e.totalOrders}
                            </td>
                            <td className="py-3 pr-4 font-mono font-semibold text-[#990100]">
                              {formatCurrency(e.totalRevenue)}
                            </td>
                            <td className="py-3">
                              {e.avgRating ? (
                                <div className="flex items-center gap-1.5">
                                  <StarRating value={Math.round(e.avgRating)} readOnly size="sm" />
                                  <span className="text-xs text-[#999999] font-mono">({e.avgRating})</span>
                                </div>
                              ) : (
                                <span className="text-xs text-[#999999]">Sin reseñas</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-[#999999] font-mono mt-6 text-right">
              Generado el {formatDate(new Date().toISOString())}
            </p>
          </>
        )}
      </main>
    </div>
  );
}
