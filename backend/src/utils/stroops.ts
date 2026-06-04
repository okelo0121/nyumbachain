/**
 * USDC / Stroops conversion — backend boundary utils.
 *
 * 1 USDC = 10,000,000 stroops (Stellar protocol, fixed).
 * All Soroban contract values are i128 stroops.
 * PostgreSQL stores amounts as DECIMAL(10,2) USDC.
 *
 * Rule: conversion happens ONLY inside stellar.service.ts (using these helpers).
 * No other backend file performs USDC↔stroops arithmetic.
 */

const STROOPS_PER_USDC = 10_000_000n;

/**
 * Convert a USDC number (e.g. 500.00) to stroops as a bigint.
 * Uses string-based arithmetic to avoid IEEE 754 floating-point drift.
 */
export function toStroops(usdc: number | string): bigint {
  const [whole, fraction = ''] = String(usdc).split('.');
  // Pad or truncate the fractional part to exactly 7 decimal places
  const padded = (fraction + '0'.repeat(7)).slice(0, 7);
  return BigInt(whole ?? '0') * STROOPS_PER_USDC + BigInt(padded || '0');
}

/**
 * Convert stroops (bigint | string | number) back to a USDC number.
 * Safe for display. Do not use for further arithmetic — keep as bigint
 * until the value reaches a display boundary.
 */
export function fromStroops(stroops: bigint | string | number): number {
  const big = typeof stroops === 'bigint' ? stroops : BigInt(String(stroops));
  const whole    = big / STROOPS_PER_USDC;
  const fraction = big % STROOPS_PER_USDC;
  const fracStr  = fraction.toString().padStart(7, '0').slice(0, 2); // 2 dp
  return Number(`${whole.toString()}.${fracStr}`);
}

/**
 * Format stroops as a human-readable USDC string with exactly 2 decimal places.
 * Example: 5_000_000_000n → "500.00"
 */
export function formatUsdcFromStroops(stroops: bigint | string | number): string {
  return fromStroops(stroops).toFixed(2);
}
