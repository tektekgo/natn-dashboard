/**
 * AI Chat Drawer component.
 * Slide-out panel with chat interface.
 */

import { useEffect, useRef, useState } from 'react'
import { Bot, Plus, Sparkles, AlertTriangle } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useAiChatContext } from '@/hooks/useAiChatContext'
import { AI_MODELS } from '@/types/ai'
import ChatMessageBubble from './ChatMessageBubble'
import ChatInput from './ChatInput'

const SUGGESTED_PROMPTS = [
  'Explain my strategy in simple terms',
  'How can I improve my win rate?',
  'What does my Sharpe ratio mean?',
  'Why is my drawdown so high?',
]

const PAID_MODELS_ACK_KEY = 'natn_paid_models_acknowledged'

export default function ChatDrawer() {
  const { isOwner } = useAuth()
  const {
    isOpen,
    setIsOpen,
    messages,
    loading,
    error,
    context,
    selectedModel,
    setSelectedModel,
    sendMessage,
    newConversation,
  } = useAiChatContext()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [pendingModel, setPendingModel] = useState<string | null>(null)
  const [showPaidConfirm, setShowPaidConfirm] = useState(false)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Filter models based on user role
  const availableModels = isOwner ? AI_MODELS : AI_MODELS.filter(m => m.isFree)

  // Handle model selection with paid model confirmation
  function handleModelChange(modelId: string) {
    const model = AI_MODELS.find(m => m.id === modelId)

    // If it's a paid model and not yet acknowledged this session
    if (model && !model.isFree) {
      const acknowledged = sessionStorage.getItem(PAID_MODELS_ACK_KEY)
      if (!acknowledged) {
        setPendingModel(modelId)
        setShowPaidConfirm(true)
        return
      }
    }

    setSelectedModel(modelId)
  }

  function confirmPaidModel() {
    if (pendingModel) {
      sessionStorage.setItem(PAID_MODELS_ACK_KEY, 'true')
      setSelectedModel(pendingModel)
      setPendingModel(null)
      setShowPaidConfirm(false)
    }
  }

  function cancelPaidModel() {
    setPendingModel(null)
    setShowPaidConfirm(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="flex flex-col p-0 w-full sm:max-w-md">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <SheetTitle>AI Assistant</SheetTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={newConversation}
              className="h-8 gap-1"
            >
              <Plus className="w-4 h-4" />
              New
            </Button>
          </div>
          <SheetDescription className="sr-only">
            Chat with AI about your trading strategies
          </SheetDescription>

          {/* Model selector */}
          <div className="mt-2">
            <Select value={selectedModel} onValueChange={handleModelChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map(model => (
                  <SelectItem key={model.id} value={model.id} className="text-xs">
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      {model.isFree ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400">(Free)</span>
                      ) : (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">(Paid)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Paid model confirmation */}
          {showPaidConfirm && (
            <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                    Paid Model Selected
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1">
                    This model incurs usage costs on your OpenRouter account.
                    Are you sure you want to use it?
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelPaidModel}
                      className="h-7 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={confirmPaidModel}
                      className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Yes, use paid model
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                Welcome to NATN Lab AI
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ask me anything about your trading strategies, backtest results, or how to improve.
              </p>

              {/* Suggested prompts */}
              <div className="space-y-2 w-full max-w-xs">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt)}
                    disabled={loading}
                    className="w-full text-left text-sm px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Message list
            <>
              {messages.map(message => (
                <ChatMessageBubble key={message.id} message={message} />
              ))}

              {/* Loading indicator */}
              {loading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        {/* Input */}
        <div className="px-4 py-4 border-t bg-background">
          <ChatInput onSend={sendMessage} loading={loading} context={context} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
