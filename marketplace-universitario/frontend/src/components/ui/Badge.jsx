import { ORDER_STATUS } from '../../utils/constants.js';

const colorMap = {
  yellow: 'bg-yellow-100 text-yellow-800',
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-700',
  purple: 'bg-purple-100 text-purple-800',
};

export function OrderBadge({ status }) {
  const info = ORDER_STATUS[status] || { label: status, color: 'gray' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[info.color]}`}>
      {info.label}
    </span>
  );
}

export function RoleBadge({ role }) {
  const roles = {
    EMPRENDEDOR: { label: 'Emprendedor', color: 'purple' },
    COMPRADOR: { label: 'Comprador', color: 'blue' },
    ADMIN: { label: 'Admin', color: 'red' },
  };
  const info = roles[role] || { label: role, color: 'gray' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[info.color]}`}>
      {info.label}
    </span>
  );
}

export default function Badge({ children, color = 'gray', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[color]} ${className}`}>
      {children}
    </span>
  );
}
