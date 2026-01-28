/**
 * Hook for CRUD operations on strategies.
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '@/lib/supabase'
import type { FullStrategyConfig } from '@/types/strategy-config'

interface StrategyRow {
  id: string
  user_id: string
  name: string
  description: string | null
  config: FullStrategyConfig
  is_active: boolean
  created_at: string
  updated_at: string
}

export function useStrategies() {
  const { user } = useAuth()
  const [strategies, setStrategies] = useState<StrategyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStrategies = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('strategies')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      setStrategies((data || []) as unknown as StrategyRow[])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    loadStrategies()
  }, [loadStrategies])

  async function createStrategy(name: string, config: FullStrategyConfig): Promise<string | null> {
    if (!user) return null

    const { data, error: err } = await supabase
      .from('strategies')
      .insert({
        user_id: user.id,
        name,
        description: config.description || null,
        config: config as unknown as import('@/types/database').Json,
      })
      .select('id')
      .single()

    if (err) {
      setError(err.message)
      return null
    }

    await loadStrategies()
    return data?.id || null
  }

  async function updateStrategy(id: string, name: string, config: FullStrategyConfig): Promise<boolean> {
    const { error: err } = await supabase
      .from('strategies')
      .update({
        name,
        description: config.description || null,
        config: config as unknown as import('@/types/database').Json,
      })
      .eq('id', id)

    if (err) {
      setError(err.message)
      return false
    }

    await loadStrategies()
    return true
  }

  async function deleteStrategy(id: string): Promise<boolean> {
    const { error: err } = await supabase
      .from('strategies')
      .delete()
      .eq('id', id)

    if (err) {
      setError(err.message)
      return false
    }

    setStrategies(s => s.filter(st => st.id !== id))
    return true
  }

  return {
    strategies,
    loading,
    error,
    createStrategy,
    updateStrategy,
    deleteStrategy,
    refresh: loadStrategies,
  }
}
