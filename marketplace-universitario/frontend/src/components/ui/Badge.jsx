import { ORDER_STATUS } from '../../utils/constants.js';

const colorMap = {
  yellow: {
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#B45309]',
    border: 'border-[#FDE68A]',
    dot: 'bg-[#B45309]',
  },
  green: {
    bg: 'bg-[#D1FAE5]',
    text: 'text-[#065F46]',
    border: 'border-[#6EE7B7]',
    dot: 'bg-[#1A7A4A]',
  },
  red: {
    bg: 'bg-[rgba(153,1,0,0.08)]',
    text: 'text-[#990100]',
    border: 'border-[rgba(153,1,0,0.20)]',
    dot: 'bg-[#990100]',
  },
  blue: {
    bg: 'bg-[rgba(29,78,216,0.08)]',
    text: 'text-[#1D4ED8]',
    border: 'border-[rgba(29,78,216,0.20)]',
    dot: 'bg-[#1D4ED8]',
  },
  gray: {
    bg: 'bg-[#F3F4F6]',
    text: 'text-[#6B7280]',
    border: 'border-[#E5E7EB]',
    dot: 'bg-[#9CA3AF]',
  },
  purple: {
    bg: 'bg-[#EDE9FE]',
    text: 'text-[#5B21B6]',
    border: 'border-[#C4B5FD]',
    dot: 'bg-[#7C3AED]',
  },
};

export function OrderBadge({ status }) {
  const info = ORDER_STATUS[status] || { label: status, color: 'gray' };
  const c = colorMap[info.color] ?? colorMap.gray;
  const isPending = info.color === 'yellow';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full
        text-xs font-mono font-medium uppercase tracking-[0.08em]
        border ${c.bg} ${c.text} ${c.border}
      `}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${c.dot} ${isPending ? 'animate-pulse-dot' : ''}`}
      />
      {info.label}
    </span>
  );
}

export function RoleBadge({ role }) {
  const roles = {
    EMPRENDEDOR: { label: 'Emprendedor', color: 'purple' },
    COMPRADOR:   { label: 'Comprador',   color: 'blue'   },
    ADMIN:       { label: 'Admin',        color: 'red'    },
  };
  const info = roles[role] || { label: role, color: 'gray' };
  const c = colorMap[info.color] ?? colorMap.gray;

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full
        text-xs font-mono font-medium uppercase tracking-[0.08em]
        border ${c.bg} ${c.text} ${c.border}
      `}
    >
      {info.label}
    </span>
  );
}

export default function Badge({ children, color = 'gray', className = '' }) {
  const c = colorMap[color] ?? colorMap.gray;
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full
        text-xs font-mono font-medium
        border ${c.bg} ${c.text} ${c.border} ${className}
      `}
    >
      {children}
    </span>
  );
}
