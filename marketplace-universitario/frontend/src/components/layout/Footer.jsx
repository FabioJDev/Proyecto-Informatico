import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto" style={{ borderTop: '2px solid transparent', borderImage: 'linear-gradient(to right, transparent, #990100, transparent) 1' }}>
      {/* Main footer — dark */}
      <div className="bg-[#333333]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Brand */}
            <div className="flex items-center gap-3">
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="4" fill="#B90504" />
                <path d="M5 21V7l9 10 9-10v14" stroke="#F6F6F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <span className="font-display font-bold text-[#F6F6F6] text-sm tracking-wider">
                Marketplace Universitario
              </span>
            </div>

            {/* Nav links */}
            <nav className="flex items-center gap-6 text-sm">
              <Link to="/products" className="text-[#E8E8E8] hover:text-[#B90504] transition-colors duration-200">
                Productos
              </Link>
              <Link to="/register" className="text-[#E8E8E8] hover:text-[#B90504] transition-colors duration-200">
                Registrarse
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="bg-[#1A1A1A] py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-[#999999] font-mono text-center">
            &copy; {year} MktUni
            <span className="text-[#990100] mx-2">●</span>
            UAO
            <span className="text-[#990100] mx-2">●</span>
            Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
