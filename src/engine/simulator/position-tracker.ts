/**
 * Position tracker - manages open and closed positions.
 * Pure state management, no side effects.
 */

import { v4 as uuidv4 } from 'uuid'
import type { Position, ClosedTrade, CombinedSignal } from '../types'
import { differenceInCalendarDays, parseISO } from 'date-fns'

export class PositionTracker {
  private openPositions: Map<string, Position> = new Map()
  private closedTrades: ClosedTrade[] = []
  private cash: number
  private initialCapital: number

  constructor(initialCapital: number) {
    this.cash = initialCapital
    this.initialCapital = initialCapital
  }

  /**
   * Open a new long position.
   * @returns true if position was opened, false if insufficient funds or already holding
   */
  openPosition(
    symbol: string,
    date: string,
    price: number,
    maxPositionSizePercent: number,
    maxOpenPositions: number,
    signal: CombinedSignal
  ): boolean {
    // Already holding this symbol
    if (this.openPositions.has(symbol)) {
      return false
    }

    // Max positions reached
    if (this.openPositions.size >= maxOpenPositions) {
      return false
    }

    // Calculate position size
    const portfolioValue = this.getPortfolioValue(date, new Map([[symbol, price]]))
    const maxPositionValue = portfolioValue * (maxPositionSizePercent / 100)
    const positionValue = Math.min(maxPositionValue, this.cash)

    if (positionValue < price) {
      return false // Can't afford even 1 share
    }

    const quantity = Math.floor(positionValue / price)
    if (quantity <= 0) {
      return false
    }

    const cost = quantity * price
    this.cash -= cost

    const position: Position = {
      id: uuidv4(),
      symbol,
      entryDate: date,
      entryPrice: price,
      quantity,
      side: 'long',
      signalAtEntry: signal,
    }

    this.openPositions.set(symbol, position)
    return true
  }

  /**
   * Close a position.
   * @returns The closed trade, or null if no position exists
   */
  closePosition(
    symbol: string,
    date: string,
    price: number,
    exitReason: ClosedTrade['exitReason']
  ): ClosedTrade | null {
    const position = this.openPositions.get(symbol)
    if (!position) {
      return null
    }

    const proceeds = position.quantity * price
    const cost = position.quantity * position.entryPrice
    const pnl = proceeds - cost
    const pnlPercent = ((price - position.entryPrice) / position.entryPrice) * 100
    const holdingDays = differenceInCalendarDays(
      parseISO(date),
      parseISO(position.entryDate)
    )

    this.cash += proceeds
    this.openPositions.delete(symbol)

    const trade: ClosedTrade = {
      id: position.id,
      symbol,
      entryDate: position.entryDate,
      entryPrice: position.entryPrice,
      exitDate: date,
      exitPrice: price,
      quantity: position.quantity,
      side: 'long',
      pnl,
      pnlPercent,
      holdingDays: Math.max(holdingDays, 1),
      exitReason,
      signalAtEntry: position.signalAtEntry,
    }

    this.closedTrades.push(trade)
    return trade
  }

  /**
   * Check if take-profit or stop-loss should trigger.
   */
  checkExitConditions(
    symbol: string,
    currentPrice: number,
    takeProfitPercent: number,
    stopLossPercent: number
  ): 'take_profit' | 'stop_loss' | null {
    const position = this.openPositions.get(symbol)
    if (!position) return null

    const changePercent = ((currentPrice - position.entryPrice) / position.entryPrice) * 100

    if (changePercent >= takeProfitPercent) {
      return 'take_profit'
    }
    if (changePercent <= -stopLossPercent) {
      return 'stop_loss'
    }
    return null
  }

  /**
   * Get current portfolio value (cash + unrealized positions).
   */
  getPortfolioValue(_date: string, currentPrices: Map<string, number>): number {
    let positionsValue = 0
    for (const [symbol, position] of this.openPositions) {
      const price = currentPrices.get(symbol) ?? position.entryPrice
      positionsValue += position.quantity * price
    }
    return this.cash + positionsValue
  }

  getPositionsValue(currentPrices: Map<string, number>): number {
    let value = 0
    for (const [symbol, position] of this.openPositions) {
      const price = currentPrices.get(symbol) ?? position.entryPrice
      value += position.quantity * price
    }
    return value
  }

  getCash(): number {
    return this.cash
  }

  getInitialCapital(): number {
    return this.initialCapital
  }

  getOpenPositions(): Map<string, Position> {
    return new Map(this.openPositions)
  }

  getOpenPositionCount(): number {
    return this.openPositions.size
  }

  hasPosition(symbol: string): boolean {
    return this.openPositions.has(symbol)
  }

  getClosedTrades(): ClosedTrade[] {
    return [...this.closedTrades]
  }

  /**
   * Get all open position symbols.
   */
  getOpenSymbols(): string[] {
    return Array.from(this.openPositions.keys())
  }
}
