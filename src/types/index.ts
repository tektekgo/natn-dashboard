// Re-export all types
export * from './database'

// User types
export interface User {
  id: string
  email: string
  role: 'owner' | 'admin' | 'user'
  subscriptionTier: 'free' | 'basic' | 'pro' | 'premium'
  createdAt: string
}

// Strategy types (for future phases)
export interface Strategy {
  id: string
  userId: string
  name: string
  description?: string
  config: StrategyConfig
  createdAt: string
  updatedAt: string
}

export interface StrategyConfig {
  symbols: string[]
  signals: SignalConfig[]
  riskManagement: RiskManagementConfig
}

export interface SignalConfig {
  type: 'technical' | 'fundamental' | 'sentiment'
  name: string
  weight: number
  parameters: Record<string, unknown>
}

export interface RiskManagementConfig {
  maxPositionSize: number
  stopLossPercent: number
  takeProfitPercent: number
  maxPortfolioRisk: number
}

// Backtest types (for future phases)
export interface BacktestResult {
  id: string
  strategyId: string
  startDate: string
  endDate: string
  initialCapital: number
  finalCapital: number
  totalReturn: number
  maxDrawdown: number
  sharpeRatio: number
  trades: BacktestTrade[]
  createdAt: string
}

export interface BacktestTrade {
  symbol: string
  side: 'buy' | 'sell'
  price: number
  quantity: number
  timestamp: string
  pnl?: number
}
