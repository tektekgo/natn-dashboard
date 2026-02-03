/**
 * Price chart using TradingView Lightweight Charts.
 * Shows candlestick data with optional trade markers and theme support.
 */

import { useEffect, useRef } from 'react'
import { createChart, type IChartApi, ColorType, CandlestickSeries, createSeriesMarkers } from 'lightweight-charts'
import { useTheme } from '@/contexts/ThemeContext'
import type { OHLCV, ClosedTrade } from '@/engine/types'

interface PriceChartProps {
  data: OHLCV[]
  trades?: ClosedTrade[]
  height?: number
  symbol?: string
}

export default function PriceChart({ data, trades = [], height = 400, symbol }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return

    const isDark = resolvedTheme === 'dark'

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: isDark ? 'hsl(222.2, 84%, 4.9%)' : 'white' },
        textColor: isDark ? 'hsl(215, 20.2%, 65.1%)' : '#374151',
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      grid: {
        vertLines: { color: isDark ? 'hsl(217, 32.6%, 17.5%)' : '#f3f4f6' },
        horzLines: { color: isDark ? 'hsl(217, 32.6%, 17.5%)' : '#f3f4f6' },
      },
      rightPriceScale: {
        borderColor: isDark ? 'hsl(217, 32.6%, 17.5%)' : '#e5e7eb',
      },
      timeScale: {
        borderColor: isDark ? 'hsl(217, 32.6%, 17.5%)' : '#e5e7eb',
      },
    })

    chartRef.current = chart

    // Add candlestick series (lightweight-charts v5 API)
    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#10b981',
      wickDownColor: '#ef4444',
      wickUpColor: '#10b981',
    })

    const chartData = data.map(bar => ({
      time: bar.date,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    series.setData(chartData as any)

    // Add trade markers
    if (trades.length > 0) {
      const markers = trades.flatMap(trade => {
        const result = []
        result.push({
          time: trade.entryDate,
          position: 'belowBar' as const,
          color: '#10b981',
          shape: 'arrowUp' as const,
          text: `Buy ${symbol || trade.symbol}`,
        })
        result.push({
          time: trade.exitDate,
          position: 'aboveBar' as const,
          color: trade.pnl >= 0 ? '#10b981' : '#ef4444',
          shape: 'arrowDown' as const,
          text: `Sell ${trade.pnlPercent >= 0 ? '+' : ''}${trade.pnlPercent.toFixed(1)}%`,
        })
        return result
      })

      markers.sort((a, b) => a.time.localeCompare(b.time))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createSeriesMarkers(series, markers as any)
    }

    chart.timeScale().fitContent()

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [data, trades, height, symbol, resolvedTheme])

  return <div ref={containerRef} className="w-full" />
}
