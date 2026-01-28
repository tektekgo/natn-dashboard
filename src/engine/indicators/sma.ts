/**
 * SMA (Simple Moving Average) calculation.
 * Pure function - no side effects, no external dependencies.
 */

/**
 * Calculate SMA for the most recent period of closing prices.
 * @param prices Array of closing prices (oldest first)
 * @param period SMA period
 * @returns SMA value, or NaN if insufficient data
 */
export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) {
    return NaN
  }

  const slice = prices.slice(prices.length - period)
  const sum = slice.reduce((acc, val) => acc + val, 0)
  return sum / period
}

/**
 * Calculate SMA series for all valid points in the price array.
 * @param prices Array of closing prices (oldest first)
 * @param period SMA period
 * @returns Array of { index, sma } for each point where SMA can be calculated
 */
export function calculateSMASeries(
  prices: number[],
  period: number
): { index: number; sma: number }[] {
  if (prices.length < period) {
    return []
  }

  const results: { index: number; sma: number }[] = []

  // Use a running sum for efficiency
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += prices[i]
  }
  results.push({ index: period - 1, sma: sum / period })

  for (let i = period; i < prices.length; i++) {
    sum += prices[i] - prices[i - period]
    results.push({ index: i, sma: sum / period })
  }

  return results
}
