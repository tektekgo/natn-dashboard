/**
 * Hook for fetching bot execution logs (INT-3).
 * Includes detail caching for accordion expansion (C-2 upgrade).
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '@/lib/supabase'
import type { BotExecution, BotExecutionDetail } from '@/types/bot-activity'

export function useBotExecutions(strategyId?: string) {
  const { user, isOwner } = useAuth()
  const [executions, setExecutions] = useState<BotExecution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  // Cache details by execution ID — persists across accordion toggles
  const detailsCache = useRef(new Map<string, BotExecutionDetail[]>())

  const loadExecutions = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    let query = supabase
      .from('bot_executions')
      .select('*')
      .order('executed_at', { ascending: false })

    // Owner sees all; regular users see only their own
    if (!isOwner) {
      query = query.eq('user_id', user.id)
    }

    if (strategyId) {
      query = query.eq('strategy_id', strategyId)
    }

    const { data, error: err } = await query.limit(100)

    if (err) {
      setError(err.message)
    } else {
      setExecutions((data || []) as unknown as BotExecution[])
    }
    setLoading(false)
  }, [user, isOwner, strategyId])

  useEffect(() => {
    loadExecutions()
  }, [loadExecutions])

  const loadDetails = useCallback(async (executionId: string): Promise<BotExecutionDetail[]> => {
    // Return cached if available
    const cached = detailsCache.current.get(executionId)
    if (cached) return cached

    setDetailsLoading(true)
    const { data, error: err } = await supabase
      .from('bot_execution_details')
      .select('*')
      .eq('execution_id', executionId)
      .order('created_at', { ascending: true })

    setDetailsLoading(false)

    if (err) {
      setError(err.message)
      return []
    }

    const details = (data || []) as unknown as BotExecutionDetail[]
    detailsCache.current.set(executionId, details)
    return details
  }, [])

  return {
    executions,
    loading,
    error,
    detailsLoading,
    loadDetails,
    refresh: loadExecutions,
  }
}
