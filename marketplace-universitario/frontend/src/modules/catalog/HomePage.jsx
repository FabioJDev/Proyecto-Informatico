import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import { useAuthStore } from '../../store/authStore.js';

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      {/* Hero section */}
      <section className="bg-primary-600 text-white py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-auth-pattern opacity-10" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-primary-200 text-sm font-medium uppercase tracking-widest mb-4">
            Marketplace Universitario
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            El marketplace de<br />tu universidad
          </h1>
          <p className="text-primary-200 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Compra y vende dentro de tu comunidad universitaria. Apoya el emprendimiento local, descubre productos únicos.
          </p>

          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user?.role === 'EMPRENDEDOR' ? (
                <Link
                  to="/dashboard"
                  className="px-8 py-3.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Ir a mi dashboard
                </Link>
              ) : (
                <Link
                  to="/products"
                  className="px-8 py-3.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Ver catálogo
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-3.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                Crear cuenta gratis
              </Link>
              <Link
                to="/login"
                className="px-8 py-3.5 bg-primary-500 text-white font-semibold rounded-xl border border-primary-400 hover:bg-primary-400 transition-colors"
              >
                Iniciar sesión
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 w-full">
        <h2 className="font-heading text-2xl font-bold text-gray-900 text-center mb-12">
          ¿Cómo funciona?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              ),
              title: 'Regístrate',
              desc: 'Crea tu cuenta con tu correo institucional en menos de 2 minutos.',
            },
            {
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              ),
              title: 'Explora',
              desc: 'Descubre productos y servicios únicos de emprendedores de tu universidad.',
            },
            {
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
              title: 'Compra o vende',
              desc: 'Realiza pedidos directamente a los emprendedores o publica tus propios productos.',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 p-7 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="mx-auto mb-4 w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                {icon}
              </div>
              <h3 className="font-heading font-bold text-gray-900 text-lg mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sprint 2 notice */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 w-full">
        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-8 text-center">
          <div className="mx-auto mb-3 w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-heading font-semibold text-primary-800 mb-1">Catálogo disponible próximamente</h3>
          <p className="text-primary-700 text-sm">
            El catálogo completo de productos estará disponible en el <strong>Sprint 2</strong>. Por ahora puedes registrarte y preparar tu cuenta.
          </p>
        </div>
      </section>

      {/* CTA for non-authenticated users */}
      {!isAuthenticated && (
        <section className="bg-primary-600 py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-heading text-2xl font-bold text-white mb-3">
              ¿Tienes un emprendimiento?
            </h2>
            <p className="text-primary-200 mb-8">
              Publica tus productos y llega a toda la comunidad universitaria.
            </p>
            <Link
              to="/register"
              className="inline-block px-8 py-3.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Empieza a vender
            </Link>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
