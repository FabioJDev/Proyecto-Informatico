import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters.js';

export default function ProductCard({ product }) {
  const { id, name, price, images, category, seller } = product;
  const imageUrl = images?.[0] || null;
  const sellerName = seller?.profile?.businessName || seller?.email;

  return (
    <Link to={`/products/${id}`} className="group block focus:outline-none">
      <article
        className="relative overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)] transition-all duration-300"
        style={{ borderRadius: '4px 16px 4px 16px' }}
      >
        {/* Crimson triangle notch — top-left corner */}
        <div
          className="absolute top-0 left-0 z-10 pointer-events-none"
          style={{
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderWidth: '22px 22px 0 0',
            borderColor: 'var(--accent-primary) transparent transparent transparent',
          }}
        />

        {/* Left border — grows scaleY from bottom on hover */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--accent-primary)] border-grow-up z-10" />

        {/* Image */}
        <div className="aspect-[4/3] overflow-hidden relative bg-[var(--bg-elevated)]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
          )}

          {/* Crimson gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--accent-primary)]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Category chip */}
          {category && (
            <span className="
              absolute top-3 right-3
              px-2 py-0.5
              text-[10px] font-mono font-semibold uppercase tracking-widest
              bg-[var(--bg-base)]/80 text-[var(--accent-secondary)]
              border border-[var(--accent-secondary)]/25
              backdrop-blur-sm
            " style={{ borderRadius: '2px 8px 2px 8px' }}>
              {category.name}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="px-4 pt-3 pb-2">
          <h3 className="font-display font-semibold text-[var(--text-primary)] text-sm line-clamp-2 leading-snug mb-1">
            {name}
          </h3>

          {sellerName && (
            <p className="text-[10px] font-mono text-[var(--text-muted)] truncate uppercase tracking-wider">
              {sellerName}
            </p>
          )}
        </div>

        {/* Price band — full width at bottom */}
        <div className="
          flex items-center justify-between
          px-4 py-2.5 mt-1
          bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)]
        ">
          <span className="font-mono font-semibold text-sm text-[var(--accent-secondary)]">
            {formatCurrency(price)}
          </span>
          <span className="
            text-xs font-mono text-[var(--text-muted)]
            translate-x-1 opacity-0
            group-hover:translate-x-0 group-hover:opacity-100
            group-hover:text-[var(--accent-primary-soft)]
            transition-all duration-300
          ">
            Ver más →
          </span>
        </div>
      </article>
    </Link>
  );
}
