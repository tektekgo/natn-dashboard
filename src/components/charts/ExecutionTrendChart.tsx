/**
 * Stacked area chart showing bot execution runs per day by status,
 * with a dashed line overlay for orders placed.
 */

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useTheme } from '@/contexts/ThemeContext'
import type { TrendDataPoint } from '@/types/bot-activity'

interface ExecutionTrendChartProps {
  data: TrendDataPoint[]
  height?: number
}

const STATUS_COLORS = {
  success: '#10b981',
  error: '#ef4444',
  halted: '#f59e0b',
  running: '#3b82f6',
}

const ORDERS_COLOR = '#8b5cf6'

export default function ExecutionTrendChart({ data, height = 260 }: ExecutionTrendChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  if (data.length === 0) {
    return <div className="text-muted-foreground text-center py-8 text-sm">No trend data available</div>
  }

  const gridColor = isDark ? 'hsl(217 32.6% 17.5%)' : '#f3f4f6'
  const tickColor = isDark ? 'hsl(215 20.2% 65.1%)' : '#9ca3af'
  const tooltipBg = isDark ? 'hsl(222.2 84% 4.9%)' : 'white'
  const tooltipBorder = isDark ? 'hsl(217 32.6% 17.5%)' : '#e5e7eb'

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id="trendSuccessGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={STATUS_COLORS.success} stopOpacity={0.4} />
            <stop offset="95%" stopColor={STATUS_COLORS.success} stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="trendErrorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={STATUS_COLORS.error} stopOpacity={0.4} />
            <stop offset="95%" stopColor={STATUS_COLORS.error} stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="trendHaltedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={STATUS_COLORS.halted} stopOpacity={0.4} />
            <stop offset="95%" stopColor={STATUS_COLORS.halted} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: tickColor }}
          tickFormatter={(d: string) => d.substring(5)}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: tickColor }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '8px',
            border: `1px solid ${tooltipBorder}`,
            backgroundColor: tooltipBg,
            fontSize: '12px',
          }}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Area
          type="monotone"
          dataKey="success"
          stackId="status"
          stroke={STATUS_COLORS.success}
          fill="url(#trendSuccessGrad)"
          name="Success"
        />
        <Area
          type="monotone"
          dataKey="error"
          stackId="status"
          stroke={STATUS_COLORS.error}
          fill="url(#trendErrorGrad)"
          name="Error"
        />
        <Area
          type="monotone"
          dataKey="halted"
          stackId="status"
          stroke={STATUS_COLORS.halted}
          fill="url(#trendHaltedGrad)"
          name="Halted"
        />
        <Line
          type="monotone"
          dataKey="orders"
          stroke={ORDERS_COLOR}
          strokeWidth={2}
          strokeDasharray="6 3"
          dot={false}
          name="Orders"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
