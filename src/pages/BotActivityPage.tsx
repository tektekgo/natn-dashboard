/**
 * Bot Activity page — shows execution logs from the n8n trading bot.
 * Phase INT-3: execution-level logging.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InfoPanel } from '@/components/ui/info-panel'
import { Skeleton } from '@/components/ui/skeleton'
import { useBotExecutions } from '@/hooks/useBotExecutions'
import { useStrategies } from '@/hooks/useStrategies'
import type { ExecutionStatus } from '@/types/bot-activity'

const statusConfig: Record<ExecutionStatus, { label: string; className: string }> = {
  running: { label: 'Running', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  success: { label: 'Success', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  error: { label: 'Error', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  halted: { label: 'Halted', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
}

function StatusBadge({ status }: { status: ExecutionStatus }) {
  const config = statusConfig[status] || statusConfig.error
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.className}`}>
      {status === 'running' && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5 animate-pulse" />
      )}
      {config.label}
    </span>
  )
}

function formatDuration(start: string, end: string | null): string {
  if (!end) return '...'
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (ms < 1000) return '<1s'
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return `${minutes}m ${remaining}s`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function BotActivityPage() {
  const { executions, loading, error } = useBotExecutions()
  const { strategies } = useStrategies()

  const strategyMap = new Map(strategies.map(s => [s.id, s.name]))

  // Summary stats
  const totalRuns = executions.length
  const totalOrders = executions.reduce((sum, e) => sum + e.orders_placed, 0)
  const successCount = executions.filter(e => e.status === 'success').length
  const successRate = totalRuns > 0 ? Math.round((successCount / totalRuns) * 100) : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bot Activity</h1>
          <p className="text-muted-foreground mt-1">Loading execution logs...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6 space-y-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bot Activity</h1>
        </div>
        <InfoPanel variant="tip" title="Error Loading Data">
          <p>{error}</p>
        </InfoPanel>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bot Activity</h1>
        <p className="text-muted-foreground mt-1">
          Execution logs from the automated trading bot
        </p>
      </div>

      <InfoPanel variant="info" title="What is Bot Activity?">
        <p>
          When a strategy is activated for paper trading, the n8n trading bot runs it on a schedule.
          Each run appears here showing status, timing, and order counts. Use this to monitor
          whether your strategies are executing correctly.
        </p>
      </InfoPanel>

      {/* Summary stat cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-foreground">{totalRuns}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Runs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-foreground">{totalOrders}</p>
            <p className="text-sm text-muted-foreground mt-1">Orders Placed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-foreground">{successRate}%</p>
            <p className="text-sm text-muted-foreground mt-1">Success Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Execution table */}
      {executions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <svg className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-muted-foreground font-medium">No bot executions yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Activate a strategy for paper trading to see activity here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Execution History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">Date / Time</th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">Strategy</th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground text-right">Symbols</th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground text-right">Orders</th>
                    <th className="pb-3 font-medium text-muted-foreground text-right">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {executions.map(exec => (
                    <tr key={exec.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 pr-4 text-foreground whitespace-nowrap">
                        {formatDate(exec.executed_at)}
                      </td>
                      <td className="py-3 pr-4 text-foreground">
                        {strategyMap.get(exec.strategy_id) || 'Unknown Strategy'}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={exec.status as ExecutionStatus} />
                      </td>
                      <td className="py-3 pr-4 text-right text-foreground">
                        {exec.symbols_processed}
                      </td>
                      <td className="py-3 pr-4 text-right text-foreground">
                        {exec.orders_placed}
                      </td>
                      <td className="py-3 text-right text-muted-foreground whitespace-nowrap">
                        {formatDuration(exec.executed_at, exec.completed_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
