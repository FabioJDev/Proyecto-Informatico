import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import ProductCard from '../../components/ui/ProductCard.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { SearchBar, FilterPanel } from '../../components/ui/SearchBar.jsx';
import { useProducts } from '../../hooks/useProducts.js';

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-2">
        <div className="h-3 rounded skeleton w-1/3" />
        <div className="h-4 rounded skeleton w-full" />
        <div className="h-4 rounded skeleton w-2/3" />
        <div className="h-6 rounded-lg skeleton w-1/4 mt-3" />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { products, categories, pagination, filters, isLoading, error, updateFilters, setPage } = useProducts();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 animate-in">
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-2">
            Catálogo
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            Descubre productos y servicios de emprendedores universitarios
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 animate-in delay-1">
          <SearchBar
            onSearch={(keyword) => updateFilters({ keyword })}
            initialValue={filters.keyword}
          />
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters */}
          <div className="hidden lg:block w-52 shrink-0 animate-in delay-2">
            <FilterPanel categories={categories} filters={filters} onFilterChange={updateFilters} />
          </div>

          {/* Products grid */}
          <div className="flex-1">
            {error && (
              <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 animate-in">
                <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-[var(--accent-primary-dim)] border border-[var(--accent-primary)]/20 flex items-center justify-center">
                  <svg className="w-10 h-10 text-[var(--accent-primary-soft)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-display font-bold text-[var(--text-primary)] text-lg mb-2">
                  Sin resultados
                </h3>
                <p className="text-[var(--text-muted)] text-sm">
                  No se encontraron productos con estos filtros.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p, i) => (
                  <div
                    key={p.id}
                    className="animate-in"
                    style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
                  >
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}

            <Pagination pagination={pagination} onPageChange={setPage} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
