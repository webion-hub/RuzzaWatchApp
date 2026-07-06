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

/**
 * Shopify's plain-text `description` drops the original line breaks, leaving
 * words run together at capitals (e.g. "soleilIndici", "bianchiClaps"). Restore
 * a newline before a capital that directly follows a lowercase letter.
 */
export function formatDescription(desc: string | undefined | null): string {
  if (!desc) return '';
  return desc.replace(/([a-zà-ÿ])([A-Z])/g, '$1\n$2').trim();
}
