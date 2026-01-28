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
import type { FullStrategyConfig } from '@/types/strategy-config'

interface StrategyRow {
  id: string
  name: string
  description: string | null
  config: FullStrategyConfig
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function StrategiesPage() {
  const { user } = useAuth()
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

      {strategies.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't created any strategies yet.</p>
            <Link to="/strategies/new">
              <Button>Create Your First Strategy</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map(strategy => (
            <Card key={strategy.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{strategy.name}</h3>
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
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Updated {new Date(strategy.updated_at).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
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
