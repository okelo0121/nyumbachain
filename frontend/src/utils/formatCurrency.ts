/**
 * Format a number as a currency string.
 * Default: USD with 2 decimals.
 */
export function formatCurrency(
    amount: number,
    options: { currency?: string; locale?: string; decimals?: number } = {},
): string {
    const { currency = 'USD', locale = 'en-US', decimals = 2 } = options;
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(amount);
}

/** Format a large number compactly (1.2K, 3.4M). */
export function formatCompact(value: number, locale = 'en-US'): string {
    return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}
