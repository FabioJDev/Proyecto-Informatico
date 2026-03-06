import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <span className="font-semibold text-gray-800">Marketplace Universitario</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/products" className="hover:text-gray-800 transition-colors">Productos</Link>
            <Link to="/register" className="hover:text-gray-800 transition-colors">Registrarse</Link>
          </nav>
          <p className="text-sm text-gray-400">&copy; {year} Marketplace Universitario. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
