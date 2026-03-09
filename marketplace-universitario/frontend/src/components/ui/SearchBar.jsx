import { useState } from 'react';

const darkInput = `
  w-full px-4 py-2.5 rounded-xl text-sm
  bg-[var(--bg-surface)] text-[var(--text-primary)]
  border border-[var(--border-subtle)]
  placeholder:text-[var(--text-muted)]
  hover:border-[var(--border-strong)]
  focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20
  transition-all duration-200
`;

export function SearchBar({ onSearch, placeholder = '¿Qué estás buscando hoy?', initialValue = '' }) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full focus-within:shadow-glow-primary transition-shadow duration-300">
      {/* Crimson square anchor tab */}
      <button
        type="submit"
        className="
          shrink-0 w-12 flex items-center justify-center
          bg-[var(--accent-primary)] text-white
          hover:bg-[var(--accent-primary-soft)]
          transition-colors duration-200
        "
        style={{ borderRadius: '4px 0 0 4px' }}
        aria-label="Buscar"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* Input — sharp left, pill right */}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="
          flex-1 px-5 py-3 text-sm italic
          bg-[var(--bg-surface)] text-[var(--text-primary)]
          placeholder:text-[var(--text-muted)] placeholder:italic
          border border-l-0 border-[var(--border-subtle)]
          hover:border-[var(--border-strong)]
          focus:outline-none focus:border-[var(--accent-primary)]
          transition-all duration-200
        "
        style={{ borderRadius: '0 40px 40px 0' }}
      />
    </form>
  );
}

export function FilterPanel({ categories, filters, onFilterChange }) {
  return (
    <aside className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="font-display font-semibold text-[var(--text-primary)] text-sm mb-3 uppercase tracking-wider">
          Categoría
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => onFilterChange({ categoryId: '' })}
              className={`text-sm w-full text-left px-3 py-2 rounded-lg transition-colors duration-150 ${
                !filters.categoryId
                  ? 'bg-[var(--accent-primary-dim)] text-[var(--accent-primary-soft)] font-medium'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/[0.04]'
              }`}
            >
              Todas
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => onFilterChange({ categoryId: cat.id })}
                className={`text-sm w-full text-left px-3 py-2 rounded-lg transition-colors duration-150 ${
                  filters.categoryId === cat.id
                    ? 'bg-[var(--accent-primary-dim)] text-[var(--accent-primary-soft)] font-medium'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/[0.04]'
                }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price range */}
      <div>
        <h3 className="font-display font-semibold text-[var(--text-primary)] text-sm mb-3 uppercase tracking-wider">
          Precio
        </h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Mín"
            min="0"
            value={filters.minPrice || ''}
            onChange={(e) => onFilterChange({ minPrice: e.target.value || undefined })}
            className={darkInput}
          />
          <span className="text-[var(--text-muted)] shrink-0">–</span>
          <input
            type="number"
            placeholder="Máx"
            min="0"
            value={filters.maxPrice || ''}
            onChange={(e) => onFilterChange({ maxPrice: e.target.value || undefined })}
            className={darkInput}
          />
        </div>
      </div>
    </aside>
  );
}
