import { ORDER_STATUS } from '../../utils/constants.js';

const colorMap = {
  yellow: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
  },
  green: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  red: {
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    border: 'border-red-500/30',
    dot: 'bg-red-400',
  },
  blue: {
    bg: 'bg-[var(--accent-primary-dim)]',
    text: 'text-[var(--accent-primary-soft)]',
    border: 'border-[var(--accent-primary)]/30',
    dot: 'bg-[var(--accent-primary-soft)]',
  },
  gray: {
    bg: 'bg-white/[0.06]',
    text: 'text-[var(--text-secondary)]',
    border: 'border-white/10',
    dot: 'bg-zinc-400',
  },
  purple: {
    bg: 'bg-[var(--accent-tertiary-dim)]',
    text: 'text-[var(--accent-tertiary)]',
    border: 'border-[var(--accent-tertiary)]/30',
    dot: 'bg-[var(--accent-tertiary)]',
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
        text-xs font-mono font-medium uppercase tracking-wider
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
        text-xs font-mono font-medium uppercase tracking-wider
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
