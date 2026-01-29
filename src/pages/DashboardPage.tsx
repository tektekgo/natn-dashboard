/**
 * Dashboard overview page.
 * Shows strategy count, recent backtests, and quick actions.
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import Card from '@/components/common/Card'
import InfoPanel from '@/components/common/InfoPanel'

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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  const firstName = profile?.display_name?.split(' ')[0] || 'there'

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {firstName}
        </h1>
        <p className="text-gray-600 mt-1">Your trading strategy laboratory at a glance.</p>
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
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">{stats.strategyCount}</p>
            <p className="text-sm text-gray-500 mt-1">Strategies Created</p>
            <p className="text-xs text-gray-400 mt-2">
              A strategy defines your rules for when to buy and sell stocks.
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">{stats.backtestCount}</p>
            <p className="text-sm text-gray-500 mt-1">Backtests Run</p>
            <p className="text-xs text-gray-400 mt-2">
              Each backtest simulates your strategy on past market data.
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center py-2">
            <Link
              to="/strategies/new"
              className="inline-block btn-primary"
            >
              Create New Strategy
            </Link>
            <p className="text-xs text-gray-400 mt-3">
              Start building your next trading strategy.
            </p>
          </div>
        </Card>
      </div>

      {/* Recent backtests */}
      <Card title="Recent Backtests" subtitle="Your most recent strategy test results.">
        {stats.recentBacktests.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm mb-2">No backtests yet.</p>
            <p className="text-gray-400 text-xs">Create a strategy and run your first backtest to see results here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-500 font-medium">Strategy</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Return</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Date</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBacktests.map(bt => (
                  <tr key={bt.id} className="border-b border-gray-100">
                    <td className="py-2 font-medium text-gray-900">{bt.strategy_name}</td>
                    <td className={`py-2 text-right font-mono ${bt.total_return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {bt.total_return >= 0 ? '+' : ''}{bt.total_return.toFixed(2)}%
                    </td>
                    <td className="py-2 text-right text-gray-500">
                      {new Date(bt.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 text-right">
                      <Link
                        to={`/backtest/${bt.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
