import { useState } from 'react';

export default function StarRating({ value = 0, onChange, readOnly = false, size = 'md' }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="inline-flex gap-0.5" role="group" aria-label="Calificación">
      {[1, 2, 3, 4, 5].map((star, i) => {
        const filled = star <= display;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange?.(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            className={`
              transition-transform duration-100
              ${!readOnly ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}
            `}
            style={{ transitionDelay: !readOnly ? `${i * 30}ms` : '0ms' }}
            aria-label={`${star} estrella${star !== 1 ? 's' : ''}`}
          >
            <svg
              className={`${sizes[size]} transition-all duration-150`}
              viewBox="0 0 24 24"
              fill={filled ? '#990100' : 'none'}
              stroke={filled ? 'none' : '#E8E8E8'}
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
