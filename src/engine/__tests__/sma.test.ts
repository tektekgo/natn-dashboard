import { describe, it, expect } from 'vitest'
import { calculateSMA, calculateSMASeries } from '../indicators/sma'

describe('calculateSMA', () => {
  it('returns NaN when insufficient data', () => {
    expect(calculateSMA([100, 101], 5)).toBeNaN()
  })

  it('returns the single value for period 1', () => {
    expect(calculateSMA([42], 1)).toBe(42)
  })

  it('calculates correct average for simple case', () => {
    expect(calculateSMA([10, 20, 30, 40, 50], 5)).toBe(30)
  })

  it('only uses the last N prices', () => {
    // SMA of last 3: (30+40+50)/3 = 40
    expect(calculateSMA([10, 20, 30, 40, 50], 3)).toBe(40)
  })

  it('handles identical prices', () => {
    expect(calculateSMA([100, 100, 100, 100, 100], 5)).toBe(100)
  })

  it('handles decimal prices', () => {
    const sma = calculateSMA([10.5, 20.5, 30.5], 3)
    expect(sma).toBeCloseTo(20.5, 10)
  })
})

describe('calculateSMASeries', () => {
  it('returns empty array when insufficient data', () => {
    expect(calculateSMASeries([100, 101], 5)).toEqual([])
  })

  it('returns correct number of results', () => {
    const prices = [10, 20, 30, 40, 50, 60, 70]
    const series = calculateSMASeries(prices, 3)
    // Should have 5 results (indices 2-6)
    expect(series.length).toBe(5)
  })

  it('first result uses first N prices', () => {
    const prices = [10, 20, 30, 40, 50]
    const series = calculateSMASeries(prices, 3)
    // First SMA(3) = (10+20+30)/3 = 20
    expect(series[0].sma).toBe(20)
    expect(series[0].index).toBe(2)
  })

  it('last result matches single calculateSMA', () => {
    const prices = [10, 20, 30, 40, 50, 60, 70]
    const series = calculateSMASeries(prices, 3)
    const single = calculateSMA(prices, 3)
    expect(series[series.length - 1].sma).toBe(single)
  })

  it('uses running sum correctly (values shift smoothly)', () => {
    const prices = [10, 20, 30, 40, 50]
    const series = calculateSMASeries(prices, 3)
    expect(series[0].sma).toBe(20) // (10+20+30)/3
    expect(series[1].sma).toBe(30) // (20+30+40)/3
    expect(series[2].sma).toBe(40) // (30+40+50)/3
  })
})
