import { describe, it, expect } from 'vitest'
import { generateTechnicalSignal } from '../signals/technical'
import type { OHLCV } from '../types'
import { DEFAULT_TECHNICAL_CONFIG } from '../../types/strategy-config'

function makePrices(closes: number[]): OHLCV[] {
  return closes.map((close, i) => ({
    date: `2024-01-${String(i + 1).padStart(2, '0')}`,
    open: close - 1,
    high: close + 1,
    low: close - 2,
    close,
    volume: 1000000,
  }))
}

describe('generateTechnicalSignal', () => {
  it('returns hold with insufficient data', () => {
    const prices = makePrices([100, 101, 102])
    const result = generateTechnicalSignal(prices, DEFAULT_TECHNICAL_CONFIG)
    expect(result.action).toBe('hold')
    expect(result.score).toBe(50)
    expect(result.reasons).toContain('Insufficient data for technical analysis')
  })

  it('returns a valid signal with enough data', () => {
    // 250 days of gradually increasing prices
    const closes = Array.from({ length: 250 }, (_, i) => 100 + i * 0.5)
    const prices = makePrices(closes)
    const result = generateTechnicalSignal(prices, DEFAULT_TECHNICAL_CONFIG)

    expect(['buy', 'sell', 'hold']).toContain(result.action)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
    expect(result.reasons.length).toBeGreaterThan(0)
  })

  it('detects golden cross (SMA short > SMA long)', () => {
    // Build prices where short SMA > long SMA
    // Start low, then trend strongly upward
    const closes: number[] = []
    for (let i = 0; i < 250; i++) {
      closes.push(50 + i * 0.5) // steady uptrend
    }
    const prices = makePrices(closes)
    const result = generateTechnicalSignal(prices, DEFAULT_TECHNICAL_CONFIG)

    expect(result.smaShort).toBeGreaterThan(result.smaLong)
    const hasGoldenCross = result.reasons.some(r => r.includes('Golden cross'))
    expect(hasGoldenCross).toBe(true)
  })

  it('detects death cross (SMA short < SMA long)', () => {
    // Start high, then trend downward
    const closes: number[] = []
    for (let i = 0; i < 250; i++) {
      closes.push(200 - i * 0.5)
    }
    const prices = makePrices(closes)
    const result = generateTechnicalSignal(prices, DEFAULT_TECHNICAL_CONFIG)

    expect(result.smaShort).toBeLessThan(result.smaLong)
    const hasDeathCross = result.reasons.some(r => r.includes('Death cross'))
    expect(hasDeathCross).toBe(true)
  })

  it('score is clamped between 0 and 100', () => {
    // Very bearish scenario
    const closes: number[] = []
    for (let i = 0; i < 250; i++) {
      closes.push(300 - i * 1.0) // aggressive downtrend
    }
    const prices = makePrices(closes)
    const result = generateTechnicalSignal(prices, DEFAULT_TECHNICAL_CONFIG)

    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })
})
