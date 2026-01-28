/**
 * Full Strategy Configuration
 * Mirrors the n8n Config node structure for trading strategies.
 */

export interface TechnicalConfig {
  rsiPeriod: number
  rsiOverbought: number
  rsiOversold: number
  smaShortPeriod: number
  smaLongPeriod: number
  smaTrendPeriod: number
}

export interface FundamentalConfig {
  peRatioMax: number
  peRatioMin: number
  epsGrowthMin: number
  betaMax: number
  dividendYieldMin: number
  marketCapMin: number
}

export interface SentimentConfig {
  enabled: boolean
  newsScoreThreshold: number
  socialScoreThreshold: number
}

export interface RiskConfig {
  takeProfitPercent: number
  stopLossPercent: number
  maxPositionSizePercent: number
  maxOpenPositions: number
  maxPortfolioRiskPercent: number
}

export interface SignalWeights {
  technical: number
  fundamental: number
  sentiment: number
}

export interface FullStrategyConfig {
  name: string
  description: string
  symbols: string[]
  technical: TechnicalConfig
  fundamental: FundamentalConfig
  sentiment: SentimentConfig
  risk: RiskConfig
  weights: SignalWeights
  initialCapital: number
}

export const DEFAULT_TECHNICAL_CONFIG: TechnicalConfig = {
  rsiPeriod: 14,
  rsiOverbought: 70,
  rsiOversold: 30,
  smaShortPeriod: 50,
  smaLongPeriod: 200,
  smaTrendPeriod: 20,
}

export const DEFAULT_FUNDAMENTAL_CONFIG: FundamentalConfig = {
  peRatioMax: 35,
  peRatioMin: 5,
  epsGrowthMin: 0,
  betaMax: 2.0,
  dividendYieldMin: 0,
  marketCapMin: 1_000_000_000,
}

export const DEFAULT_SENTIMENT_CONFIG: SentimentConfig = {
  enabled: false,
  newsScoreThreshold: 50,
  socialScoreThreshold: 50,
}

export const DEFAULT_RISK_CONFIG: RiskConfig = {
  takeProfitPercent: 15,
  stopLossPercent: 7,
  maxPositionSizePercent: 20,
  maxOpenPositions: 5,
  maxPortfolioRiskPercent: 50,
}

export const DEFAULT_SIGNAL_WEIGHTS: SignalWeights = {
  technical: 40,
  fundamental: 35,
  sentiment: 25,
}

export const DEFAULT_STRATEGY_CONFIG: FullStrategyConfig = {
  name: 'My Strategy',
  description: '',
  symbols: ['AAPL'],
  technical: DEFAULT_TECHNICAL_CONFIG,
  fundamental: DEFAULT_FUNDAMENTAL_CONFIG,
  sentiment: DEFAULT_SENTIMENT_CONFIG,
  risk: DEFAULT_RISK_CONFIG,
  weights: DEFAULT_SIGNAL_WEIGHTS,
  initialCapital: 100_000,
}
