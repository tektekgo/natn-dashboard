/**
 * Dashboard overview page.
 * Shows strategy count, recent backtests, and quick actions.
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InfoPanel } from '@/components/ui/info-panel'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

interface DashboardStats {
  strategyCount: number
  backtestCount: number
  recentBacktests: {
    id: string
    strategy_name: string
    total_return: number
    created_at: string
  }[]
}

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    strategyCount: 0,
    backtestCount: 0,
    recentBacktests: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    async function loadStats() {
      const [strategiesRes, backtestsRes, recentRes] = await Promise.all([
        supabase.from('strategies').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
        supabase.from('backtest_results').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
        supabase
          .from('backtest_results')
          .select('id, strategy_config, metrics, created_at')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      const recentBacktests = (recentRes.data || []).map(r => ({
        id: r.id,
        strategy_name: (r.strategy_config as Record<string, unknown>)?.name as string || 'Unnamed',
        total_return: (r.metrics as Record<string, unknown>)?.totalReturn as number || 0,
        created_at: r.created_at,
      }))

      setStats({
        strategyCount: strategiesRes.count || 0,
        backtestCount: backtestsRes.count || 0,
        recentBacktests,
      })
      setLoading(false)
    }

    loadStats()
  }, [user])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  const firstName = profile?.display_name?.split(' ')[0] || 'there'

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground mt-1">Your trading strategy laboratory at a glance.</p>
      </div>

      {/* Getting started guide */}
      <InfoPanel variant="info" title="How NATN Lab Works">
        <p className="mb-2">
          NATN Lab is your educational trading laboratory. Here's the learning workflow:
        </p>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li><strong>Create a Strategy</strong> — choose stocks, set technical &amp; fundamental rules, and configure risk limits.</li>
          <li><strong>Backtest It</strong> — run your strategy against historical market data to see how it would have performed.</li>
          <li><strong>Compare &amp; Learn</strong> — compare different strategies side-by-side to understand what works and why.</li>
          <li><strong>Iterate</strong> — adjust your parameters, re-test, and build intuition for how markets work.</li>
        </ol>
        <p className="mt-2 text-xs opacity-75">
          All trading is simulated (paper trading). No real money is at risk. Trades execute on the Alpaca paper trading platform.
        </p>
      </InfoPanel>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{stats.strategyCount}</p>
              <p className="text-sm text-muted-foreground mt-1">Strategies Created</p>
              <p className="text-xs text-muted-foreground/70 mt-2">
                A strategy defines your rules for when to buy and sell stocks.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{stats.backtestCount}</p>
              <p className="text-sm text-muted-foreground mt-1">Backtests Run</p>
              <p className="text-xs text-muted-foreground/70 mt-2">
                Each backtest simulates your strategy on past market data.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-2">
              <Button asChild>
                <Link to="/strategies/new">
                  Create New Strategy
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground/70 mt-3">
                Start building your next trading strategy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent backtests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Backtests</CardTitle>
          <CardDescription>Your most recent strategy test results.</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentBacktests.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground text-sm mb-2">No backtests yet.</p>
              <p className="text-muted-foreground/70 text-xs">Create a strategy and run your first backtest to see results here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Strategy</TableHead>
                  <TableHead className="text-right">Return</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentBacktests.map(bt => (
                  <TableRow key={bt.id}>
                    <TableCell className="font-medium">{bt.strategy_name}</TableCell>
                    <TableCell className={`text-right font-mono ${bt.total_return >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {bt.total_return >= 0 ? '+' : ''}{bt.total_return.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(bt.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        to={`/backtest/${bt.id}`}
                        className="text-primary hover:text-primary/80 font-medium"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
