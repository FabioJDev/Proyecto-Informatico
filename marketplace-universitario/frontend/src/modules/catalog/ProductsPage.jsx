import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import ProductCard from '../../components/ui/ProductCard.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { SearchBar, FilterPanel } from '../../components/ui/SearchBar.jsx';
import { useProducts } from '../../hooks/useProducts.js';

export default function ProductsPage() {
  const { products, categories, pagination, filters, isLoading, error, updateFilters, setPage } = useProducts();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Catálogo de productos</h1>
          <SearchBar onSearch={(keyword) => updateFilters({ keyword })} initialValue={filters.keyword} />
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters */}
          <div className="hidden lg:block w-48 shrink-0">
            <FilterPanel categories={categories} filters={filters} onFilterChange={updateFilters} />
          </div>

          {/* Products grid */}
          <div className="flex-1">
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-xl aspect-[3/4] animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-5xl">🔍</span>
                <p className="text-gray-500 mt-4">No se encontraron productos con estos filtros.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
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
