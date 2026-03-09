import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import Navbar from '../../components/layout/Navbar.jsx';
import StarRating from '../../components/ui/StarRating.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

const KPI_PALETTE = {
  primary: { bg: 'bg-[var(--accent-primary-dim)]', border: 'border-[var(--accent-primary)]/20', text: 'text-[var(--accent-primary-soft)]' },
  violet: { bg: 'bg-[var(--accent-tertiary-dim)]', border: 'border-[var(--accent-tertiary)]/20', text: 'text-[var(--accent-tertiary)]' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400' },
  red:     { bg: 'bg-red-500/10',     border: 'border-red-500/20',     text: 'text-red-400' },
};

function KpiCard({ label, value, sub, color = 'primary' }) {
  const p = KPI_PALETTE[color] ?? KPI_PALETTE.primary;
  return (
    <div className={`rounded-2xl border p-5 transition-all hover:-translate-y-0.5 duration-300 ${p.bg} ${p.border}`}>
      <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider mb-2">{label}</p>
      <p className={`font-display text-3xl font-bold ${p.text}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-[var(--text-muted)] mt-1">{sub}</p>}
    </div>
  );
}

const STATUS_META = {
  PENDING:   { label: 'Pendientes',  color: 'text-amber-400',   bg: 'bg-amber-500/10',   bar: 'bg-amber-400' },
  ACCEPTED:  { label: 'Aceptadas',   color: 'text-[var(--accent-primary-soft)]', bg: 'bg-[var(--accent-primary-dim)]', bar: 'bg-[var(--accent-primary)]' },
  DELIVERED: { label: 'Entregadas',  color: 'text-emerald-400', bg: 'bg-emerald-500/10', bar: 'bg-emerald-400' },
  REJECTED:  { label: 'Rechazadas',  color: 'text-red-400',     bg: 'bg-red-500/10',     bar: 'bg-red-400' },
  CANCELLED: { label: 'Canceladas',  color: 'text-[var(--text-muted)]', bg: 'bg-white/[0.04]', bar: 'bg-zinc-500' },
};

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
      <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin-ring"
        style={{ borderTopColor: '#6C63FF', borderRightColor: 'rgba(108,99,255,0.3)' }} />
    </div>
  );
}

export default function AdminDashboardPage() {
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">

        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-8 animate-in">
          Panel de administración
        </h1>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400">
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
                <div className="glass rounded-2xl border border-[var(--border-subtle)] p-5 animate-in delay-2">
                  <h2 className="font-display font-bold text-[var(--text-primary)] mb-5">
                    Ingresos mensuales
                  </h2>
                  <div className="space-y-3">
                    {report.revenueByMonth.map((row) => (
                      <div key={row.month} className="flex items-center gap-3 text-sm">
                        <span className="text-[var(--text-muted)] font-mono text-xs w-20 shrink-0">
                          {row.month}
                        </span>
                        <div className="flex-1 bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-primary h-1.5 rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(100, (row.revenue / maxRevenue) * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono font-semibold text-amber-400 text-xs w-24 text-right shrink-0">
                          {formatCurrency(row.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders by status */}
              {report.ordersByStatus?.length > 0 && (
                <div className="glass rounded-2xl border border-[var(--border-subtle)] p-5 animate-in delay-3">
                  <h2 className="font-display font-bold text-[var(--text-primary)] mb-5">
                    Órdenes por estado
                  </h2>
                  <div className="space-y-3">
                    {report.ordersByStatus.map((row) => {
                      const meta = STATUS_META[row.status] || { label: row.status, color: 'text-[var(--text-muted)]', bg: 'bg-white/[0.04]' };
                      return (
                        <div key={row.status} className="flex items-center justify-between">
                          <span className={`text-xs font-mono font-medium px-2.5 py-1 rounded-full border ${meta.bg} ${meta.color}`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                            {meta.label}
                          </span>
                          <span className="font-display font-bold text-[var(--text-primary)]">{row.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Top entrepreneurs */}
              {report.topEntrepreneurs?.length > 0 && (
                <div className="glass rounded-2xl border border-[var(--border-subtle)] p-5 lg:col-span-2 animate-in delay-4">
                  <h2 className="font-display font-bold text-[var(--text-primary)] mb-5">
                    Top emprendedores
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left border-b border-[var(--border-subtle)]">
                          {['Emprendedor', 'Órdenes', 'Ingresos', 'Rating'].map((h) => (
                            <th key={h} className="pb-3 font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium pr-4">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-subtle)]">
                        {report.topEntrepreneurs.map((e) => (
                          <tr key={e.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 pr-4">
                              <p className="font-medium text-[var(--text-primary)]">
                                {e.profile?.displayName || e.email}
                              </p>
                              <p className="text-xs text-[var(--text-muted)]">{e.email}</p>
                            </td>
                            <td className="py-3 pr-4 font-mono text-[var(--text-secondary)]">
                              {e.totalOrders}
                            </td>
                            <td className="py-3 pr-4 font-mono font-semibold text-emerald-400">
                              {formatCurrency(e.totalRevenue)}
                            </td>
                            <td className="py-3">
                              {e.avgRating ? (
                                <div className="flex items-center gap-1.5">
                                  <StarRating value={Math.round(e.avgRating)} readOnly size="sm" />
                                  <span className="text-xs text-[var(--text-muted)] font-mono">({e.avgRating})</span>
                                </div>
                              ) : (
                                <span className="text-xs text-[var(--text-muted)]">Sin reseñas</span>
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

            <p className="text-xs text-[var(--text-muted)] font-mono mt-6 text-right">
              Generado el {formatDate(new Date().toISOString())}
            </p>
          </>
        )}
      </main>
    </div>
  );
}
