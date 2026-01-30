/**
 * Format a number as Dominican Peso currency
 * @param amount - The amount to format
 * @param showDecimals - Whether to show decimal places (default: false for cleaner UI)
 */
export function formatCurrency(amount: number, showDecimals = false): string {
  const formatter = new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });
  
  // Replace DOP with RD$ for local preference
  return formatter.format(amount).replace('DOP', 'RD$').replace('RD$ ', 'RD$ ');
}

/**
 * Format a number as a compact currency (e.g., 15.4K)
 */
export function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `RD$ ${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `RD$ ${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
}

/**
 * Parse a currency string back to number
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}
