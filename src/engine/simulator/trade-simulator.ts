/**
 * Trade simulator - day-by-day simulation loop.
 *
 * For each trading day:
 * 1. Check existing positions for take-profit/stop-loss
 * 2. Generate signals for all symbols
 * 3. Execute buy signals for stocks without positions
 * 4. Execute sell signals for stocks with positions
 * 5. Record portfolio snapshot
 *
 * At end of period: close all remaining positions.
 */

import type { OHLCV, FundamentalData, PortfolioSnapshot, ClosedTrade, CombinedSignal } from '../types'
import type { FullStrategyConfig } from '../../types/strategy-config'
import { generateTechnicalSignal } from '../signals/technical'
import { generateFundamentalSignal } from '../signals/fundamental'
import { combineSignals } from '../signals/combiner'
import { PositionTracker } from './position-tracker'

export interface SimulationInput {
  config: FullStrategyConfig
  /** Map of symbol -> OHLCV array (oldest first) */
  priceData: Map<string, OHLCV[]>
  /** Map of symbol -> FundamentalData array (sorted by reportDate desc) */
  fundamentalData: Map<string, FundamentalData[]>
  startDate: string
  endDate: string
}

export interface SimulationOutput {
  trades: ClosedTrade[]
  equityCurve: PortfolioSnapshot[]
  /** Signal at entry for each trade (for attribution) */
  signalHistory: Map<string, CombinedSignal[]>
}

/**
 * Run the trade simulation loop.
 */
export function runSimulation(input: SimulationInput): SimulationOutput {
  const { config, priceData, fundamentalData, startDate, endDate } = input
  const tracker = new PositionTracker(config.initialCapital)
  const equityCurve: PortfolioSnapshot[] = []
  const signalHistory = new Map<string, CombinedSignal[]>()

  // Build a unified date list from all symbols' price data
  const dateSet = new Set<string>()
  for (const bars of priceData.values()) {
    for (const bar of bars) {
      if (bar.date >= startDate && bar.date <= endDate) {
        dateSet.add(bar.date)
      }
    }
  }

  const tradingDates = Array.from(dateSet).sort()
  if (tradingDates.length === 0) {
    return { trades: [], equityCurve: [], signalHistory }
  }

  // Build price index: symbol -> date -> OHLCV
  const priceIndex = new Map<string, Map<string, OHLCV>>()
  for (const [symbol, bars] of priceData) {
    const dateMap = new Map<string, OHLCV>()
    for (const bar of bars) {
      dateMap.set(bar.date, bar)
    }
    priceIndex.set(symbol, dateMap)
  }

  // Simulate each trading day
  for (let dayIdx = 0; dayIdx < tradingDates.length; dayIdx++) {
    const date = tradingDates[dayIdx]
    const isLastDay = dayIdx === tradingDates.length - 1

    // Collect current prices for all symbols
    const currentPrices = new Map<string, number>()
    for (const symbol of config.symbols) {
      const bar = priceIndex.get(symbol)?.get(date)
      if (bar) {
        currentPrices.set(symbol, bar.close)
      }
    }

    // 1. Check existing positions for take-profit/stop-loss
    for (const symbol of tracker.getOpenSymbols()) {
      const price = currentPrices.get(symbol)
      if (!price) continue

      const exitCondition = tracker.checkExitConditions(
        symbol,
        price,
        config.risk.takeProfitPercent,
        config.risk.stopLossPercent
      )

      if (exitCondition) {
        tracker.closePosition(symbol, date, price, exitCondition)
      }
    }

    // 2. Close all remaining positions on last day
    if (isLastDay) {
      for (const symbol of tracker.getOpenSymbols()) {
        const price = currentPrices.get(symbol)
        if (price) {
          tracker.closePosition(symbol, date, price, 'end_of_period')
        }
      }
    } else {
      // 3. Evaluate buy/sell signals for each symbol
      for (const symbol of config.symbols) {
        const allBars = priceData.get(symbol)
        if (!allBars) continue

        // Get price history up to and including current date
        const barsUpToDate = allBars.filter(b => b.date <= date)
        if (barsUpToDate.length < 20) continue // Need minimum data for indicators

        const currentPrice = currentPrices.get(symbol)
        if (!currentPrice) continue

        // Generate technical signal
        const technicalSignal = generateTechnicalSignal(barsUpToDate, config.technical)

        // Get fundamental data available as of this date (look-ahead bias prevention)
        const fundData = getFundamentalDataAsOfDate(
          fundamentalData.get(symbol) || [],
          date
        )
        const fundamentalSignal = generateFundamentalSignal(fundData, config.fundamental)

        // Combine signals
        const combined = combineSignals({
          technical: technicalSignal,
          fundamental: fundamentalSignal,
          weights: config.weights,
          sentimentAvailable: false,
        })

        // Track signal history
        if (!signalHistory.has(symbol)) {
          signalHistory.set(symbol, [])
        }
        signalHistory.get(symbol)!.push(combined)

        // Execute based on combined signal
        if (combined.action === 'buy' && !tracker.hasPosition(symbol)) {
          tracker.openPosition(
            symbol,
            date,
            currentPrice,
            config.risk.maxPositionSizePercent,
            config.risk.maxOpenPositions,
            combined
          )
        } else if (combined.action === 'sell' && tracker.hasPosition(symbol)) {
          tracker.closePosition(symbol, date, currentPrice, 'signal_sell')
        }
      }
    }

    // 4. Record portfolio snapshot
    const snapshot: PortfolioSnapshot = {
      date,
      equity: tracker.getPortfolioValue(date, currentPrices),
      cash: tracker.getCash(),
      positionsValue: tracker.getPositionsValue(currentPrices),
      openPositionCount: tracker.getOpenPositionCount(),
    }
    equityCurve.push(snapshot)
  }

  return {
    trades: tracker.getClosedTrades(),
    equityCurve,
    signalHistory,
  }
}

/**
 * Get the most recent fundamental data that was reported BEFORE the given date.
 * This prevents look-ahead bias in backtesting.
 */
function getFundamentalDataAsOfDate(
  allData: FundamentalData[],
  asOfDate: string
): FundamentalData | null {
  // Data is sorted by reportDate descending
  for (const data of allData) {
    if (data.reportDate <= asOfDate) {
      return data
    }
  }
  return null
}
