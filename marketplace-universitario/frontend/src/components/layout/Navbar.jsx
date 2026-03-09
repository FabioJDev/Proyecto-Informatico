import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useState, useEffect, useRef } from 'react';

function MLogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect width="28" height="28" rx="4" fill="var(--accent-primary)" />
      <path
        d="M5 21V7l9 10 9-10v14"
        stroke="#FAF0F2"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    setMobileOpen(false);
    await logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `relative text-xs font-mono font-medium uppercase tracking-[0.12em] transition-colors duration-200 py-1
     after:absolute after:bottom-0 after:left-0 after:h-px after:bg-[var(--accent-primary)]
     after:transition-all after:duration-300
     ${isActive
       ? 'text-[var(--accent-primary-soft)] after:w-full'
       : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] after:w-0 hover:after:w-full'
     }`;

  return (
    <>
      <nav
        className={`
          sticky top-0 z-40
          border-b border-[var(--border-subtle)]
          backdrop-blur-xl
          transition-all duration-300
          ${scrolled
            ? 'bg-[var(--bg-base)]/95 shadow-navbar border-l-4 border-l-[var(--accent-primary)]'
            : 'bg-[var(--bg-base)]/70'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo — M mark + MERCADO wordmark */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <MLogoMark />
              <div className="hidden sm:flex flex-col leading-none">
                <span className="font-display font-extrabold text-base tracking-widest uppercase text-[var(--text-primary)] group-hover:text-[var(--accent-primary-soft)] transition-colors duration-200">
                  MERCADO
                </span>
                <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-widest uppercase mt-0.5">
                  UAO · Campus
                </span>
              </div>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-7">
              <NavLink to="/products" className={navLinkClass}>Productos</NavLink>

              {isAuthenticated && user?.role === 'COMPRADOR' && (
                <NavLink to="/my-orders" className={navLinkClass}>Mis Pedidos</NavLink>
              )}
              {isAuthenticated && user?.role === 'EMPRENDEDOR' && (
                <>
                  <NavLink to="/dashboard"    className={navLinkClass}>Dashboard</NavLink>
                  <NavLink to="/my-products"  className={navLinkClass}>Productos</NavLink>
                  <NavLink to="/seller-orders" className={navLinkClass}>Pedidos</NavLink>
                </>
              )}
              {isAuthenticated && user?.role === 'ADMIN' && (
                <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex items-center gap-2.5 group focus:outline-none"
                    aria-expanded={menuOpen}
                    aria-haspopup="true"
                  >
                    <span className="
                      w-8 h-8 rounded-lg
                      bg-gradient-primary
                      flex items-center justify-center
                      font-display font-bold text-sm text-white
                      ring-2 ring-transparent group-hover:ring-[var(--accent-primary)]/50
                      transition-all duration-200
                    ">
                      {user?.email?.[0]?.toUpperCase()}
                    </span>
                    <span className="hidden sm:block max-w-[140px] truncate text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                      {user?.email}
                    </span>
                    <svg className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {menuOpen && (
                    <div className="
                      absolute right-0 mt-2 w-52
                      bg-[var(--bg-elevated)] rounded-2xl
                      border border-[var(--border-strong)]
                      shadow-2xl backdrop-blur-xl
                      py-1.5 z-50
                      animate-slide-down
                    ">
                      <Link
                        to="/settings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.05] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Configuración
                      </Link>
                      {user?.role === 'EMPRENDEDOR' && (
                        <Link
                          to="/profile/edit"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.05] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                          Mi Perfil
                        </Link>
                      )}
                      <div className="my-1.5 border-t border-[var(--border-subtle)]" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-[var(--accent-primary-soft)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary-dim)] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex text-xs font-mono font-medium uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
                  >
                    Ingresar
                  </Link>
                  {/* Clip-path tag CTA */}
                  <Link
                    to="/register"
                    className="
                      inline-flex items-center justify-center
                      px-5 py-2 text-xs font-mono font-semibold uppercase tracking-widest text-white
                      bg-[var(--accent-primary)]
                      hover:bg-[var(--accent-primary-soft)] hover:-translate-y-0.5
                      transition-all duration-200
                      animate-glow-pulse
                    "
                    style={{
                      clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)',
                    }}
                  >
                    Registrarse
                  </Link>
                </>
              )}

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.05] transition-colors"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Menú"
              >
                {mobileOpen ? <XIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="
            fixed top-16 left-0 right-0 z-30 md:hidden
            bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]
            animate-slide-down p-4 space-y-1
          ">
            <MobileLink to="/products" onClick={() => setMobileOpen(false)}>Productos</MobileLink>
            {isAuthenticated && user?.role === 'COMPRADOR' && (
              <MobileLink to="/my-orders" onClick={() => setMobileOpen(false)}>Mis Pedidos</MobileLink>
            )}
            {isAuthenticated && user?.role === 'EMPRENDEDOR' && (
              <>
                <MobileLink to="/dashboard"     onClick={() => setMobileOpen(false)}>Dashboard</MobileLink>
                <MobileLink to="/my-products"   onClick={() => setMobileOpen(false)}>Mis Productos</MobileLink>
                <MobileLink to="/seller-orders" onClick={() => setMobileOpen(false)}>Pedidos</MobileLink>
              </>
            )}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <MobileLink to="/admin" onClick={() => setMobileOpen(false)}>Admin</MobileLink>
            )}
            {!isAuthenticated && (
              <>
                <MobileLink to="/login"    onClick={() => setMobileOpen(false)}>Iniciar sesión</MobileLink>
                <MobileLink to="/register" onClick={() => setMobileOpen(false)}>Registrarse</MobileLink>
              </>
            )}
            {isAuthenticated && (
              <>
                <div className="border-t border-[var(--border-subtle)] my-2" />
                <MobileLink to="/settings" onClick={() => setMobileOpen(false)}>Configuración</MobileLink>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2.5 rounded-xl text-sm font-mono font-medium uppercase tracking-wider text-[var(--accent-primary-soft)] hover:bg-[var(--accent-primary-dim)] transition-colors"
                >
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

function MobileLink({ to, onClick, children }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `block px-3 py-2.5 rounded-xl text-xs font-mono font-medium uppercase tracking-wider transition-colors
         ${isActive
           ? 'bg-[var(--accent-primary-dim)] text-[var(--accent-primary-soft)]'
           : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.05]'
         }`
      }
    >
      {children}
    </NavLink>
  );
}
