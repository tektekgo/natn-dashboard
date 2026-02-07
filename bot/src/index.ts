/**
 * NATN Trading Bot — Main Orchestrator
 *
 * Execution flow:
 * 1. Load config, initialize clients
 * 2. Fetch active strategy from Supabase
 * 3. Log execution start
 * 4. Risk assessment (account, positions, daily P&L)
 * 5. For each symbol: check position → analyze signals → execute → log C-2 detail
 * 6. Log execution complete + send Telegram summary
 */

import { config } from './config.js'
import * as alpaca from './alpaca.js'
import * as data from './market-data.js'
import * as db from './supabase.js'
import * as telegram from './telegram.js'
import { generateTechnicalSignal } from './signals/technical.js'
import { generateFundamentalSignal } from './signals/fundamental.js'
import { generateSentimentSignal } from './signals/sentiment.js'
import { combineSignals } from './signals/combiner.js'
import type {
  FullStrategyConfig,
  RiskCheckResult,
  SymbolResult,
  AlpacaPosition,
  DetailAction,
} from './types.js'

// ---------------------------------------------------------------------------
// Risk Assessment
// ---------------------------------------------------------------------------

async function assessRisk(
  strategyConfig: FullStrategyConfig,
  positions: AlpacaPosition[]
): Promise<RiskCheckResult> {
  const account = await alpaca.getAccount()
  const todaysOrders = await alpaca.getTodaysOrders()

  const equity = parseFloat(account.equity)
  const lastEquity = parseFloat(account.last_equity)
  const dailyPlPercent = lastEquity > 0 ? ((equity - lastEquity) / lastEquity) * 100 : 0
  const totalExposure = positions.reduce((sum, p) => sum + Math.abs(parseFloat(p.market_value)), 0)

  // Risk limits from strategy config
  // Use actual account equity (not strategy's initialCapital) for exposure limit —
  // the strategy's initialCapital may not reflect the real Alpaca account size.
  const maxDailyTrades = 10 // sensible default
  const dailyLossLimit = -3 // percent
  const maxExposure = equity * (strategyConfig.risk.maxPortfolioRiskPercent / 100)

  const result: RiskCheckResult = {
    dailyTrades: todaysOrders.length,
    dailyTradeLimit: maxDailyTrades,
    dailyTradeLimitOk: todaysOrders.length < maxDailyTrades,
    dailyPlPercent,
    dailyLossLimitPercent: dailyLossLimit,
    dailyLossLimitOk: dailyPlPercent > dailyLossLimit,
    totalExposure,
    maxExposure,
    exposureLimitOk: totalExposure < maxExposure,
    allChecksPassed: false,
  }

  result.allChecksPassed = result.dailyTradeLimitOk && result.dailyLossLimitOk && result.exposureLimitOk
  return result
}

// ---------------------------------------------------------------------------
// Process Single Symbol
// ---------------------------------------------------------------------------

async function processSymbol(
  symbol: string,
  strategyConfig: FullStrategyConfig,
  positions: AlpacaPosition[],
  account: { equity: number; buyingPower: number }
): Promise<SymbolResult> {
  console.log(`\n  --- ${symbol} ---`)

  // Check existing position
  const existingPosition = positions.find(p => p.symbol === symbol)

  if (existingPosition) {
    const plPercent = parseFloat(existingPosition.unrealized_plpc) * 100
    const qty = parseInt(existingPosition.qty)
    const currentPrice = parseFloat(existingPosition.current_price)

    // Take profit check
    if (plPercent >= strategyConfig.risk.takeProfitPercent) {
      console.log(`  Take profit triggered: ${plPercent.toFixed(2)}% >= ${strategyConfig.risk.takeProfitPercent}%`)
      const order = await alpaca.placeOrder({ symbol, qty, side: 'sell' })
      return {
        symbol, action: 'sell_tp',
        signals: {}, combinedScore: null,
        outcome: `Take profit at ${plPercent.toFixed(2)}%`,
        orderId: order.id, price: currentPrice, quantity: qty,
        reason: `TP: ${plPercent.toFixed(2)}% >= ${strategyConfig.risk.takeProfitPercent}%`,
      }
    }

    // Stop loss check
    if (plPercent <= -strategyConfig.risk.stopLossPercent) {
      console.log(`  Stop loss triggered: ${plPercent.toFixed(2)}% <= -${strategyConfig.risk.stopLossPercent}%`)
      const order = await alpaca.placeOrder({ symbol, qty, side: 'sell' })
      return {
        symbol, action: 'sell_sl',
        signals: {}, combinedScore: null,
        outcome: `Stop loss at ${plPercent.toFixed(2)}%`,
        orderId: order.id, price: currentPrice, quantity: qty,
        reason: `SL: ${plPercent.toFixed(2)}% <= -${strategyConfig.risk.stopLossPercent}%`,
      }
    }

    console.log(`  Holding: P/L ${plPercent.toFixed(2)}% (TP: ${strategyConfig.risk.takeProfitPercent}%, SL: -${strategyConfig.risk.stopLossPercent}%)`)
  }

  // Fetch market data for analysis
  const bars = await alpaca.getHistoricalBars(symbol, 200)
  console.log(`  Bars fetched: ${bars.length}`)
  if (bars.length < 50) {
    console.log(`  SKIP — insufficient price data (${bars.length} bars, need 50)`)
    return {
      symbol, action: 'skip',
      signals: {}, combinedScore: null,
      outcome: null, orderId: null, price: null, quantity: null,
      reason: `Insufficient price data (${bars.length} bars)`,
    }
  }

  // Generate signals
  const techSignal = generateTechnicalSignal(bars, strategyConfig.technical)
  console.log(`  Tech: ${techSignal.action} (score: ${techSignal.score}, RSI: ${techSignal.rsiValue.toFixed(1)})`)

  const fundamentals = await data.fetchFundamentals(symbol)
  const fundSignal = generateFundamentalSignal(fundamentals, strategyConfig.fundamental)
  console.log(`  Fund: ${fundSignal.action} (score: ${fundSignal.score})`)

  let sentSignal = undefined
  const sentimentAvailable = strategyConfig.sentiment.enabled
  if (sentimentAvailable) {
    const sentimentData = await data.fetchSentiment(symbol)
    sentSignal = generateSentimentSignal(sentimentData, strategyConfig.sentiment)
    console.log(`  Sent: ${sentSignal.action} (score: ${sentSignal.score}, ${sentSignal.articleCount} articles)`)
  }

  // Combine signals
  const combined = combineSignals({
    technical: techSignal,
    fundamental: fundSignal,
    sentiment: sentSignal,
    weights: strategyConfig.weights,
    sentimentAvailable,
  })

  console.log(`  Combined: ${combined.action} (score: ${combined.totalScore.toFixed(1)})${combined.vetoed ? ` [VETOED: ${combined.vetoReason}]` : ''}`)

  // Execute buy if signal says so and we don't already hold
  if (combined.action === 'buy' && !existingPosition) {
    // Check open position count limit
    const openCount = positions.length
    if (openCount >= strategyConfig.risk.maxOpenPositions) {
      return {
        symbol, action: 'skip',
        signals: { technical: techSignal, fundamental: fundSignal, sentiment: sentSignal, combined },
        combinedScore: combined.totalScore,
        outcome: null, orderId: null, price: null, quantity: null,
        reason: `Max positions reached (${openCount}/${strategyConfig.risk.maxOpenPositions})`,
      }
    }

    // Calculate position size
    const maxPositionValue = account.equity * (strategyConfig.risk.maxPositionSizePercent / 100)
    const currentPrice = techSignal.currentPrice
    const qty = Math.floor(Math.min(maxPositionValue, account.buyingPower * 0.95) / currentPrice)

    if (qty <= 0) {
      return {
        symbol, action: 'skip',
        signals: { technical: techSignal, fundamental: fundSignal, sentiment: sentSignal, combined },
        combinedScore: combined.totalScore,
        outcome: null, orderId: null, price: null, quantity: null,
        reason: `Insufficient buying power for 1 share ($${currentPrice.toFixed(2)})`,
      }
    }

    const order = await alpaca.placeOrder({ symbol, qty, side: 'buy' })
    await telegram.notifyOrder(
      { symbol, action: 'buy', signals: {}, combinedScore: combined.totalScore, outcome: null, orderId: order.id, price: currentPrice, quantity: qty, reason: combined.reasons.join('; ') },
      'buy'
    )

    return {
      symbol, action: 'buy',
      signals: { technical: techSignal, fundamental: fundSignal, sentiment: sentSignal, combined },
      combinedScore: combined.totalScore,
      outcome: 'Order placed',
      orderId: order.id, price: currentPrice, quantity: qty,
      reason: combined.reasons.slice(0, 3).join('; '),
    }
  }

  // No action
  return {
    symbol, action: 'skip' as DetailAction,
    signals: { technical: techSignal, fundamental: fundSignal, sentiment: sentSignal, combined },
    combinedScore: combined.totalScore,
    outcome: null, orderId: null,
    price: techSignal.currentPrice, quantity: null,
    reason: existingPosition ? 'Holding — no TP/SL triggered' : `Signal: ${combined.action} (score: ${combined.totalScore.toFixed(1)})`,
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('='.repeat(60))
  console.log(`NATN Trading Bot — ${new Date().toISOString()}`)
  console.log(`Mode: ${config.dryRun ? 'DRY RUN' : 'LIVE PAPER TRADING'}`)
  console.log('='.repeat(60))

  // 1. Fetch active strategy
  const strategy = await db.getActiveStrategy(config.userId || undefined)
  if (!strategy) {
    console.log('No active strategy found. Exiting.')
    return
  }

  const strategyConfig = strategy.config
  console.log(`\nStrategy: ${strategyConfig.name}`)
  console.log(`Symbols: ${strategyConfig.symbols.join(', ')}`)
  console.log(`Mode: ${strategy.trading_mode}`)

  await telegram.notifyExecutionStart(strategyConfig.name)

  // 2. Log execution start
  const executionId = await db.logExecutionStart(strategy.id, strategy.user_id)
  console.log(`Execution ID: ${executionId}`)

  try {
    // 3. Get account and positions
    const account = await alpaca.getAccount()
    const positions = await alpaca.getAllPositions()

    console.log(`\nAccount: equity=$${parseFloat(account.equity).toFixed(2)}, cash=$${parseFloat(account.cash).toFixed(2)}, buying_power=$${parseFloat(account.buying_power).toFixed(2)}`)
    console.log(`Open positions: ${positions.length}`)

    // 4. Risk assessment
    const riskChecks = await assessRisk(strategyConfig, positions)
    console.log(`\nRisk checks: ${riskChecks.allChecksPassed ? 'ALL PASSED' : 'FAILED'}`)
    console.log(`  Daily trades: ${riskChecks.dailyTrades}/${riskChecks.dailyTradeLimit} ${riskChecks.dailyTradeLimitOk ? '✓' : '✗'}`)
    console.log(`  Daily P/L: ${riskChecks.dailyPlPercent.toFixed(2)}% (limit: ${riskChecks.dailyLossLimitPercent}%) ${riskChecks.dailyLossLimitOk ? '✓' : '✗'}`)
    console.log(`  Exposure: $${riskChecks.totalExposure.toFixed(0)} / $${riskChecks.maxExposure.toFixed(0)} ${riskChecks.exposureLimitOk ? '✓' : '✗'}`)

    if (!riskChecks.allChecksPassed) {
      console.log('\nRISK HALT — stopping execution.')
      await telegram.notifyRiskHalt(riskChecks)
      await db.logExecutionEnd(executionId, 'halted', { riskChecks, errorMessage: 'Risk checks failed' })
      return
    }

    // 5. Process each symbol
    const results: SymbolResult[] = []
    let ordersPlaced = 0

    for (const symbol of strategyConfig.symbols) {
      try {
        const result = await processSymbol(symbol, strategyConfig, positions, {
          equity: parseFloat(account.equity),
          buyingPower: parseFloat(account.buying_power),
        })
        results.push(result)

        if (result.action === 'buy' || result.action === 'sell_tp' || result.action === 'sell_sl') {
          ordersPlaced++

          // Notify sells via Telegram
          if (result.action === 'sell_tp' || result.action === 'sell_sl') {
            await telegram.notifyOrder(result, result.action)
          }
        }
      } catch (err) {
        console.error(`  ERROR processing ${symbol}:`, err)
        results.push({
          symbol, action: 'error',
          signals: {}, combinedScore: null,
          outcome: null, orderId: null, price: null, quantity: null,
          reason: err instanceof Error ? err.message : String(err),
        })
      }
    }

    // 6. Log C-2 details (batch insert)
    await db.logSymbolDetails(executionId, results)

    // 7. Log execution complete
    const ordersSkipped = results.filter(r => r.action === 'skip').length
    await db.logExecutionEnd(executionId, 'success', {
      symbolsProcessed: results.length,
      ordersPlaced,
      ordersSkipped,
      riskChecks,
    })

    // 8. Send summary
    await telegram.notifySummary(strategyConfig.name, results, ordersPlaced, config.dryRun)

    console.log('\n' + '='.repeat(60))
    console.log(`Done. Processed: ${results.length} | Orders: ${ordersPlaced} | Skipped: ${ordersSkipped}`)
    console.log('='.repeat(60))

  } catch (err) {
    console.error('FATAL ERROR:', err)
    const errorMsg = err instanceof Error ? err.message : String(err)
    await db.logExecutionEnd(executionId, 'error', { errorMessage: errorMsg })
    await telegram.notifyError(errorMsg)
    process.exit(1)
  }
}

main()
