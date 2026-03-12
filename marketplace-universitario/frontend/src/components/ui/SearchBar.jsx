import { useState } from 'react';

const lightInput = `
  w-full px-4 py-2.5 rounded-xl text-sm
  bg-white text-[#1A1A1A]
  border-[1.5px] border-[#E8E8E8]
  placeholder:text-[#999999]
  hover:border-[#CCCCCC]
  focus:outline-none focus:border-[#990100] focus:ring-[3px] focus:ring-[rgba(153,1,0,0.10)]
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
      {/* Red square anchor tab */}
      <button
        type="submit"
        className="
          shrink-0 w-12 flex items-center justify-center
          bg-[#990100] text-white
          hover:bg-[#B90504]
          transition-colors duration-200
        "
        style={{ borderRadius: '4px 0 0 4px' }}
        aria-label="Buscar"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="
          flex-1 px-5 py-3 text-sm italic
          bg-white text-[#1A1A1A]
          placeholder:text-[#999999] placeholder:italic
          border-[1.5px] border-l-0 border-[#E8E8E8]
          hover:border-[#CCCCCC]
          focus:outline-none focus:border-[#990100]
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
        <h3 className="font-display font-semibold text-[#1A1A1A] text-sm mb-3 uppercase tracking-wider">
          Categoría
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => onFilterChange({ categoryId: '' })}
              className={`text-sm w-full text-left px-3 py-2 rounded-lg transition-colors duration-150 ${
                !filters.categoryId
                  ? 'bg-[rgba(153,1,0,0.08)] text-[#990100] font-medium'
                  : 'text-[#999999] hover:text-[#666666] hover:bg-[#F6F6F6]'
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
                    ? 'bg-[rgba(153,1,0,0.08)] text-[#990100] font-medium'
                    : 'text-[#999999] hover:text-[#666666] hover:bg-[#F6F6F6]'
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
        <h3 className="font-display font-semibold text-[#1A1A1A] text-sm mb-3 uppercase tracking-wider">
          Precio
        </h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Mín"
            min="0"
            value={filters.minPrice || ''}
            onChange={(e) => onFilterChange({ minPrice: e.target.value || undefined })}
            className={lightInput}
          />
          <span className="text-[#999999] shrink-0">–</span>
          <input
            type="number"
            placeholder="Máx"
            min="0"
            value={filters.maxPrice || ''}
            onChange={(e) => onFilterChange({ maxPrice: e.target.value || undefined })}
            className={lightInput}
          />
        </div>
      </div>
    </aside>
  );
}
