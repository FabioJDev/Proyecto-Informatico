export default function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  required,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--text-secondary)]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {label}
          {required && (
            <span className="text-[var(--accent-primary)] ml-1">*</span>
          )}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-4 py-2.5 rounded-xl text-sm
          bg-[var(--bg-surface)] text-[var(--text-primary)]
          border transition-all duration-200
          placeholder:text-[var(--text-muted)]
          focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)]
          disabled:opacity-40 disabled:cursor-not-allowed
          ${error
            ? 'border-red-500/60 bg-red-500/5 focus:ring-red-500/20 focus:border-red-500'
            : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
          }
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <svg className="w-3 h-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs text-[var(--text-muted)]">{helperText}</p>
      )}
    </div>
  );
}
