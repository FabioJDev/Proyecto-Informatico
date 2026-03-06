import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'}`;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="font-bold text-gray-900 hidden sm:block">Marketplace Uni</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/products" className={navLinkClass}>Productos</NavLink>

            {isAuthenticated && user?.role === 'COMPRADOR' && (
              <NavLink to="/my-orders" className={navLinkClass}>Mis Pedidos</NavLink>
            )}
            {isAuthenticated && user?.role === 'EMPRENDEDOR' && (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
                <NavLink to="/my-products" className={navLinkClass}>Mis Productos</NavLink>
                <NavLink to="/seller-orders" className={navLinkClass}>Pedidos</NavLink>
              </>
            )}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
            )}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                    {user?.email?.[0]?.toUpperCase()}
                  </span>
                  <span className="hidden sm:block max-w-[120px] truncate">{user?.email}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link to="/settings" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Configuración</Link>
                    {user?.role === 'EMPRENDEDOR' && (
                      <Link to="/profile/edit" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Mi Perfil</Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Iniciar sesión</Link>
                <Link to="/register" className="text-sm font-medium bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
