import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import ProductCard from '../../components/ui/ProductCard.jsx';
import { useProducts } from '../../hooks/useProducts.js';

export default function LandingPage() {
  const { products, isLoading } = useProducts({ limit: 8 });

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F6]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        {/* Subtle red corner gradients */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at 100% 0%, rgba(153,1,0,0.05) 0%, transparent 45%), radial-gradient(circle at 0% 100%, rgba(153,1,0,0.03) 0%, transparent 45%)'
        }} />

        <div className="relative max-w-4xl mx-auto text-center py-24 px-4">
          {/* Watermark */}
          <p className="font-display font-black text-[clamp(4rem,12vw,9rem)] leading-none select-none pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-[0.03] text-[#990100] z-0">
            MERCADO
          </p>

          <div className="relative z-10 animate-in">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#990100] mb-5">
              Marketplace Universitario · UAO
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#1A1A1A] leading-tight mb-4">
              Apoya a los{' '}
              <span className="gradient-text">emprendedores</span>
              <br />de tu universidad
            </h1>
            <p className="text-[#666666] text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
              Descubre productos y servicios únicos creados por estudiantes emprendedores.
              Compra local, apoya el talento universitario.
            </p>
          </div>

          {/* Stat badges */}
          <div className="relative z-10 flex flex-wrap justify-center gap-4 my-10 animate-in delay-1">
            {[
              { value: '100+', label: 'Productos' },
              { value: '50+', label: 'Emprendedores' },
              { value: '200+', label: 'Estudiantes' },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="bg-white border border-[#E8E8E8] rounded-2xl px-6 py-4 hover:border-[#990100] hover:shadow-glow-primary transition-all duration-200"
              >
                <p className="font-display font-bold text-2xl text-[#990100]">{value}</p>
                <p className="font-mono text-xs text-[#666666] uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center animate-in delay-2">
            <Link
              to="/products"
              className="
                inline-flex items-center justify-center
                px-8 py-3 text-sm font-semibold text-[#F6F6F6]
                bg-[#990100] hover:bg-[#B90504] hover:-translate-y-0.5 hover:shadow-glow-primary
                transition-all duration-200 animate-glow-pulse
              "
              style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)' }}
            >
              Ver todos los productos
            </Link>
            <Link
              to="/register?role=EMPRENDEDOR"
              className="inline-flex items-center justify-center px-8 py-3 text-sm font-semibold text-[#333333] border-2 border-[#333333] hover:border-[#990100] hover:text-[#990100] hover:bg-[rgba(153,1,0,0.04)] transition-all duration-200 rounded-none"
            >
              Soy emprendedor →
            </Link>
          </div>
        </div>
      </section>

      {/* Section divider */}
      <div className="flex items-center justify-center gap-2 py-2">
        <div className="h-px w-24 bg-gradient-to-r from-transparent to-[#E8E8E8]" />
        <span className="text-[#990100] text-xs">●●●</span>
        <div className="h-px w-24 bg-gradient-to-l from-transparent to-[#E8E8E8]" />
      </div>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex items-center justify-between mb-8 animate-in">
          <h2 className="font-display text-2xl font-bold text-[#1A1A1A]">Productos recientes</h2>
          <Link to="/products" className="text-xs font-mono uppercase tracking-widest text-[#990100] hover:text-[#B90504] transition-colors">
            Ver todos →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton rounded-xl aspect-[3/4]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* CTA section */}
      <section className="bg-[#333333] py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-mono text-[#999999] uppercase tracking-[0.25em] mb-4">¿Listo para vender?</p>
          <h2 className="font-display text-2xl font-bold text-[#F6F6F6] mb-3">¿Tienes un emprendimiento?</h2>
          <p className="text-[#999999] mt-3 leading-relaxed">Publica tus productos y llega a toda la comunidad universitaria.</p>
          <Link
            to="/register"
            className="
              inline-flex items-center justify-center mt-8
              px-8 py-3 text-sm font-semibold text-[#F6F6F6]
              bg-[#990100] hover:bg-[#B90504] hover:-translate-y-0.5 hover:shadow-glow-primary
              transition-all duration-200 animate-glow-pulse
            "
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)' }}
          >
            Empieza a vender
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
