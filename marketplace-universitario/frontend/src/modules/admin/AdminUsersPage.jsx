import { useState, useEffect, useCallback } from 'react';
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

const darkInput = `
  px-3 py-2 rounded-xl text-sm
  bg-[var(--bg-surface)] text-[var(--text-primary)]
  border border-[var(--border-subtle)]
  placeholder:text-[var(--text-muted)]
  hover:border-[var(--border-strong)]
  focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20
  transition-all duration-200
`;

export default function AdminUsersPage() {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-8 animate-in">
          Gestión de usuarios
        </h1>

        {/* Filters */}
        <div className="glass rounded-2xl border border-[var(--border-subtle)] p-4 mb-5 flex flex-wrap gap-3 animate-in delay-1">
          <input
            type="text"
            placeholder="Buscar por email o nombre…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers(1)}
            className={`${darkInput} flex-1 min-w-48`}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={darkInput}
          >
            <option value="">Todos los roles</option>
            <option value="EMPRENDEDOR">Emprendedor</option>
            <option value="COMPRADOR">Comprador</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={darkInput}
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVE">Activo</option>
            <option value="SUSPENDED">Suspendido</option>
          </select>
          <Button onClick={() => fetchUsers(1)} size="md">Buscar</Button>
        </div>

        {/* Table */}
        <div className="glass rounded-2xl border border-[var(--border-subtle)] overflow-hidden animate-in delay-2">
          {isLoading ? (
            <div className="divide-y divide-[var(--border-subtle)]">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-16 m-3 rounded-xl skeleton" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-[var(--text-muted)]">
              No se encontraron usuarios.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--border-subtle)]">
                <tr>
                  {['Usuario', 'Rol', 'Estado', 'Registro', 'Acciones'].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium text-left ${i === 4 ? 'text-right' : ''} ${h === 'Registro' ? 'hidden sm:table-cell' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {users.map((user) => {
                  const s = STATUS_BADGE[user.status] ?? { label: user.status, color: 'gray' };
                  return (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--text-primary)] truncate max-w-xs">
                          {user.profile?.displayName || '—'}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-3">
                        <Badge color={s.color}>{s.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-muted)] font-mono hidden sm:table-cell">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {user.role !== 'ADMIN' && (
                          user.status === 'ACTIVE' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-amber-400 hover:bg-amber-500/10"
                              onClick={() => setModal({ user, action: 'suspend' })}
                            >
                              Suspender
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-emerald-400 hover:bg-emerald-500/10"
                              onClick={() => setModal({ user, action: 'reactivate' })}
                            >
                              Reactivar
                            </Button>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <Pagination pagination={pagination} onPageChange={fetchUsers} />
      </main>

      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal?.action === 'suspend' ? 'Suspender usuario' : 'Reactivar usuario'}
        confirmLabel={modal?.action === 'suspend' ? 'Suspender' : 'Reactivar'}
        confirmVariant={modal?.action === 'suspend' ? 'danger' : 'primary'}
        onConfirm={handleStatusChange}
        isLoading={isUpdating}
      >
        <p>
          {modal?.action === 'suspend'
            ? `¿Deseas suspender la cuenta de ${modal?.user?.email}? El usuario no podrá iniciar sesión.`
            : `¿Deseas reactivar la cuenta de ${modal?.user?.email}?`
          }
        </p>
      </Modal>
    </div>
  );
}
