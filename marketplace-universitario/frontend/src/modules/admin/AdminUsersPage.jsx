import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api.js';
import Navbar from '../../components/layout/Navbar.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { formatDate } from '../../utils/formatters.js';

const ROLE_LABELS = { EMPRENDEDOR: 'Emprendedor', COMPRADOR: 'Comprador', ADMIN: 'Admin' };
const STATUS_LABELS = { ACTIVE: 'Activo', SUSPENDED: 'Suspendido', BANNED: 'Baneado' };

export default function AdminUsersPage() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(null); // { user, action }
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = useCallback((page = 1) => {
    setIsLoading(true);
    const params = { page, limit: 20 };
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    if (statusFilter) params.status = statusFilter;

    api.get('/users', { params })
      .then((res) => {
        setUsers(res.data.data);
        setPagination(res.data.pagination);
      })
      .catch(() => addToast('Error al cargar usuarios.', 'error'))
      .finally(() => setIsLoading(false));
  }, [search, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  const handleStatusChange = async () => {
    if (!modal) return;
    setIsUpdating(true);
    try {
      const newStatus = modal.action === 'suspend' ? 'SUSPENDED' : 'ACTIVE';
      await api.patch(`/users/${modal.user.id}/status`, { status: newStatus });
      addToast(`Usuario ${newStatus === 'SUSPENDED' ? 'suspendido' : 'reactivado'} correctamente.`, 'success');
      setModal(null);
      fetchUsers(pagination.page);
    } catch (err) {
      addToast(err.userMessage || 'Error al actualizar estado.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const statusBadgeVariant = (status) => {
    if (status === 'ACTIVE') return 'success';
    if (status === 'SUSPENDED') return 'warning';
    return 'error';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de usuarios</h1>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Buscar por email o nombre…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers(1)}
            className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
          >
            <option value="">Todos los roles</option>
            <option value="EMPRENDEDOR">Emprendedor</option>
            <option value="COMPRADOR">Comprador</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVE">Activo</option>
            <option value="SUSPENDED">Suspendido</option>
          </select>
          <Button onClick={() => fetchUsers(1)} size="sm">Buscar</Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="space-y-0 divide-y divide-gray-100">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse bg-gray-50 mx-4 my-2 rounded-lg" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p>No se encontraron usuarios.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Usuario</th>
                  <th className="px-4 py-3 font-medium">Rol</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Registro</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 truncate max-w-xs">
                        {user.profile?.displayName || '—'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600">{ROLE_LABELS[user.role] || user.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadgeVariant(user.status)}>
                        {STATUS_LABELS[user.status] || user.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {user.role !== 'ADMIN' && (
                        user.status === 'ACTIVE' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-yellow-600 hover:bg-yellow-50"
                            onClick={() => setModal({ user, action: 'suspend' })}
                          >
                            Suspender
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => setModal({ user, action: 'reactivate' })}
                          >
                            Reactivar
                          </Button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4">
          <Pagination pagination={pagination} onPageChange={fetchUsers} />
        </div>
      </main>

      {/* Confirmation modal */}
      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal?.action === 'suspend' ? 'Suspender usuario' : 'Reactivar usuario'}
        confirmLabel={modal?.action === 'suspend' ? 'Suspender' : 'Reactivar'}
        confirmVariant={modal?.action === 'suspend' ? 'danger' : 'primary'}
        onConfirm={handleStatusChange}
        isLoading={isUpdating}
      >
        <p className="text-gray-600">
          {modal?.action === 'suspend'
            ? `¿Deseas suspender la cuenta de ${modal?.user?.email}? El usuario no podrá iniciar sesión.`
            : `¿Deseas reactivar la cuenta de ${modal?.user?.email}?`}
        </p>
      </Modal>
    </div>
  );
}
