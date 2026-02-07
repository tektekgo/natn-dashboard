/**
 * SMA (Simple Moving Average).
 * Pure function, ported from dashboard engine.
 */

export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return NaN
  const slice = prices.slice(prices.length - period)
  return slice.reduce((acc, val) => acc + val, 0) / period
}
