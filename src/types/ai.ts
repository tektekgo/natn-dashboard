/**
 * AI Chat types and model definitions.
 */

import type { BacktestMetrics, ClosedTrade } from '@/engine/types'
import type { GradeResult } from '@/lib/strategy-grader'

// ---------------------------------------------------------------------------
// Message Types
// ---------------------------------------------------------------------------

export interface AiMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

// ---------------------------------------------------------------------------
// Context Types
// ---------------------------------------------------------------------------

export interface AiContext {
  strategyConfig?: {
    name: string
    symbols?: string[]
    riskProfile?: string
    [key: string]: unknown
  }
  metrics?: BacktestMetrics
  trades?: ClosedTrade[]
  gradeResult?: GradeResult
  backtestId?: string
  pageContext?: string
}

// ---------------------------------------------------------------------------
// Model Definitions
// ---------------------------------------------------------------------------

export interface AiModel {
  id: string
  name: string
  provider: string
  isFree: boolean
  description: string
}

export const AI_MODELS: AiModel[] = [
  {
    id: 'openrouter/auto',
    name: 'Auto (Best Free)',
    provider: 'OpenRouter',
    isFree: true,
    description: 'Auto-routes to best available free model',
  },
  {
    id: 'qwen/qwen3-coder:free',
    name: 'Qwen 3 Coder',
    provider: 'Alibaba',
    isFree: true,
    description: 'Free tier - optimized for code',
  },
  {
    id: 'zhipu-ai/glm-4-air:free',
    name: 'GLM-4 Air',
    provider: 'Zhipu AI',
    isFree: true,
    description: 'Free tier - highly rated',
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    isFree: false,
    description: 'Advanced reasoning and analysis',
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    isFree: false,
    description: 'Powerful multimodal model',
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    isFree: false,
    description: 'Fast and efficient',
  },
]

export const DEFAULT_FREE_MODEL = 'openrouter/auto'

// ---------------------------------------------------------------------------
// Edge Function Request/Response Types
// ---------------------------------------------------------------------------

export interface ChatEdgeFunctionRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  context: AiContext
  model: string
  conversationId?: string
}

export interface ChatEdgeFunctionResponse {
  content: string
  model: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  error?: string
}
