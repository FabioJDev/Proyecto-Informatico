import { useState } from 'react';
import Button from './Button.jsx';

export function SearchBar({ onSearch, placeholder = 'Buscar productos…', initialValue = '' }) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <Button type="submit">Buscar</Button>
    </form>
  );
}

export function FilterPanel({ categories, filters, onFilterChange }) {
  return (
    <aside className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Categoría</h3>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onFilterChange({ categoryId: '' })}
              className={`text-sm w-full text-left px-2 py-1 rounded ${!filters.categoryId ? 'text-primary-700 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Todas las categorías
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => onFilterChange({ categoryId: cat.id })}
                className={`text-sm w-full text-left px-2 py-1 rounded ${filters.categoryId === cat.id ? 'text-primary-700 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Precio</h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Mín"
            min="0"
            value={filters.minPrice || ''}
            onChange={(e) => onFilterChange({ minPrice: e.target.value || undefined })}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            placeholder="Máx"
            min="0"
            value={filters.maxPrice || ''}
            onChange={(e) => onFilterChange({ maxPrice: e.target.value || undefined })}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
        </div>
      </div>
    </aside>
  );
}
