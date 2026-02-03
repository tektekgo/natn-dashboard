import { describe, it, expect } from 'vitest'
import { generateFundamentalSignal } from '../signals/fundamental'
import type { FundamentalData } from '../types'
import { DEFAULT_FUNDAMENTAL_CONFIG } from '../../types/strategy-config'

const goodFundamentals: FundamentalData = {
  symbol: 'AAPL',
  peRatio: 25,
  eps: 6.5,
  epsGrowth: 0.12,
  beta: 1.1,
  dividendYield: 0.005,
  marketCap: 3_000_000_000_000,
  reportDate: '2024-01-01',
}

const badFundamentals: FundamentalData = {
  symbol: 'BAD',
  peRatio: -5,
  eps: -2.0,
  epsGrowth: -0.3,
  beta: 3.0,
  dividendYield: 0,
  marketCap: 500_000_000,
  reportDate: '2024-01-01',
}

describe('generateFundamentalSignal', () => {
  it('returns hold with null data', () => {
    const result = generateFundamentalSignal(null, DEFAULT_FUNDAMENTAL_CONFIG)
    expect(result.action).toBe('hold')
    expect(result.score).toBe(50)
    expect(result.reasons).toContain('No fundamental data available')
  })

  it('returns buy for strong fundamentals', () => {
    const result = generateFundamentalSignal(goodFundamentals, DEFAULT_FUNDAMENTAL_CONFIG)
    expect(result.action).toBe('buy')
    expect(result.score).toBeGreaterThanOrEqual(50)
  })

  it('penalizes negative PE ratio', () => {
    const result = generateFundamentalSignal(badFundamentals, DEFAULT_FUNDAMENTAL_CONFIG)
    expect(result.score).toBeLessThan(30)
    const hasNegPE = result.reasons.some(r => r.includes('Negative PE') || r.includes('not profitable'))
    expect(hasNegPE).toBe(true)
  })

  it('rewards positive EPS', () => {
    const result = generateFundamentalSignal(goodFundamentals, DEFAULT_FUNDAMENTAL_CONFIG)
    const hasPositiveEPS = result.reasons.some(r => r.includes('Positive EPS'))
    expect(hasPositiveEPS).toBe(true)
  })

  it('penalizes negative EPS', () => {
    const result = generateFundamentalSignal(badFundamentals, DEFAULT_FUNDAMENTAL_CONFIG)
    const hasNegEPS = result.reasons.some(r => r.includes('Negative EPS'))
    expect(hasNegEPS).toBe(true)
  })

  it('rewards beta within range', () => {
    const result = generateFundamentalSignal(goodFundamentals, DEFAULT_FUNDAMENTAL_CONFIG)
    const hasBeta = result.reasons.some(r => r.includes('Beta within range'))
    expect(hasBeta).toBe(true)
  })

  it('penalizes high beta', () => {
    const result = generateFundamentalSignal(badFundamentals, DEFAULT_FUNDAMENTAL_CONFIG)
    const hasHighBeta = result.reasons.some(r => r.includes('Beta too high'))
    expect(hasHighBeta).toBe(true)
  })

  it('score is clamped between 0 and 100', () => {
    const result = generateFundamentalSignal(badFundamentals, DEFAULT_FUNDAMENTAL_CONFIG)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })

  it('requires positive EPS AND favorable PE for buy', () => {
    const noEPS: FundamentalData = {
      ...goodFundamentals,
      eps: null,
    }
    const result = generateFundamentalSignal(noEPS, DEFAULT_FUNDAMENTAL_CONFIG)
    expect(result.action).not.toBe('buy')
  })
})
