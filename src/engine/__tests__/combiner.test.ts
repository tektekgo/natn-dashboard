import { describe, it, expect } from 'vitest'
import { combineSignals } from '../signals/combiner'
import type { TechnicalSignalResult, FundamentalSignalResult } from '../types'
import { DEFAULT_SIGNAL_WEIGHTS } from '../../types/strategy-config'

const bullishTechnical: TechnicalSignalResult = {
  action: 'buy',
  score: 80,
  rsiValue: 35,
  smaShort: 155,
  smaLong: 150,
  smaTrend: 148,
  currentPrice: 157,
  reasons: ['RSI neutral-low', 'Golden cross'],
}

const bearishTechnical: TechnicalSignalResult = {
  action: 'sell',
  score: 20,
  rsiValue: 78,
  smaShort: 145,
  smaLong: 150,
  smaTrend: 152,
  currentPrice: 143,
  reasons: ['RSI overbought', 'Death cross'],
}

const bullishFundamental: FundamentalSignalResult = {
  action: 'buy',
  score: 75,
  peRatio: 22,
  eps: 6.5,
  epsGrowth: 0.1,
  beta: 1.0,
  reasons: ['PE favorable', 'Positive EPS'],
}

const bearishFundamental: FundamentalSignalResult = {
  action: 'sell',
  score: 15,
  peRatio: -3,
  eps: -1.5,
  epsGrowth: -0.2,
  beta: 2.5,
  reasons: ['Negative PE', 'Negative EPS'],
}

describe('combineSignals', () => {
  it('produces buy when both signals are bullish', () => {
    const result = combineSignals({
      technical: bullishTechnical,
      fundamental: bullishFundamental,
      weights: DEFAULT_SIGNAL_WEIGHTS,
    })

    expect(result.action).toBe('buy')
    expect(result.totalScore).toBeGreaterThan(55)
    expect(result.vetoed).toBe(false)
  })

  it('produces sell when both signals are bearish', () => {
    const result = combineSignals({
      technical: bearishTechnical,
      fundamental: bearishFundamental,
      weights: DEFAULT_SIGNAL_WEIGHTS,
    })

    expect(result.action).toBe('sell')
    expect(result.totalScore).toBeLessThan(35)
  })

  it('normalizes weights when sentiment unavailable', () => {
    const result = combineSignals({
      technical: bullishTechnical,
      fundamental: bullishFundamental,
      weights: DEFAULT_SIGNAL_WEIGHTS,
      sentimentAvailable: false,
    })

    // Weights should normalize: tech 40/(40+35)*100 ≈ 53.3, fund 35/(40+35)*100 ≈ 46.7
    expect(result.technicalWeight).toBeCloseTo(53.33, 1)
    expect(result.fundamentalWeight).toBeCloseTo(46.67, 1)
  })

  it('vetoes buy when fundamental score critically low', () => {
    // Need tech score high enough so combined score >= 55 to trigger buy before veto
    const strongTech: TechnicalSignalResult = {
      ...bullishTechnical,
      score: 95,
      rsiValue: 35,
    }
    const result = combineSignals({
      technical: strongTech,
      fundamental: { ...bearishFundamental, score: 15 },
      weights: DEFAULT_SIGNAL_WEIGHTS,
    })

    expect(result.vetoed).toBe(true)
    expect(result.action).not.toBe('buy')
    expect(result.vetoReason).toContain('Fundamental score critically low')
  })

  it('vetoes buy when RSI is overbought', () => {
    const overboughtTech: TechnicalSignalResult = {
      ...bullishTechnical,
      rsiValue: 80,
      score: 75,
    }
    const result = combineSignals({
      technical: overboughtTech,
      fundamental: bullishFundamental,
      weights: DEFAULT_SIGNAL_WEIGHTS,
    })

    expect(result.vetoed).toBe(true)
    expect(result.vetoReason).toContain('RSI overbought')
  })

  it('includes reasons from both signals', () => {
    const result = combineSignals({
      technical: bullishTechnical,
      fundamental: bullishFundamental,
      weights: DEFAULT_SIGNAL_WEIGHTS,
    })

    const techReasons = result.reasons.filter(r => r.startsWith('[Tech]'))
    const fundReasons = result.reasons.filter(r => r.startsWith('[Fund]'))
    expect(techReasons.length).toBeGreaterThan(0)
    expect(fundReasons.length).toBeGreaterThan(0)
  })

  it('respects custom weight ratios', () => {
    const customWeights = { technical: 80, fundamental: 20, sentiment: 0 }
    const result = combineSignals({
      technical: bullishTechnical,
      fundamental: bearishFundamental,
      weights: customWeights,
    })

    // Technical-heavy should lean more bullish
    expect(result.totalScore).toBeGreaterThan(50)
  })
})
