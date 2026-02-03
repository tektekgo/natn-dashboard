/**
 * External API response shapes for Alpaca and FMP.
 */

// -----------------------------------------------------------------------------
// Alpaca API Types
// -----------------------------------------------------------------------------

export interface AlpacaBar {
  t: string    // timestamp ISO
  o: number    // open
  h: number    // high
  l: number    // low
  c: number    // close
  v: number    // volume
  n: number    // number of trades
  vw: number   // volume weighted average price
}

export interface AlpacaBarsResponse {
  bars: Record<string, AlpacaBar[]> | AlpacaBar[]
  next_page_token: string | null
}

export interface AlpacaMultiBarsResponse {
  bars: Record<string, AlpacaBar[]>
  next_page_token: string | null
}

// -----------------------------------------------------------------------------
// FMP (Financial Modeling Prep) API Types
// -----------------------------------------------------------------------------

export interface FMPCompanyProfile {
  symbol: string
  companyName: string
  currency: string
  exchange: string
  exchangeShortName: string
  industry: string
  sector: string
  country: string
  mktCap: number
  price: number
  beta: number
  volAvg: number
  lastDiv: number
  range: string
  ipoDate: string
  description: string
  isActivelyTrading: boolean
}

export interface FMPIncomeStatement {
  date: string
  symbol: string
  reportedCurrency: string
  period: string
  revenue: number
  costOfRevenue: number
  grossProfit: number
  grossProfitRatio: number
  operatingIncome: number
  operatingIncomeRatio: number
  netIncome: number
  netIncomeRatio: number
  eps: number
  epsdiluted: number
  weightedAverageShsOut: number
  weightedAverageShsOutDil: number
}

export interface FMPKeyMetrics {
  date: string
  symbol: string
  period: string
  peRatio: number
  priceToSalesRatio: number
  pbRatio: number
  debtToEquity: number
  currentRatio: number
  dividendYield: number
  earningsYield: number
  enterpriseValue: number
  roe: number
  roic: number
  revenuePerShare: number
  netIncomePerShare: number
  bookValuePerShare: number
  freeCashFlowPerShare: number
}
