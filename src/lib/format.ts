import type { Money } from '@/lib/types';

/**
 * Compact euro badge format matching the design, e.g. "€260,00".
 * (Italian style: € prefix, comma decimal separator.)
 */
export function formatPriceBadge(money: Money | undefined | null): string {
  if (!money) return '';
  const amount = Number(money.amount);
  const formatted = amount.toLocaleString('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const symbol = money.currencyCode === 'EUR' ? '€' : `${money.currencyCode} `;
  return `${symbol}${formatted}`;
}

/** Format a Shopify Money value using the store's currency. */
export function formatMoney(money: Money | undefined | null): string {
  if (!money) return '';
  const amount = Number(money.amount);
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: money.currencyCode,
    }).format(amount);
  } catch {
    // Fallback if the currency code isn't recognized by Intl.
    return `${amount.toFixed(2)} ${money.currencyCode}`;
  }
}
