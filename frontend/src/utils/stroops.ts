/**
 * USDC / Stroops conversion.
 *
 * 1 USDC = 10,000,000 stroops (7 decimals).
 * All Stellar contract values are in stroops (i128).
 * Convert ONLY at the API boundary using these functions.
 *
 * NEVER do math on USDC floats. Use bigint at the boundary.
 */

const STROOPS_PER_USDC = 10_000_000n;

/** Convert USDC number to stroops as bigint. */
export function toStroops(usdc: number | string): bigint {
    const [whole, fraction = ''] = String(usdc).split('.');
    const padded = (fraction + '0'.repeat(7)).slice(0, 7);
    return BigInt(whole ?? '0') * STROOPS_PER_USDC + BigInt(padded || '0');
}

/** Convert stroops (bigint | string) back to USDC number. */
export function fromStroops(stroops: bigint | string | number): number {
    const big = typeof stroops === 'bigint' ? stroops : BigInt(stroops);
    const whole = big / STROOPS_PER_USDC;
    const fraction = big % STROOPS_PER_USDC;
    const fractionStr = fraction.toString().padStart(7, '0').slice(0, 7);
    return Number(`${whole.toString()}.${fractionStr}`);
}

/** Format stroops bigint as a human-readable USDC string with 2 decimals. */
export function formatUSDC(stroops: bigint | string | number): string {
    return fromStroops(stroops).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
