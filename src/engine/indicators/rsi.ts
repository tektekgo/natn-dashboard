/**
 * RSI (Relative Strength Index) calculation.
 * Pure function - no side effects, no external dependencies.
 *
 * Uses Wilder's smoothing method (exponential moving average of gains/losses).
 */

/**
 * Calculate RSI for a series of closing prices.
 * @param prices Array of closing prices (oldest first)
 * @param period RSI period (default 14)
 * @returns RSI value (0-100), or NaN if insufficient data
 */
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) {
    return NaN
  }

  // Calculate price changes
  const changes: number[] = []
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1])
  }

  // Initial average gain and loss (simple average for first period)
  let avgGain = 0
  let avgLoss = 0

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i]
    } else {
      avgLoss += Math.abs(changes[i])
    }
  }

  avgGain /= period
  avgLoss /= period

  // Wilder's smoothing for remaining periods
  for (let i = period; i < changes.length; i++) {
    const gain = changes[i] > 0 ? changes[i] : 0
    const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0

    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
  }

  if (avgLoss === 0) {
    return 100
  }

  const rs = avgGain / avgLoss
  return 100 - (100 / (1 + rs))
}

/**
 * Calculate RSI series for all valid points in the price array.
 * @param prices Array of closing prices (oldest first)
 * @param period RSI period (default 14)
 * @returns Array of { index, rsi } for each point where RSI can be calculated
 */
export function calculateRSISeries(
  prices: number[],
  period: number = 14
): { index: number; rsi: number }[] {
  if (prices.length < period + 1) {
    return []
  }

  const results: { index: number; rsi: number }[] = []
  const changes: number[] = []

  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1])
  }

  // Initial average gain and loss
  let avgGain = 0
  let avgLoss = 0

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i]
    } else {
      avgLoss += Math.abs(changes[i])
    }
  }

  avgGain /= period
  avgLoss /= period

  // First RSI value
  const firstRS = avgLoss === 0 ? Infinity : avgGain / avgLoss
  const firstRSI = avgLoss === 0 ? 100 : 100 - (100 / (1 + firstRS))
  results.push({ index: period, rsi: firstRSI })

  // Subsequent RSI values using Wilder's smoothing
  for (let i = period; i < changes.length; i++) {
    const gain = changes[i] > 0 ? changes[i] : 0
    const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0

    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period

    const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss
    const rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs))
    results.push({ index: i + 1, rsi })
  }

  return results
}
