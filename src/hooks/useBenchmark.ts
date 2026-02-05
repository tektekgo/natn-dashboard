/**
 * Hook to fetch S&P 500 (SPY) benchmark data for comparison.
 * Non-blocking: page renders immediately, benchmark fades in when ready.
 */

import { useEffect, useState } from 'react'
import { HistoricalDataService } from '@/data/historical-data-service'

export interface BenchmarkEquityPoint {
  date: string
  equity: number
}

interface UseBenchmarkResult {
  spyReturn: number | null
  spyEquityCurve: BenchmarkEquityPoint[]
  loading: boolean
  error: string | null
}

export function useBenchmark(
  startDate: string | undefined,
  endDate: string | undefined,
  initialCapital: number | undefined
): UseBenchmarkResult {
  const [spyReturn, setSpyReturn] = useState<number | null>(null)
  const [spyEquityCurve, setSpyEquityCurve] = useState<BenchmarkEquityPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!startDate || !endDate || !initialCapital) return

    let cancelled = false
    setLoading(true)
    setError(null)

    async function fetchBenchmark() {
      try {
        const service = new HistoricalDataService()
        const bars = await service.getBars('SPY', startDate!, endDate!, '1Day')

        if (cancelled) return

        if (bars.length === 0) {
          setError('No SPY data available for this period')
          setLoading(false)
          return
        }

        const firstClose = bars[0].close
        const lastClose = bars[bars.length - 1].close
        const returnPct = ((lastClose - firstClose) / firstClose) * 100

        // Build normalized equity curve: (close / firstClose) * initialCapital
        const curve: BenchmarkEquityPoint[] = bars.map(bar => ({
          date: bar.date,
          equity: Number(((bar.close / firstClose) * initialCapital!).toFixed(2)),
        }))

        if (cancelled) return

        setSpyReturn(Number(returnPct.toFixed(2)))
        setSpyEquityCurve(curve)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch benchmark data')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchBenchmark()

    return () => {
      cancelled = true
    }
  }, [startDate, endDate, initialCapital])

  return { spyReturn, spyEquityCurve, loading, error }
}
