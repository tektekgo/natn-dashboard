/**
 * Hook for consuming AI chat context.
 */

import { useContext } from 'react'
import { AiChatContext, type AiChatContextValue } from '@/contexts/AiChatContext'

export function useAiChatContext(): AiChatContextValue {
  const context = useContext(AiChatContext)
  if (!context) {
    throw new Error('useAiChatContext must be used within an AiChatProvider')
  }
  return context
}
