import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters.js';
import StarRating from './StarRating.jsx';

export default function ProductCard({ product }) {
  const { id, name, price, images, category, seller } = product;
  const imageUrl = images?.[0] || 'https://placehold.co/400x300?text=Sin+imagen';
  const sellerName = seller?.profile?.businessName || seller?.email;

  return (
    <Link to={`/products/${id}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        <div className="p-4">
          {category && (
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
              {category.name}
            </span>
          )}
          <h3 className="mt-2 font-semibold text-gray-900 line-clamp-2 text-sm">{name}</h3>
          {sellerName && (
            <p className="text-xs text-gray-500 mt-1">por {sellerName}</p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="font-bold text-primary-700 text-base">{formatCurrency(price)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
