/**
 * Backtest runner - top-level orchestrator.
 *
 * Flow:
 * 1. Fetch historical price data for all symbols (async, shows progress)
 * 2. Fetch fundamental data for all symbols (async, shows progress)
 * 3. Run trade simulation (synchronous)
 * 4. Calculate metrics
 * 5. Build equity curve
 * 6. Analyze signal attribution
 * 7. Return BacktestOutput
 */

import type { BacktestOutput, ProgressCallback, ComparisonResult } from './types'
import type { FullStrategyConfig } from '../types/strategy-config'
import { HistoricalDataService } from '../data/historical-data-service'
import { FundamentalDataService } from '../data/fundamental-data-service'
import { runSimulation } from './simulator/trade-simulator'
import { calculateMetrics } from './metrics/calculator'
import { analyzeAttribution } from './metrics/attribution'
import { subMonths, format } from 'date-fns'

export interface BacktestRunOptions {
  config: FullStrategyConfig
  startDate: string
  endDate: string
  onProgress?: ProgressCallback
}

/**
 * Run a full backtest with the given configuration.
 */
export async function runBacktest(options: BacktestRunOptions): Promise<BacktestOutput> {
  const { config, startDate, endDate, onProgress } = options
  const historicalService = new HistoricalDataService()
  const fundamentalService = new FundamentalDataService()

  // We need extra historical data before startDate for indicator warmup (SMA200 needs 200+ days)
  const warmupDate = format(subMonths(new Date(startDate), 14), 'yyyy-MM-dd')

  // Phase 1: Fetch price data
  onProgress?.({
    phase: 'fetching_prices',
    current: 0,
    total: config.symbols.length,
    message: `Fetching price data for ${config.symbols.length} symbols...`,
  })

  const priceData = await historicalService.getMultiBars(
    config.symbols,
    warmupDate,
    endDate
  )

  onProgress?.({
    phase: 'fetching_prices',
    current: config.symbols.length,
    total: config.symbols.length,
    message: 'Price data fetched.',
  })

  // Phase 2: Fetch fundamental data
  onProgress?.({
    phase: 'fetching_fundamentals',
    current: 0,
    total: config.symbols.length,
    message: `Fetching fundamental data for ${config.symbols.length} symbols...`,
  })

  const fundamentalData = await fundamentalService.getMultiFundamentals(config.symbols)

  onProgress?.({
    phase: 'fetching_fundamentals',
    current: config.symbols.length,
    total: config.symbols.length,
    message: 'Fundamental data fetched.',
  })

  // Phase 3: Run simulation
  onProgress?.({
    phase: 'simulating',
    current: 0,
    total: 1,
    message: 'Running simulation...',
  })

  const simulationResult = runSimulation({
    config,
    priceData,
    fundamentalData,
    startDate,
    endDate,
  })

  onProgress?.({
    phase: 'simulating',
    current: 1,
    total: 1,
    message: 'Simulation complete.',
  })

  // Phase 4: Calculate metrics
  onProgress?.({
    phase: 'calculating_metrics',
    current: 0,
    total: 1,
    message: 'Calculating metrics...',
  })

  const metrics = calculateMetrics(
    simulationResult.trades,
    simulationResult.equityCurve,
    config.initialCapital
  )

  // Phase 5: Signal attribution
  const attribution = analyzeAttribution(simulationResult.trades)

  onProgress?.({
    phase: 'complete',
    current: 1,
    total: 1,
    message: 'Backtest complete!',
  })

  return {
    config,
    startDate,
    endDate,
    metrics,
    trades: simulationResult.trades,
    equityCurve: simulationResult.equityCurve,
    attribution,
    runTimestamp: new Date().toISOString(),
  }
}

/**
 * Run multiple backtests for comparison (Phase 4B).
 * Automatically includes a "Buy and Hold" benchmark.
 */
export async function runComparison(
  configs: { label: string; config: FullStrategyConfig }[],
  startDate: string,
  endDate: string,
  onProgress?: ProgressCallback
): Promise<ComparisonResult[]> {
  const results: ComparisonResult[] = []

  for (let i = 0; i < configs.length; i++) {
    const { label, config } = configs[i]

    onProgress?.({
      phase: 'simulating',
      current: i,
      total: configs.length + 1, // +1 for benchmark
      message: `Running backtest: ${label}...`,
    })

    const output = await runBacktest({
      config,
      startDate,
      endDate,
    })

    results.push({ label, output })
  }

  // Add Buy and Hold benchmark using the first config's symbols and capital
  if (configs.length > 0) {
    onProgress?.({
      phase: 'simulating',
      current: configs.length,
      total: configs.length + 1,
      message: 'Running Buy and Hold benchmark...',
    })

    const benchmarkOutput = await runBuyAndHoldBenchmark(
      configs[0].config.symbols,
      configs[0].config.initialCapital,
      startDate,
      endDate
    )

    results.push({ label: 'Buy & Hold', output: benchmarkOutput })
  }

  onProgress?.({
    phase: 'complete',
    current: configs.length + 1,
    total: configs.length + 1,
    message: 'Comparison complete!',
  })

  return results
}

/**
 * Generate a Buy and Hold benchmark for comparison.
 * Buys equal weight of all symbols on day 1, sells all on last day.
 */
async function runBuyAndHoldBenchmark(
  symbols: string[],
  initialCapital: number,
  startDate: string,
  endDate: string
): Promise<BacktestOutput> {
  const { DEFAULT_STRATEGY_CONFIG } = await import('../types/strategy-config')

  const benchmarkConfig: FullStrategyConfig = {
    ...DEFAULT_STRATEGY_CONFIG,
    name: 'Buy & Hold Benchmark',
    description: 'Equal-weight buy and hold of all symbols',
    symbols,
    initialCapital,
    risk: {
      ...DEFAULT_STRATEGY_CONFIG.risk,
      takeProfitPercent: 999, // Never trigger
      stopLossPercent: 999,  // Never trigger
      maxPositionSizePercent: 100 / symbols.length,
      maxOpenPositions: symbols.length,
    },
    // Set thresholds so everything triggers a buy
    technical: {
      ...DEFAULT_STRATEGY_CONFIG.technical,
      rsiOversold: 100,  // Always oversold -> always buy
      rsiOverbought: 101,
    },
  }

  return runBacktest({
    config: benchmarkConfig,
    startDate,
    endDate,
  })
}
