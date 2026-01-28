import { describe, it, expect } from 'vitest'
import { calculateRSI, calculateRSISeries } from '../indicators/rsi'

describe('calculateRSI', () => {
  it('returns NaN when insufficient data', () => {
    expect(calculateRSI([100, 101, 102], 14)).toBeNaN()
  })

  it('returns NaN for exactly period count of prices (need period + 1)', () => {
    const prices = Array.from({ length: 14 }, (_, i) => 100 + i)
    expect(calculateRSI(prices, 14)).toBeNaN()
  })

  it('returns 100 when all price changes are gains', () => {
    // 16 prices, all going up
    const prices = Array.from({ length: 16 }, (_, i) => 100 + i)
    expect(calculateRSI(prices, 14)).toBe(100)
  })

  it('returns close to 0 when all price changes are losses', () => {
    // 16 prices, all going down
    const prices = Array.from({ length: 16 }, (_, i) => 200 - i)
    const rsi = calculateRSI(prices, 14)
    expect(rsi).toBeCloseTo(0, 0)
  })

  it('returns ~50 for oscillating prices', () => {
    // Alternate up and down by same amount
    const prices: number[] = []
    for (let i = 0; i < 30; i++) {
      prices.push(i % 2 === 0 ? 100 : 101)
    }
    const rsi = calculateRSI(prices, 14)
    expect(rsi).toBeGreaterThan(40)
    expect(rsi).toBeLessThan(60)
  })

  it('returns a value between 0 and 100 for real-world-like data', () => {
    // Simulated AAPL-like prices
    const prices = [
      150, 151, 149, 152, 148, 153, 150, 154, 149, 155,
      151, 156, 152, 157, 153, 158, 154, 159, 155, 160,
    ]
    const rsi = calculateRSI(prices, 14)
    expect(rsi).toBeGreaterThanOrEqual(0)
    expect(rsi).toBeLessThanOrEqual(100)
  })

  it('respects custom period', () => {
    const prices = Array.from({ length: 10 }, (_, i) => 100 + i)
    // Period 5 should work with 10 prices (need 6 minimum)
    const rsi = calculateRSI(prices, 5)
    expect(rsi).toBe(100) // all gains
  })
})

describe('calculateRSISeries', () => {
  it('returns empty array when insufficient data', () => {
    expect(calculateRSISeries([100, 101], 14)).toEqual([])
  })

  it('returns correct number of results', () => {
    const prices = Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i) * 5)
    const series = calculateRSISeries(prices, 14)
    // Should have results from index 14 to 29 (16 values)
    expect(series.length).toBe(16)
  })

  it('first result matches single calculateRSI', () => {
    const prices = Array.from({ length: 20 }, (_, i) => 100 + Math.sin(i) * 5)
    const series = calculateRSISeries(prices, 14)
    const single = calculateRSI(prices.slice(0, 15), 14)
    expect(series[0].rsi).toBeCloseTo(single, 5)
  })

  it('all RSI values are between 0 and 100', () => {
    const prices = Array.from({ length: 50 }, () => 100 + Math.random() * 20 - 10)
    const series = calculateRSISeries(prices, 14)
    for (const point of series) {
      expect(point.rsi).toBeGreaterThanOrEqual(0)
      expect(point.rsi).toBeLessThanOrEqual(100)
    }
  })
})
