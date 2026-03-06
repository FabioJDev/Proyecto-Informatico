import { useState } from 'react';

export default function StarRating({ value = 0, onChange, readOnly = false, size = 'md' }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  const sizes = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' };

  return (
    <div className={`inline-flex gap-0.5 ${sizes[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={`transition-transform ${!readOnly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
          aria-label={`${star} estrella${star !== 1 ? 's' : ''}`}
        >
          <span className={star <= display ? 'text-yellow-400' : 'text-gray-300'}>★</span>
        </button>
      ))}
    </div>
  );
}
