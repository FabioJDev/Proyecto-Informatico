import { useAuth } from '../../hooks/useAuth.js';
import Navbar from '../../components/layout/Navbar.jsx';
import { RoleBadge } from '../../components/ui/Badge.jsx';
import { formatDate } from '../../utils/formatters.js';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Configuración de cuenta</h1>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold">
              {user?.email?.[0]?.toUpperCase()}
            </span>
            <div>
              <p className="font-semibold text-gray-900">{user?.email}</p>
              <RoleBadge role={user?.role} />
            </div>
          </div>

          <hr className="border-gray-100" />

          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Correo</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Rol</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{user?.role}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Miembro desde</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{user?.createdAt ? formatDate(user.createdAt) : '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Estado</dt>
              <dd className="font-medium text-green-600 mt-0.5">Activo</dd>
            </div>
          </dl>
        </div>
      </main>
    </div>
  );
}
