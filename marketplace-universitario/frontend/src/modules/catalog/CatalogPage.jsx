import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import ProductCard from '../../components/ui/ProductCard.jsx';
import { formatCurrency } from '../../utils/formatters.js';

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#E8E8E8] bg-white min-w-0">
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

// ─── Pagination with ellipsis ─────────────────────────────────────────────────
function CatalogPagination({ pagination, onPageChange }) {
  const { page, pages, total, limit, hasNext, hasPrev } = pagination;
  if (!pages || pages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);

  const getPageNums = () => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    if (page <= 4)  return [1, 2, 3, 4, 5, '...', pages];
    if (page >= pages - 3) return [1, '...', pages - 4, pages - 3, pages - 2, pages - 1, pages];
    return [1, '...', page - 1, page, page + 1, '...', pages];
  };

  const navBtn = 'px-3 sm:px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed border-[#E8E8E8] text-[#333333] hover:border-[#990100] hover:text-[#990100]';

  return (
    <div className="mt-12 space-y-3">
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        <button onClick={() => onPageChange(page - 1)} disabled={!hasPrev} className={navBtn}>
          ← Anterior
        </button>
        {getPageNums().map((num, i) =>
          num === '...' ? (
            <span key={`e${i}`} className="w-8 text-center text-[#999999] font-mono text-sm select-none">…</span>
          ) : (
            <button
              key={num}
              onClick={() => onPageChange(num)}
              className={`w-9 h-9 text-sm font-mono font-semibold rounded-lg border transition-all ${
                num === page
                  ? 'bg-[#990100] text-white border-[#990100]'
                  : 'border-[#E8E8E8] text-[#333333] hover:border-[#990100] hover:text-[#990100]'
              }`}
            >
              {num}
            </button>
          )
        )}
        <button onClick={() => onPageChange(page + 1)} disabled={!hasNext} className={navBtn}>
          Siguiente →
        </button>
      </div>
      <p className="text-center text-sm text-[#666666] font-mono">
        Mostrando {start}–{end} de {total} productos
      </p>
    </div>
  );
}

// ─── Price range popover ──────────────────────────────────────────────────────
function PricePopover({ minPrice, maxPrice, onApply, onClose, anchorRef }) {
  const [min, setMin] = useState(minPrice || '');
  const [max, setMax] = useState(maxPrice || '');
  const popRef = useRef(null);

  useEffect(() => { setMin(minPrice || ''); setMax(maxPrice || ''); }, [minPrice, maxPrice]);

  useEffect(() => {
    const handler = (e) => {
      if (
        popRef.current && !popRef.current.contains(e.target) &&
        anchorRef.current && !anchorRef.current.contains(e.target)
      ) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, anchorRef]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const isInvalid = min !== '' && max !== '' && parseFloat(min) > parseFloat(max);

  const inputCls = 'w-full pl-7 pr-3 py-2 text-sm border border-[#E8E8E8] rounded-lg focus:border-[#990100] focus:ring-[3px] focus:ring-[rgba(153,1,0,0.10)] focus:outline-none transition-all';

  return (
    <div
      ref={popRef}
      className="absolute top-full right-0 mt-2 w-96 z-50 bg-white border border-[#E8E8E8] shadow-xl p-6 animate-in"
      style={{ borderRadius: '4px 16px 4px 16px' }}
    >
      <p className="font-semibold text-sm text-[#333333] mb-5">Rango de precio</p>
      <div className="space-y-4 mb-3">
        <div>
          <label className="text-xs text-[#666666] block mb-2 font-medium">Precio mínimo</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#999999] font-mono select-none">$</span>
            <input
              type="number" min="50" step="50" value={min}
              onChange={(e) => setMin(e.target.value)}
              placeholder="50"
              className="w-full pl-8 pr-4 py-3 text-sm border border-[#E8E8E8] rounded-lg focus:border-[#990100] focus:ring-[3px] focus:ring-[rgba(153,1,0,0.10)] focus:outline-none transition-all"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-[#666666] block mb-2 font-medium">Precio máximo</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#999999] font-mono select-none">$</span>
            <input
              type="number" min="50" step="50" value={max}
              onChange={(e) => setMax(e.target.value)}
              placeholder="∞"
              className="w-full pl-8 pr-4 py-3 text-sm border border-[#E8E8E8] rounded-lg focus:border-[#990100] focus:ring-[3px] focus:ring-[rgba(153,1,0,0.10)] focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>
      {isInvalid && (
        <p className="text-xs text-[#990100] mb-3 mt-2">El mínimo no puede superar el máximo</p>
      )}
      <div className="flex gap-3 mt-5">
        <button
          onClick={() => { setMin(''); setMax(''); onApply({ minPrice: '', maxPrice: '' }); }}
          className="flex-1 py-3 text-xs font-semibold border border-[#E8E8E8] rounded-lg text-[#666666] hover:border-[#990100] hover:text-[#990100] transition-colors"
        >
          Limpiar
        </button>
        <button
          onClick={() => { if (!isInvalid) { onApply({ minPrice: min, maxPrice: max }); onClose(); } }}
          disabled={isInvalid}
          className="flex-1 py-3 text-xs font-semibold rounded-lg text-white bg-[#990100] hover:bg-[#B90504] disabled:opacity-50 transition-colors"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}

// ─── Main catalog page ────────────────────────────────────────────────────────
export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // All filters live in URL
  const page     = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const search   = searchParams.get('search')   || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const orderBy  = searchParams.get('orderBy')  || 'recent';

  const { isEmprendedor, isComprador } = useAuth();
  const navigate  = useNavigate();
  const gridRef   = useRef(null);
  const priceRef  = useRef(null);

  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [pagination,  setPagination]  = useState({ page: 1, limit: 12, total: 0, pages: 0, hasNext: false, hasPrev: false });
  const [isLoading,   setIsLoading]   = useState(true);
  const [searchInput, setSearchInput] = useState(search);
  const [priceOpen,   setPriceOpen]   = useState(false);

  // ── Load categories once ──────────────────────────────────────────────────
  useEffect(() => {
    api.get('/products/categories')
      .then((res) => setCategories(res.data.data || []))
      .catch(() => {});
  }, []);

  // ── Sync local search input when URL is reset externally (clearAllFilters) ─
  useEffect(() => { setSearchInput(search); }, [search]);

  // ── Debounce search: 400ms after user stops typing → update URL ───────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        const currentSearch = prev.get('search') || '';
        if (currentSearch === searchInput) return prev; // no-op guard
        const next = new URLSearchParams(prev);
        if (searchInput) next.set('search', searchInput);
        else next.delete('search');
        next.set('page', '1');
        return next;
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, setSearchParams]);

  // ── Fetch products whenever any URL filter changes ────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setProducts([]); // clear immediately → skeleton shows, no stale results
      try {
        const params = { page, limit: 12 };
        if (search)            params.search   = search;
        if (category)          params.category = category;
        if (minPrice)          params.minPrice = minPrice;
        if (maxPrice)          params.maxPrice = maxPrice;
        if (orderBy !== 'recent') params.orderBy = orderBy;
        const res = await api.get('/products', { params });
        setProducts(res.data.data || []);
        setPagination(res.data.pagination || {});
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [page, search, category, minPrice, maxPrice, orderBy]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const updateFilters = useCallback((newParams) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(newParams).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) next.set(k, String(v));
        else next.delete(k);
      });
      next.set('page', '1');
      return next;
    });
  }, [setSearchParams]);

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage));
      return next;
    });
    const top = (gridRef.current?.offsetTop ?? 200) - 80;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const hasActiveFilters    = !!(search || category || minPrice || maxPrice);
  const total               = pagination.total || 0;
  const from                = products.length > 0 ? (page - 1) * 12 + 1 : 0;
  const to                  = Math.min(page * 12, total);
  const activeCategoryName  = categories.find((c) => c.id === category)?.name || '';

  // Price label for button
  const priceLabel = (minPrice || maxPrice)
    ? `${minPrice ? formatCurrency(minPrice) : '$0'} – ${maxPrice ? formatCurrency(maxPrice) : '∞'}`
    : 'Precio';
  const priceActive = !!(minPrice || maxPrice);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F6]">
      <Navbar />

      {/* ── Hero strip ─────────────────────────────────────────────────── */}
      <section
        className="bg-white"
        style={{ background: 'linear-gradient(180deg, rgba(153,1,0,0.04) 0%, transparent 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <p className="font-mono text-[11px] tracking-[0.15em] text-[#990100] uppercase mb-2 animate-in">
            CAMPUS · UAO
          </p>
          <h1
            className="font-display font-extrabold text-[#1A1A1A] leading-tight mb-2 animate-in delay-1"
            style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)' }}
          >
            Descubre lo que ofrecen tus compañeros
          </h1>
          <p className="text-[#666666] text-sm animate-in delay-2">
            <span className="text-[#990100] font-bold font-display">{total}</span>
            {' '}productos publicados por emprendedores UAO
          </p>
        </div>
      </section>

      {/* ── Search bar (CA-01) ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E8E8E8] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="flex items-center overflow-hidden transition-all duration-200"
            style={{
              border: `1.5px solid ${searchInput ? '#990100' : '#E8E8E8'}`,
              borderRadius: '6px',
              boxShadow: searchInput ? '0 4px 20px rgba(153,1,0,0.10)' : 'none',
            }}
          >
            {/* Left crimson tab */}
            <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-[#990100]">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Input */}
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="¿Qué estás buscando? Ej: torta, diseño, tutorías..."
              className="flex-1 px-4 py-3 text-sm bg-transparent focus:outline-none text-[#1A1A1A] placeholder:text-[#999999] placeholder:italic min-w-0"
            />

            {/* Right side: loading or clear */}
            {isLoading && searchInput ? (
              <div className="shrink-0 w-5 h-5 mr-4 border-2 border-[#990100] border-t-transparent rounded-full animate-spin" />
            ) : searchInput ? (
              <button
                onClick={() => { setSearchInput(''); updateFilters({ search: '' }); }}
                className="shrink-0 mr-3 p-1 text-[#999999] hover:text-[#990100] transition-colors rounded"
                aria-label="Limpiar búsqueda"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : (
              <span className="hidden sm:block shrink-0 mr-4 text-xs font-mono text-[#CCCCCC] select-none">⌘K</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky filter bar (CA-02) ──────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Row 1: category chips (scrollable) + price + sort (sticky) */}
          <div className="flex items-center gap-3 py-3">
            {/* Scrollable categories container */}
            <div className="flex items-center gap-3 overflow-x-auto flex-1 min-w-0">
              {/* "Todos" chip */}
              <button
                onClick={() => updateFilters({ category: '' })}
                className={`shrink-0 px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-full border transition-all whitespace-nowrap ${
                  category === ''
                    ? 'bg-[#990100] text-white border-[#990100]'
                    : 'border-[#E8E8E8] text-[#666666] hover:border-[#990100] hover:text-[#990100]'
                }`}
              >
                Todos
              </button>

              {/* Category chips */}
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateFilters({ category: cat.id === category ? '' : cat.id })}
                  className={`shrink-0 px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-full border transition-all whitespace-nowrap ${
                    cat.id === category
                      ? 'bg-[#990100] text-white border-[#990100]'
                      : 'border-[#E8E8E8] text-[#666666] hover:border-[#990100] hover:text-[#990100]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}

              {/* Divider */}
              <div className="hidden sm:block shrink-0 w-px h-5 bg-[#E8E8E8] mx-1" />
            </div>

            {/* Price range button (CA-03) - outside of overflow */}
            <div className="relative shrink-0" ref={priceRef}>
              <button
                onClick={() => setPriceOpen((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-full border transition-all whitespace-nowrap ${
                  priceActive
                    ? 'border-[#990100] text-[#990100] bg-[rgba(153,1,0,0.06)]'
                    : 'border-[#E8E8E8] text-[#666666] hover:border-[#990100] hover:text-[#990100]'
                }`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" />
                </svg>
                {priceLabel}
              </button>
              {priceOpen && (
                <PricePopover
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  anchorRef={priceRef}
                  onApply={(vals) => updateFilters(vals)}
                  onClose={() => setPriceOpen(false)}
                />
              )}
            </div>

            {/* Sort dropdown - outside of overflow */}
            <select
              value={orderBy}
              onChange={(e) => updateFilters({ orderBy: e.target.value })}
              className="shrink-0 text-[10px] font-mono font-semibold uppercase tracking-wider border border-[#E8E8E8] rounded-lg px-3 py-1.5 text-[#333333] bg-white hover:border-[#990100] focus:border-[#990100] focus:outline-none cursor-pointer transition-colors"
            >
              <option value="recent">Más recientes</option>
              <option value="price_asc">Menor precio</option>
              <option value="price_desc">Mayor precio</option>
            </select>
          </div>

          {/* Row 2: active filter tags (CA-06) */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 pb-3 overflow-x-auto">
              {search && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono text-[#990100] shrink-0"
                  style={{ background: 'rgba(153,1,0,0.08)', border: '1px solid rgba(153,1,0,0.20)' }}>
                  🔍 "{search}"
                  <button onClick={() => { setSearchInput(''); updateFilters({ search: '' }); }} aria-label="Quitar filtro búsqueda"
                    className="ml-0.5 hover:bg-[rgba(153,1,0,0.15)] rounded-full p-0.5 transition-colors">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {category && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono text-[#990100] shrink-0"
                  style={{ background: 'rgba(153,1,0,0.08)', border: '1px solid rgba(153,1,0,0.20)' }}>
                  {activeCategoryName}
                  <button onClick={() => updateFilters({ category: '' })} aria-label="Quitar filtro categoría"
                    className="ml-0.5 hover:bg-[rgba(153,1,0,0.15)] rounded-full p-0.5 transition-colors">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono text-[#990100] shrink-0"
                  style={{ background: 'rgba(153,1,0,0.08)', border: '1px solid rgba(153,1,0,0.20)' }}>
                  $ {minPrice ? formatCurrency(minPrice) : '0'} – {maxPrice ? formatCurrency(maxPrice) : '∞'}
                  <button onClick={() => updateFilters({ minPrice: '', maxPrice: '' })} aria-label="Quitar filtro precio"
                    className="ml-0.5 hover:bg-[rgba(153,1,0,0.15)] rounded-full p-0.5 transition-colors">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="ml-auto shrink-0 text-xs font-mono text-[#990100] hover:underline transition-all"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <main ref={gridRef} className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Results count */}
        {!isLoading && products.length > 0 && (
          <p className="text-sm text-[#666666] font-mono mb-6 animate-in">
            {hasActiveFilters ? (
              <>
                <span className="text-[#990100] font-bold font-display">{total}</span>
                {' resultado'}{total !== 1 ? 's' : ''} para{' '}
                {search ? <span className="text-[#1A1A1A]">"{search}"</span> : 'tu búsqueda'}
              </>
            ) : (
              <>
                Mostrando {from}–{to} de{' '}
                <span className="text-[#1A1A1A] font-semibold">{total}</span> productos
              </>
            )}
          </p>
        )}

        {/* ── Loading skeleton ────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>

        ) : products.length === 0 && hasActiveFilters ? (
          /* ── CA-05: No results for active filter ───────────────────── */
          <div className="flex flex-col items-center justify-center py-28 text-center animate-in">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(153,1,0,0.06)] border border-[rgba(153,1,0,0.15)] flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-[#990100]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="font-display font-bold text-[#1A1A1A] text-xl mb-2">
              No encontramos productos que coincidan
            </h2>
            <p className="text-[#666666] text-sm mb-5">con tu búsqueda. Intenta con otros términos.</p>

            {/* Active filters summary */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6 text-xs font-mono text-[#999999]">
              {search   && <span className="px-2 py-1 bg-[#F6F6F6] rounded-full border border-[#E8E8E8]">Búsqueda: "{search}"</span>}
              {category && <span className="px-2 py-1 bg-[#F6F6F6] rounded-full border border-[#E8E8E8]">Categoría: {activeCategoryName}</span>}
              {(minPrice || maxPrice) && (
                <span className="px-2 py-1 bg-[#F6F6F6] rounded-full border border-[#E8E8E8]">
                  Precio: {minPrice ? formatCurrency(minPrice) : '$0'} – {maxPrice ? formatCurrency(maxPrice) : '∞'}
                </span>
              )}
            </div>

            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm text-white bg-[#990100] hover:bg-[#B90504] transition-colors"
            >
              Limpiar filtros y ver todo
            </button>
          </div>

        ) : products.length === 0 ? (
          /* ── CA-03: Truly empty catalog ────────────────────────────── */
          <div className="relative flex flex-col items-center justify-center py-32 text-center overflow-hidden">
            <span
              className="absolute select-none pointer-events-none font-display font-black"
              style={{ fontSize: '20vw', color: 'rgba(153,1,0,0.05)', lineHeight: 1, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            >
              0
            </span>
            <div className="relative z-10 space-y-4 animate-in">
              <div className="text-5xl">🏪</div>
              <h2 className="font-display font-bold text-[#1A1A1A] text-2xl">
                Aún no hay productos disponibles
              </h2>
              {isEmprendedor ? (
                <div className="space-y-3">
                  <p className="text-[#666666]">¡Sé el primero en publicar!</p>
                  <button onClick={() => navigate('/my-products/new')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm text-white bg-[#990100] hover:bg-[#B90504] transition-colors">
                    Publicar mi primer producto
                  </button>
                </div>
              ) : isComprador ? (
                <p className="text-[#666666] max-w-sm mx-auto">
                  Vuelve pronto, los emprendedores están preparando sus productos.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-[#666666]">¡Sé el primero en publicar!</p>
                  <button onClick={() => navigate('/register')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm text-white bg-[#990100] hover:bg-[#B90504] transition-colors">
                    Regístrate como emprendedor
                  </button>
                </div>
              )}
            </div>
          </div>

        ) : (
          /* ── Product grid ──────────────────────────────────────────── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {products.map((p, i) => (
              <div key={p.id} className="animate-in min-w-0" style={{ animationDelay: `${Math.min(i * 0.05, 0.6)}s` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && <CatalogPagination pagination={pagination} onPageChange={handlePageChange} />}
      </main>

      <Footer />
    </div>
  );
}
