import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function Sidebar() {
  const { user, isEmprendedor, isAdmin } = useAuth();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
    }`;

  if (!user) return null;

  return (
    <aside className="w-56 shrink-0">
      <nav className="space-y-1">
        {isEmprendedor && (
          <>
            <NavLink to="/dashboard" className={linkClass}>📊 Dashboard</NavLink>
            <NavLink to="/my-products" className={linkClass}>📦 Mis Productos</NavLink>
            <NavLink to="/seller-orders" className={linkClass}>🛒 Pedidos Recibidos</NavLink>
            <NavLink to="/profile/edit" className={linkClass}>✏️ Mi Perfil</NavLink>
          </>
        )}
        {isAdmin && (
          <>
            <NavLink to="/admin" className={linkClass}>📊 Dashboard</NavLink>
            <NavLink to="/admin/users" className={linkClass}>👤 Usuarios</NavLink>
            <NavLink to="/admin/products" className={linkClass}>📦 Productos</NavLink>
          </>
        )}
        <NavLink to="/settings" className={linkClass}>⚙️ Configuración</NavLink>
      </nav>
    </aside>
  );
}
