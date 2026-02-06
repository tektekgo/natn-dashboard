/**
 * AI Chat context provider.
 * Wraps useAiChat hook and adds drawer open/close state.
 */

import { createContext, useState, useCallback, type ReactNode } from 'react'
import { useAiChat } from '@/hooks/useAiChat'
import type { AiContext } from '@/types/ai'

export interface AiChatContextValue extends ReturnType<typeof useAiChat> {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  openWithContext: (ctx: AiContext) => void
}

export const AiChatContext = createContext<AiChatContextValue | undefined>(undefined)

interface AiChatProviderProps {
  children: ReactNode
}

export function AiChatProvider({ children }: AiChatProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const aiChat = useAiChat()

  const openWithContext = useCallback(
    (ctx: AiContext) => {
      aiChat.newConversation()
      aiChat.setContext(ctx)
      setIsOpen(true)
    },
    [aiChat]
  )

  return (
    <AiChatContext.Provider
      value={{
        ...aiChat,
        isOpen,
        setIsOpen,
        openWithContext,
      }}
    >
      {children}
    </AiChatContext.Provider>
  )
}
