/**
 * Bot Activity page — professional trading dashboard with charts,
 * expandable execution details, and signal visualizations.
 * C-2 upgrade: per-symbol logging visualization.
 */

import { useState, useCallback, Fragment } from 'react'
import { Activity, ShoppingCart, CheckCircle2, Clock, ChevronDown, ChevronRight, HelpCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InfoPanel } from '@/components/ui/info-panel'
import { Skeleton } from '@/components/ui/skeleton'
import { useBotExecutions } from '@/hooks/useBotExecutions'
import { useStrategies } from '@/hooks/useStrategies'
import ExecutionTrendChart from '@/components/charts/ExecutionTrendChart'
import ExecutionDetailPanel from '@/components/bot-activity/ExecutionDetailPanel'
import LearnTip from '@/components/bot-activity/LearnTip'
import { computeStats, formatDurationMs, groupByDate } from '@/lib/bot-activity-utils'
import type { BotExecutionDetail, ExecutionStatus } from '@/types/bot-activity'

// ---------------------------------------------------------------------------
// Status badge (kept from original)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Stat card with icon + gradient accent
// ---------------------------------------------------------------------------

interface StatCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  accentColor: string
  tip?: string
  tipDetail?: string
}

function StatCard({ icon, value, label, accentColor, tip, tipDetail }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: accentColor }} />
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          >
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground inline-flex items-center">
              {label}
              {tip && <LearnTip tip={tip} detail={tipDetail} />}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function BotActivityPage() {
  const { executions, loading, error, detailsLoading, loadDetails } = useBotExecutions()
  const { strategies } = useStrategies()

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandedDetails, setExpandedDetails] = useState<BotExecutionDetail[] | null>(null)

  const strategyMap = new Map(strategies.map(s => [s.id, s.name]))

  const stats = computeStats(executions)
  const trendData = groupByDate(executions)

  const handleRowClick = useCallback(async (executionId: string) => {
    if (expandedId === executionId) {
      // Collapse
      setExpandedId(null)
      setExpandedDetails(null)
      return
    }

    setExpandedId(executionId)
    setExpandedDetails(null) // Show loading skeleton
    const details = await loadDetails(executionId)
    setExpandedDetails(details)
  }, [expandedId, loadDetails])

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bot Activity</h1>
          <p className="text-muted-foreground mt-1">Loading execution logs...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-[260px] w-full" />
          </CardContent>
        </Card>
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

  // -------------------------------------------------------------------------
  // Error state
  // -------------------------------------------------------------------------

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

  // -------------------------------------------------------------------------
  // Main render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bot Activity</h1>
        <p className="text-muted-foreground mt-1">
          Execution logs from the automated trading bot
        </p>
      </div>

      <InfoPanel variant="learn" title="Understanding Bot Activity">
        <p className="mb-2">
          When a strategy is activated for paper trading, the bot runs it on a <strong>schedule</strong> (Mon-Fri, 9:45 AM ET).
          Each run evaluates every symbol using three signal types, then decides to <strong>buy</strong>, <strong>sell</strong>, or <strong>skip</strong>.
        </p>
        <p className="text-xs opacity-80">
          Hover over any <HelpCircle className="w-3 h-3 inline -mt-0.5 mx-0.5" /> icon for explanations.
          Click a table row to drill into per-symbol signals, radar charts, and risk check details.
        </p>
      </InfoPanel>

      {/* 4 Enhanced stat cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon={<Activity size={20} />}
          value={stats.totalRuns}
          label="Total Runs"
          accentColor="#3b82f6"
          tip="Each 'run' is one full execution cycle of your trading bot. The bot wakes up on its schedule, evaluates every symbol in your strategy, and decides whether to buy, sell, or skip."
          tipDetail="More runs = more data points to learn from."
        />
        <StatCard
          icon={<ShoppingCart size={20} />}
          value={stats.totalOrders}
          label="Orders Placed"
          accentColor="#8b5cf6"
          tip="The number of actual buy/sell orders sent to Alpaca. Not every symbol evaluation results in an order — the bot may 'skip' if signals are weak or risk limits are reached."
          tipDetail="A low order count is normal — it means the bot is being selective."
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          value={`${stats.successRate}%`}
          label="Success Rate"
          accentColor="#10b981"
          tip="Percentage of runs that completed without errors or risk halts. A 'success' run means the bot finished evaluating all symbols — it does NOT mean the trades were profitable."
          tipDetail="100% success rate = reliable bot. Profitability is tracked separately."
        />
        <StatCard
          icon={<Clock size={20} />}
          value={formatDurationMs(stats.avgDurationMs)}
          label="Avg Duration"
          accentColor="#f59e0b"
          tip="How long a typical bot run takes from start to finish. This includes fetching market data, computing signals, running risk checks, and placing orders."
          tipDetail="Longer durations may indicate API slowness or many symbols to process."
        />
      </div>

      {/* Execution trend chart */}
      {trendData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg inline-flex items-center">
              Execution Trend
              <LearnTip
                tip="This chart shows how many bot runs happened each day, colored by outcome. Green = success, red = error, amber = halted by risk checks. The dashed purple line tracks orders placed per day."
                detail="Look for patterns: consistent green means a reliable bot. Sudden red/amber spikes may indicate market volatility or configuration issues."
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutionTrendChart data={trendData} />
          </CardContent>
        </Card>
      )}

      {/* Execution table with accordion */}
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
            <CardTitle className="text-lg inline-flex items-center">
              Execution History
              <LearnTip
                tip="Each row is one bot run. Click any row to expand and see the per-symbol breakdown: what signals were generated, what action the bot took, and why."
                detail="The chevron arrow on the left indicates clickable rows."
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 pr-2 font-medium text-muted-foreground w-6" />
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">Date / Time</th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">Strategy</th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground text-right">Symbols</th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground text-right">Orders</th>
                    <th className="pb-3 font-medium text-muted-foreground text-right">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {executions.map(exec => {
                    const isExpanded = expandedId === exec.id
                    return (
                      <Fragment key={exec.id}>
                        <tr
                          className={`border-b border-border/50 cursor-pointer transition-colors ${
                            isExpanded ? 'bg-muted/40' : 'hover:bg-muted/30'
                          }`}
                          onClick={() => handleRowClick(exec.id)}
                        >
                          <td className="py-3 pr-2 text-muted-foreground">
                            {isExpanded
                              ? <ChevronDown size={14} />
                              : <ChevronRight size={14} />
                            }
                          </td>
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
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="p-0">
                              <ExecutionDetailPanel
                                execution={exec}
                                details={expandedDetails}
                                loading={detailsLoading && expandedDetails === null}
                              />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
