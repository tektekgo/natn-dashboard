/**
 * Chat input component with auto-growing textarea.
 */

import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { Send, TrendingUp, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { AiContext } from '@/types/ai'

interface ChatInputProps {
  onSend: (message: string) => void
  loading: boolean
  context: AiContext
}

export default function ChatInput({ onSend, loading, context }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [value])

  function handleSubmit() {
    if (!value.trim() || loading) return
    onSend(value.trim())
    setValue('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Build context chips
  const chips: { icon: React.ReactNode; label: string }[] = []

  if (context.strategyConfig?.name) {
    chips.push({
      icon: <TrendingUp className="w-3 h-3" />,
      label: context.strategyConfig.name,
    })
  }

  if (context.metrics) {
    chips.push({
      icon: <BarChart3 className="w-3 h-3" />,
      label: `${context.metrics.totalReturn >= 0 ? '+' : ''}${context.metrics.totalReturn.toFixed(1)}% return`,
    })
  }

  return (
    <div className="space-y-2">
      {/* Context chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((chip, i) => (
            <Badge key={i} variant="secondary" className="text-xs gap-1">
              {chip.icon}
              {chip.label}
            </Badge>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your strategy..."
          disabled={loading}
          rows={1}
          className="flex-1 resize-none bg-muted border border-input rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={loading || !value.trim()}
          className="flex-shrink-0 h-10 w-10"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  )
}
