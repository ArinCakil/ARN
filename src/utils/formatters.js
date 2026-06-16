/**
 * @param {number} value
 * @param {string} [locale]
 * @returns {string}
 */
export function formatCurrency(value, locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

/**
 * @param {number} value
 * @param {number} [decimals]
 * @returns {string}
 */
export function formatPercent(value, decimals = 1) {
  return `${(value ?? 0).toFixed(decimals)}%`;
}

/**
 * @param {string} text
 * @param {number} [max]
 * @returns {string}
 */
export function truncateLabel(text, max = 24) {
  if (!text || text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

/**
 * @param {string} category
 * @param {(key: string) => string} t
 * @returns {string}
 */
export function getCategoryLabel(category, t) {
  const key = `categories.${category}`;
  const translated = t(key);
  return translated !== key ? translated : category;
}
