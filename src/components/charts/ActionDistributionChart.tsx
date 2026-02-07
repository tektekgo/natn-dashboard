/**
 * Donut chart showing buy/sell_tp/sell_sl/skip/error distribution
 * for a single execution's symbol details.
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useTheme } from '@/contexts/ThemeContext'
import type { ActionDistribution } from '@/types/bot-activity'
import { ACTION_LABELS } from '@/lib/bot-activity-utils'

interface ActionDistributionChartProps {
  data: ActionDistribution[]
  size?: number
}

export default function ActionDistributionChart({ data, size = 160 }: ActionDistributionChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const total = data.reduce((sum, d) => sum + d.count, 0)

  if (total === 0) {
    return <div className="text-muted-foreground text-center text-xs py-4">No data</div>
  }

  const tooltipBg = isDark ? 'hsl(222.2 84% 4.9%)' : 'white'
  const tooltipBorder = isDark ? 'hsl(217 32.6% 17.5%)' : '#e5e7eb'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.3}
            outerRadius={size * 0.45}
            paddingAngle={2}
            dataKey="count"
            nameKey="action"
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.action} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={((value: number, name: string) => [
              value,
              ACTION_LABELS[name as keyof typeof ACTION_LABELS] || name,
            ]) as any}
            contentStyle={{
              borderRadius: '8px',
              border: `1px solid ${tooltipBorder}`,
              backgroundColor: tooltipBg,
              fontSize: '12px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center total */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{total}</p>
          <p className="text-[10px] text-muted-foreground">symbols</p>
        </div>
      </div>
    </div>
  )
}
