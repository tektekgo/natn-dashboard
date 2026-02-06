/**
 * AI Chat state management hook.
 * Handles messages, context, model selection, and conversation persistence.
 */

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Json } from '@/types/database'
import type {
  AiMessage,
  AiContext,
  ChatEdgeFunctionRequest,
  ChatEdgeFunctionResponse,
} from '@/types/ai'
import { DEFAULT_FREE_MODEL, AI_MODELS } from '@/types/ai'

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export interface ConversationSummary {
  id: string
  title: string | null
  updated_at: string
}

export function useAiChat() {
  const { user, profile, isOwner } = useAuth()

  const [messages, setMessages] = useState<AiMessage[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [context, setContext] = useState<AiContext>({})
  const [selectedModel, setSelectedModel] = useState(DEFAULT_FREE_MODEL)

  // Load model preference from profile on mount
  useEffect(() => {
    if (profile?.api_keys && typeof profile.api_keys === 'object') {
      const apiKeys = profile.api_keys as Record<string, unknown>
      const savedModel = apiKeys.ai_model_preference as string | undefined
      if (savedModel && AI_MODELS.some(m => m.id === savedModel)) {
        // Non-owner can only use free models
        const model = AI_MODELS.find(m => m.id === savedModel)
        if (isOwner || model?.isFree) {
          setSelectedModel(savedModel)
        }
      }
    }
  }, [profile, isOwner])

  // Save model preference when changed
  const handleModelChange = useCallback(
    async (modelId: string) => {
      setSelectedModel(modelId)
      if (user) {
        const currentKeys = (profile?.api_keys as Record<string, unknown>) || {}
        await supabase
          .from('user_profiles')
          .update({
            api_keys: { ...currentKeys, ai_model_preference: modelId },
          })
          .eq('id', user.id)
      }
    },
    [user, profile]
  )

  // Send a message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!user || !content.trim()) return

      setError(null)
      setLoading(true)

      // Add user message
      const userMessage: AiMessage = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      }

      setMessages(prev => [...prev, userMessage])

      try {
        // Build request payload
        const requestMessages = [
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user' as const, content: content.trim() },
        ]

        const payload: ChatEdgeFunctionRequest = {
          messages: requestMessages,
          context,
          model: selectedModel,
          conversationId: conversationId || undefined,
        }

        // Call edge function
        const { data, error: fnError } = await supabase.functions.invoke<ChatEdgeFunctionResponse>(
          'openrouter-chat',
          { body: payload }
        )

        if (fnError) {
          throw new Error(fnError.message)
        }

        if (data?.error) {
          throw new Error(data.error)
        }

        if (!data?.content) {
          throw new Error('No response from AI')
        }

        // Add assistant message
        const assistantMessage: AiMessage = {
          id: generateId(),
          role: 'assistant',
          content: data.content,
          timestamp: new Date().toISOString(),
        }

        const updatedMessages = [...messages, userMessage, assistantMessage]
        setMessages(updatedMessages)

        // Upsert conversation to database
        const title = messages.length === 0 ? content.slice(0, 50) : undefined

        if (conversationId) {
          // Update existing conversation
          await supabase
            .from('ai_conversations')
            .update({
              messages: updatedMessages as unknown as Json,
              context: context as unknown as Json,
              updated_at: new Date().toISOString(),
            })
            .eq('id', conversationId)
        } else {
          // Create new conversation
          const { data: newConvo } = await supabase
            .from('ai_conversations')
            .insert({
              user_id: user.id,
              title,
              messages: updatedMessages as unknown as Json,
              context: context as unknown as Json,
            })
            .select('id')
            .single()

          if (newConvo) {
            setConversationId(newConvo.id)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message')
        // Remove user message on error
        setMessages(prev => prev.filter(m => m.id !== userMessage.id))
      } finally {
        setLoading(false)
      }
    },
    [user, messages, context, selectedModel, conversationId]
  )

  // Load a conversation from the database
  const loadConversation = useCallback(
    async (id: string) => {
      if (!user) return

      setLoading(true)
      setError(null)

      const { data, error: loadError } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (loadError || !data) {
        setError('Failed to load conversation')
        setLoading(false)
        return
      }

      setConversationId(data.id)
      setMessages((data.messages as unknown as AiMessage[]) || [])
      setContext((data.context as unknown as AiContext) || {})
      setLoading(false)
    },
    [user]
  )

  // Start a new conversation
  const newConversation = useCallback(() => {
    setConversationId(null)
    setMessages([])
    setContext({})
    setError(null)
  }, [])

  // List recent conversations
  const listConversations = useCallback(async (): Promise<ConversationSummary[]> => {
    if (!user) return []

    const { data } = await supabase
      .from('ai_conversations')
      .select('id, title, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(20)

    return (data as ConversationSummary[]) || []
  }, [user])

  return {
    messages,
    conversationId,
    loading,
    error,
    context,
    setContext,
    selectedModel,
    setSelectedModel: handleModelChange,
    sendMessage,
    loadConversation,
    newConversation,
    listConversations,
  }
}
