import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L18 10L10 18L2 10L10 2Z" fill="url(#footerDiamond)" />
              <defs>
                <linearGradient id="footerDiamond" x1="2" y1="2" x2="18" y2="18" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6C63FF" />
                  <stop offset="1" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
            </svg>
            <span className="font-display font-semibold text-[var(--text-secondary)] text-sm">
              Marketplace Universitario
            </span>
          </div>

          <nav className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
            <Link to="/products" className="hover:text-[var(--text-secondary)] transition-colors duration-200">
              Productos
            </Link>
            <Link to="/register" className="hover:text-[var(--text-secondary)] transition-colors duration-200">
              Registrarse
            </Link>
          </nav>

          <p className="text-xs text-[var(--text-muted)] font-mono">
            &copy; {year} MktUni. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
