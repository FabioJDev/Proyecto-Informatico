import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import ProductCard from '../../components/ui/ProductCard.jsx';
import { useProducts } from '../../hooks/useProducts.js';

export default function LandingPage() {
  const { products, isLoading } = useProducts({ limit: 8 });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            Apoya a los emprendedores<br />de tu universidad 🎓
          </h1>
          <p className="text-primary-200 text-lg mt-4 max-w-2xl mx-auto">
            Descubre productos y servicios únicos creados por estudiantes emprendedores.
            Compra local, apoya el talento universitario.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link to="/products" className="px-8 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
              Ver todos los productos
            </Link>
            <Link to="/register?role=EMPRENDEDOR" className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-xl border border-primary-500 hover:bg-primary-500 transition-colors">
              Soy emprendedor →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Productos recientes</h2>
          <Link to="/products" className="text-primary-600 text-sm font-medium hover:text-primary-700">Ver todos →</Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-primary-50 border-t border-primary-100 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900">¿Tienes un emprendimiento?</h2>
          <p className="text-gray-600 mt-3">Publica tus productos y llega a toda la comunidad universitaria.</p>
          <Link to="/register" className="inline-block mt-6 px-8 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">
            Empieza a vender
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
