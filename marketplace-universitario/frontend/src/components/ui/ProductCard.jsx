import { memo } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters.js';
import StarRating from './StarRating.jsx';

function ProductCard({ product }) {
  const { id, name, price, images, category, seller, averageRating, totalReviews = 0 } = product;
  const imageUrl = images?.[0] || null;
  const sellerName = seller?.profile?.businessName || seller?.email;

  return (
    <Link to={`/products/${id}`} className="group block focus:outline-none">
      <article
        className="relative overflow-hidden bg-white border border-[#E8E8E8] transition-all duration-300 group-hover:border-[rgba(153,1,0,0.40)] group-hover:shadow-card-hover"
        style={{ borderRadius: '4px 16px 4px 16px' }}
      >
        {/* Red triangle notch — top-left corner */}
        <div
          className="absolute top-0 left-0 z-10 pointer-events-none"
          style={{
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderWidth: '22px 22px 0 0',
            borderColor: '#990100 transparent transparent transparent',
          }}
        />

        {/* Left border — grows scaleY from bottom on hover */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#990100] border-grow-up z-10" />

        {/* Image */}
        <div className="aspect-[4/3] overflow-hidden relative bg-[#E8E8E8]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#999999]">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
          )}

          {/* Red gradient overlay on hover — entrepreneur name reveal */}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(153,1,0,0.85)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            {sellerName && (
              <span className="text-[10px] font-mono text-[#F6F6F6] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                {sellerName}
              </span>
            )}
          </div>

          {/* Category chip */}
          {category && (
            <span className="
              absolute top-3 right-3
              px-2 py-0.5
              text-[10px] font-mono font-semibold uppercase tracking-widest
              bg-[#E8E8E8] text-[#333333]
              border border-[#CCCCCC]
              group-hover:bg-[#990100] group-hover:text-[#F6F6F6] group-hover:border-[#990100]
              transition-all duration-200
            " style={{ borderRadius: '2px 8px 2px 8px' }}>
              {category.name}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="px-4 pt-3 pb-2">
          <h3 className="font-display font-semibold text-[#1A1A1A] text-sm line-clamp-2 leading-snug mb-1">
            {name}
          </h3>
        </div>

        {/* Price band — full width at bottom */}
        <div className="
          flex items-center justify-between
          px-4 py-2.5 mt-1
          bg-[#F6F6F6] border-t border-[#E8E8E8]
        ">
          <div className="flex-1">
            <span className="font-mono font-semibold text-sm text-[#990100] block">
              {formatCurrency(price)}
            </span>
            {averageRating && (
              <div className="flex items-center gap-1 mt-1">
                <StarRating value={Math.round(averageRating)} readOnly size="xs" />
                <span className="text-xs font-mono text-[#999999]">
                  {averageRating.toFixed(1)} ({totalReviews})
                </span>
              </div>
            )}
          </div>
          <span className="
            text-xs font-mono text-[#666666]
            translate-x-1 opacity-0
            group-hover:translate-x-0 group-hover:opacity-100
            group-hover:text-[#990100]
            transition-all duration-300
            whitespace-nowrap ml-2
          ">
            Ver más →
          </span>
        </div>
      </article>
    </Link>
  );
}

export default memo(ProductCard);
