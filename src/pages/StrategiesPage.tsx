/**
 * Strategies list page.
 * Shows user's strategies with create/edit/delete actions.
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import InfoPanel from '@/components/common/InfoPanel'
import type { FullStrategyConfig } from '@/types/strategy-config'

interface StrategyRow {
  id: string
  name: string
  description: string | null
  config: FullStrategyConfig
  is_active: boolean
  trading_mode: 'none' | 'paper' | 'live'
  activated_at: string | null
  last_execution_at: string | null
  execution_status: string | null
  created_at: string
  updated_at: string
}

export default function StrategiesPage() {
  const { user, isOwner } = useAuth()
  const [strategies, setStrategies] = useState<StrategyRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadStrategies()
  }, [user])

  async function loadStrategies() {
    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('user_id', user!.id)
      .order('updated_at', { ascending: false })

    if (!error && data) {
      setStrategies(data as unknown as StrategyRow[])
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this strategy? This cannot be undone.')) return

    await supabase.from('strategies').delete().eq('id', id)
    setStrategies(s => s.filter(st => st.id !== id))
  }

  async function handleToggleTrading(id: string, currentMode: string) {
    if (currentMode !== 'none') {
      // Deactivate
      await supabase
        .from('strategies')
        .update({ trading_mode: 'none', activated_at: null })
        .eq('id', id)
    } else {
      // Activate: first deactivate all others, then activate this one
      await supabase
        .from('strategies')
        .update({ trading_mode: 'none', activated_at: null })
        .eq('user_id', user!.id)
        .neq('trading_mode', 'none')

      await supabase
        .from('strategies')
        .update({ trading_mode: 'paper', activated_at: new Date().toISOString() })
        .eq('id', id)
    }
    await loadStrategies()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Strategies</h1>
          <p className="text-gray-600 mt-1">Create and manage your trading strategies.</p>
        </div>
        <Link to="/strategies/new">
          <Button>Create Strategy</Button>
        </Link>
      </div>

      {/* Educational panel */}
      <InfoPanel variant="learn" title="What is a Trading Strategy?">
        <p>
          A <strong>trading strategy</strong> is a set of rules that determine when to buy and sell stocks.
          In NATN Lab, you define a strategy by choosing which stocks to trade, setting technical indicators
          (like RSI and SMA), fundamental filters (like P/E ratio), and risk controls (like stop-loss limits).
        </p>
        <p className="mt-2">
          Once saved, you can <strong>backtest</strong> your strategy against historical market data to see
          how it would have performed. Trades are executed on the <strong>Alpaca paper trading platform</strong> —
          no real money is involved.
        </p>
      </InfoPanel>

      {strategies.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">You haven't created any strategies yet.</p>
            <p className="text-gray-400 text-xs mb-4">
              Start by creating your first strategy. Choose stocks, configure your rules, and test your ideas.
            </p>
            <Link to="/strategies/new">
              <Button>Create Your First Strategy</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map(strategy => (
            <Card key={strategy.id} className={`hover:shadow-card-hover transition-all duration-200 ${strategy.trading_mode !== 'none' ? 'ring-2 ring-green-400 ring-opacity-50' : ''}`}>
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{strategy.name}</h3>
                    {strategy.trading_mode === 'paper' && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                        Paper Trading
                      </span>
                    )}
                    {strategy.trading_mode === 'live' && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-semibold">
                        Live Trading
                      </span>
                    )}
                  </div>
                  {strategy.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{strategy.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {strategy.config.symbols?.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                  {strategy.trading_mode !== 'none' && strategy.last_execution_at && (
                    <p className="text-xs text-gray-400 mt-2">
                      Last executed: {new Date(strategy.last_execution_at).toLocaleString()}
                      {strategy.execution_status && (
                        <span className={`ml-1 ${strategy.execution_status === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                          ({strategy.execution_status})
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Updated {new Date(strategy.updated_at).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    {isOwner && (
                      <button
                        onClick={() => handleToggleTrading(strategy.id, strategy.trading_mode)}
                        className={`text-sm font-medium ${
                          strategy.trading_mode !== 'none'
                            ? 'text-orange-600 hover:text-orange-700'
                            : 'text-green-600 hover:text-green-700'
                        }`}
                      >
                        {strategy.trading_mode !== 'none' ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                    <Link
                      to={`/strategies/${strategy.id}`}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(strategy.id)}
                      className="text-sm text-red-500 hover:text-red-600 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
