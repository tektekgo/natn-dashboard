/**
 * Strategies list page.
 * Shows user's strategies with create/edit/delete actions.
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InfoPanel } from '@/components/ui/info-panel'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Strategies</h1>
          <p className="text-muted-foreground mt-1">Create and manage your trading strategies.</p>
        </div>
        <Button asChild>
          <Link to="/strategies/new">Create Strategy</Link>
        </Button>
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
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">You haven't created any strategies yet.</p>
              <p className="text-muted-foreground/70 text-xs mb-4">
                Start by creating your first strategy. Choose stocks, configure your rules, and test your ideas.
              </p>
              <Button asChild>
                <Link to="/strategies/new">Create Your First Strategy</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map(strategy => (
            <Card
              key={strategy.id}
              className={`hover:shadow-card-hover transition-all duration-200 ${strategy.trading_mode !== 'none' ? 'ring-2 ring-success/50' : ''}`}
            >
              <CardContent className="pt-6">
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{strategy.name}</h3>
                      {strategy.trading_mode === 'paper' && (
                        <Badge variant="success">Paper Trading</Badge>
                      )}
                      {strategy.trading_mode === 'live' && (
                        <Badge variant="destructive">Live Trading</Badge>
                      )}
                    </div>
                    {strategy.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{strategy.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {strategy.config.symbols?.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                    {strategy.trading_mode !== 'none' && strategy.last_execution_at && (
                      <p className="text-xs text-muted-foreground/70 mt-2">
                        Last executed: {new Date(strategy.last_execution_at).toLocaleString()}
                        {strategy.execution_status && (
                          <span className={`ml-1 ${strategy.execution_status === 'success' ? 'text-success' : 'text-destructive'}`}>
                            ({strategy.execution_status})
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground/70">
                      Updated {new Date(strategy.updated_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      {isOwner && (
                        <button
                          onClick={() => handleToggleTrading(strategy.id, strategy.trading_mode)}
                          className={`text-sm font-medium ${
                            strategy.trading_mode !== 'none'
                              ? 'text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300'
                              : 'text-success hover:text-success/80'
                          }`}
                        >
                          {strategy.trading_mode !== 'none' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                      <Link
                        to={`/strategies/${strategy.id}`}
                        className="text-sm text-primary hover:text-primary/80 font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(strategy.id)}
                        className="text-sm text-destructive hover:text-destructive/80 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
