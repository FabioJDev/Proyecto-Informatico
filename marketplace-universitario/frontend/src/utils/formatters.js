/**
 * Format a number as Colombian pesos (COP)
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date string as localized date
 */
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a date string as relative time (e.g. "hace 2 días")
 */
export function formatRelativeTime(dateString) {
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  const diff = (new Date(dateString) - new Date()) / 1000; // in seconds

  if (Math.abs(diff) < 60) return rtf.format(Math.round(diff), 'second');
  if (Math.abs(diff) < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (Math.abs(diff) < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  return rtf.format(Math.round(diff / 86400), 'day');
}

/**
 * Truncate text to a max length
 */
export function truncate(text, maxLength = 100) {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}
