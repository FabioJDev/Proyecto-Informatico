const variants = {
  primary: [
    'bg-gradient-primary text-white border-transparent',
    'hover:-translate-y-0.5 hover:shadow-glow-primary',
    'active:translate-y-0 active:shadow-none',
    'animate-glow-pulse',
  ].join(' '),

  secondary: [
    'bg-[var(--bg-glass)] text-[var(--text-primary)]',
    'border border-[var(--border-strong)]',
    'backdrop-blur-sm',
    'hover:border-[var(--accent-primary)] hover:bg-white/[0.07] hover:-translate-y-0.5',
  ].join(' '),

  ghost: [
    'bg-transparent text-[var(--text-secondary)]',
    'border border-transparent',
    'hover:text-[var(--text-primary)] hover:bg-white/[0.05]',
  ].join(' '),

  danger: [
    'bg-gradient-danger text-white border-transparent',
    'hover:-translate-y-0.5 hover:shadow-glow-red',
    'active:translate-y-0',
  ].join(' '),

  amber: [
    'bg-gradient-secondary text-white border-transparent',
    'hover:-translate-y-0.5 hover:shadow-glow-gold',
    'active:translate-y-0',
  ].join(' '),
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-[10px] gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-200 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]
        disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none disabled:animate-none
        ${variants[variant] ?? variants.primary}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin-ring shrink-0" />
      )}
      {children}
    </button>
  );
}
