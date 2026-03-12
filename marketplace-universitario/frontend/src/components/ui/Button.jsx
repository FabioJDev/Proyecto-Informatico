const variants = {
  primary: [
    'bg-[#990100] text-[#F6F6F6] border-transparent',
    'hover:bg-[#B90504] hover:-translate-y-0.5 hover:shadow-glow-primary',
    'active:translate-y-0 active:shadow-none',
    'animate-glow-pulse',
  ].join(' '),

  secondary: [
    'bg-transparent text-[#333333]',
    'border border-[#333333]',
    'hover:border-[#990100] hover:text-[#990100] hover:bg-[rgba(153,1,0,0.06)] hover:-translate-y-0.5',
  ].join(' '),

  ghost: [
    'bg-[#F6F6F6] text-[#333333]',
    'border border-[#E8E8E8]',
    'hover:border-[#990100] hover:text-[#990100]',
  ].join(' '),

  danger: [
    'bg-[#990100] text-[#F6F6F6] border-transparent',
    'hover:bg-[#B90504] hover:-translate-y-0.5 hover:shadow-glow-red',
    'active:translate-y-0',
  ].join(' '),

  amber: [
    'bg-[#B45309] text-white border-transparent',
    'hover:bg-[#d97706] hover:-translate-y-0.5',
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
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#990100] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F6F6]
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
