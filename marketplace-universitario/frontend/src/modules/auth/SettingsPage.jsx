import { useAuth } from '../../hooks/useAuth.js';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import { RoleBadge } from '../../components/ui/Badge.jsx';
import { formatDate } from '../../utils/formatters.js';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-8 animate-in">
          Configuración de cuenta
        </h1>

        <div className="glass rounded-2xl border border-[var(--border-subtle)] p-6 space-y-5 animate-in delay-1">
          {/* User header */}
          <div className="flex items-center gap-4">
            <div className="
              w-14 h-14 rounded-2xl shrink-0
              bg-gradient-primary
              flex items-center justify-center
              font-display font-bold text-2xl text-white
              shadow-glow-primary
            ">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">{user?.email}</p>
              <div className="mt-1">
                <RoleBadge role={user?.role} />
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border-subtle)]" />

          {/* Details grid */}
          <dl className="grid grid-cols-2 gap-5 text-sm">
            <div>
              <dt className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">Correo</dt>
              <dd className="font-medium text-[var(--text-primary)]">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">Rol</dt>
              <dd className="font-medium text-[var(--text-primary)]">{user?.role}</dd>
            </div>
            <div>
              <dt className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">Miembro desde</dt>
              <dd className="font-medium text-[var(--text-primary)]">
                {user?.createdAt ? formatDate(user.createdAt) : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">Estado</dt>
              <dd className="flex items-center gap-1.5 font-medium text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
                Activo
              </dd>
            </div>
          </dl>
        </div>
      </main>

      <Footer />
    </div>
  );
}
