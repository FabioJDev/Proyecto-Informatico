import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import Navbar from '../../components/layout/Navbar.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge, { RoleBadge } from '../../components/ui/Badge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { formatDate } from '../../utils/formatters.js';

const STATUS_BADGE = {
  ACTIVE:    { label: 'Activo',     color: 'green' },
  SUSPENDED: { label: 'Suspendido', color: 'yellow' },
  BANNED:    { label: 'Baneado',    color: 'red' },
};

const inputClass = `
  px-4 py-2.5 rounded-xl text-sm
  bg-white text-[#1A1A1A]
  border-[1.5px] border-[#E8E8E8]
  placeholder:text-[#999999]
  hover:border-[#CCCCCC]
  focus:outline-none focus:border-[#990100] focus:ring-[3px] focus:ring-[rgba(153,1,0,0.10)]
  transition-all duration-200
`;

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const { addToast }  = useToast();
  const [users,       setUsers]       = useState([]);
  const [pagination,  setPagination]  = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [isLoading,   setIsLoading]   = useState(true);
  const [search,      setSearch]      = useState('');
  const [roleFilter,  setRoleFilter]  = useState('');
  const [statusFilter,setStatusFilter]= useState('');
  const [modal,       setModal]       = useState(null);
  const [isUpdating,  setIsUpdating]  = useState(false);

  const fetchUsers = useCallback((page = 1) => {
    setIsLoading(true);
    const params = { page, limit: 20 };
    if (search)       params.search = search;
    if (roleFilter)   params.role   = roleFilter;
    if (statusFilter) params.status = statusFilter;

    api.get('/users', { params })
      .then((res) => { setUsers(res.data.data); setPagination(res.data.pagination); })
      .catch(() => addToast('Error al cargar usuarios.', 'error'))
      .finally(() => setIsLoading(false));
  }, [search, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  const handleStatusChange = async () => {
    if (!modal) return;
    setIsUpdating(true);
    try {
      let newStatus = 'ACTIVE';
      if (modal.action === 'suspend') newStatus = 'SUSPENDED';
      else if (modal.action === 'delete') newStatus = 'DELETED';
      
      await api.patch(`/users/${modal.user.id}/status`, { status: newStatus });
      
      const statusMessages = {
        suspend: 'Usuario suspendido correctamente.',
        reactivate: 'Usuario reactivado correctamente.',
        delete: 'Usuario eliminado correctamente.'
      };
      addToast(statusMessages[modal.action], 'success');
      setModal(null);
      fetchUsers(pagination.page);
    } catch (err) {
      addToast(err.userMessage || 'Error al actualizar estado.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

return (
  <div className="min-h-screen flex flex-col bg-[#F6F6F6]">
    <Navbar />

    <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/admin')}
            variant="ghost"
            size="md"
            className="text-[#666666] hover:text-[#990100]"
          >
            ← Volver
          </Button>

          <h1 className="font-display text-3xl font-bold text-[#1A1A1A]">
            Gestión de usuarios
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E8E8E8] p-4 mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por email o nombre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchUsers(1)}
          className={`${inputClass} flex-1 min-w-[200px]`}
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className={inputClass}
        >
          <option value="">Todos los roles</option>
          <option value="EMPRENDEDOR">Emprendedor</option>
          <option value="COMPRADOR">Comprador</option>
          <option value="ADMIN">Admin</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={inputClass}
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVE">Activo</option>
          <option value="SUSPENDED">Suspendido</option>
        </select>

        <Button onClick={() => fetchUsers(1)} size="sm">
          Buscar
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl skeleton" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-[#999999] text-sm">
            No se encontraron usuarios.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F6F6F6] border-b border-[#E8E8E8]">
              <tr className="text-left">
                <th className="px-4 py-3 text-xs text-[#999999] uppercase">Usuario</th>
                <th className="px-4 py-3 text-xs text-[#999999]">Rol</th>
                <th className="px-4 py-3 text-xs text-[#999999]">Estado</th>
                <th className="px-4 py-3 text-xs text-[#999999] hidden sm:table-cell">Registro</th>
                <th className="px-4 py-3 text-xs text-[#999999] text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E8E8E8]">
              {users.map((user) => {
                const s = STATUS_BADGE[user.status] ?? { label: user.status, color: 'gray' };

                return (
                  <tr key={user.id} className="hover:bg-[#F6F6F6] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#1A1A1A] truncate max-w-xs">
                        {user.profile?.businessName || user.email}
                      </p>
                      <p className="text-xs text-[#999999] truncate">
                        {user.email}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>

                    <td className="px-4 py-3">
                      <Badge color={s.color}>{s.label}</Badge>
                    </td>

                    <td className="px-4 py-3 text-xs text-[#999999] hidden sm:table-cell">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {user.role !== 'ADMIN' && (
                        <div className="flex justify-end gap-2">
                          {user.status === 'ACTIVE' ? (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-[#B45309]"
                                onClick={() => setModal({ user, action: 'suspend' })}
                              >
                                Suspender
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-[#990100]"
                                onClick={() => setModal({ user, action: 'delete' })}
                              >
                                Eliminar
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[#065F46]"
                              onClick={() => setModal({ user, action: 'reactivate' })}
                            >
                              Reactivar
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center">
        <Pagination pagination={pagination} onPageChange={fetchUsers} />
      </div>
    </main>

    {/* Modal */}
    <Modal
      isOpen={!!modal}
      onClose={() => setModal(null)}
      title={
        modal?.action === 'suspend'
          ? 'Suspender usuario'
          : modal?.action === 'delete'
          ? 'Eliminar usuario'
          : 'Reactivar usuario'
      }
      confirmLabel={
        modal?.action === 'suspend'
          ? 'Suspender'
          : modal?.action === 'delete'
          ? 'Eliminar'
          : 'Reactivar'
      }
      confirmVariant={
        modal?.action === 'suspend' || modal?.action === 'delete'
          ? 'danger'
          : 'primary'
      }
      onConfirm={handleStatusChange}
      isLoading={isUpdating}
    >
      <p>
        {modal?.action === 'suspend'
          ? `¿Deseas suspender la cuenta de ${modal?.user?.email}?`
          : modal?.action === 'delete'
          ? `¿Eliminar permanentemente ${modal?.user?.email}?`
          : `¿Deseas reactivar la cuenta de ${modal?.user?.email}?`}
      </p>
    </Modal>
  </div>
);
}