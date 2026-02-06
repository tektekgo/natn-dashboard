/**
 * OpenRouter Chat Edge Function
 * Proxies chat requests to OpenRouter API with context injection
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform',
}

const DEFAULT_FREE_MODEL = 'openrouter/auto'
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

interface RequestBody {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  context: {
    strategyConfig?: {
      name: string
      symbols?: string[]
      riskProfile?: string
      [key: string]: unknown
    }
    metrics?: {
      totalReturn: number
      sharpeRatio: number
      maxDrawdown: number
      winRate: number
      profitFactor: number
      totalTrades: number
      avgWinPercent: number
      avgLossPercent: number
      avgHoldingDays: number
      bestTrade: number
      worstTrade: number
    }
    trades?: Array<{
      symbol: string
      pnlPercent: number
      exitReason: string
    }>
    gradeResult?: {
      letter: string
      score: number
      insights: Array<{ type: string; title: string; body: string }>
    }
    pageContext?: string
  }
  model: string
  conversationId?: string
}

function buildSystemPrompt(context: RequestBody['context']): string {
  let prompt = `You are NATN Lab AI, an expert trading strategy assistant for an educational platform. You help users understand their trading strategies, backtest results, and how to improve. Be specific, actionable, and educational. Reference the user's actual data when available.

Key guidelines:
- Explain trading concepts in simple terms
- Provide specific, actionable advice based on the user's data
- Be encouraging but honest about weaknesses
- Focus on education and learning
`

  if (context.strategyConfig) {
    prompt += `\n## Current Strategy
- Name: ${context.strategyConfig.name}
`
    if (context.strategyConfig.symbols && context.strategyConfig.symbols.length > 0) {
      prompt += `- Symbols: ${context.strategyConfig.symbols.join(', ')}\n`
    }
    if (context.strategyConfig.riskProfile) {
      prompt += `- Risk Profile: ${context.strategyConfig.riskProfile}\n`
    }
  }

  if (context.metrics) {
    const m = context.metrics
    prompt += `\n## Backtest Metrics
- Total Return: ${m.totalReturn != null ? (m.totalReturn >= 0 ? '+' : '') + m.totalReturn.toFixed(2) : 'N/A'}%
- Sharpe Ratio: ${m.sharpeRatio?.toFixed(2) ?? 'N/A'}
- Max Drawdown: ${m.maxDrawdown?.toFixed(2) ?? 'N/A'}%
- Win Rate: ${m.winRate?.toFixed(1) ?? 'N/A'}%
- Profit Factor: ${m.profitFactor === Infinity ? 'Infinity (no losses)' : m.profitFactor?.toFixed(2) ?? 'N/A'}
- Total Trades: ${m.totalTrades ?? 'N/A'}
- Average Win: +${m.avgWinPercent?.toFixed(2) ?? 'N/A'}%
- Average Loss: ${m.avgLossPercent?.toFixed(2) ?? 'N/A'}%
- Average Holding: ${m.avgHoldingDays?.toFixed(1) ?? 'N/A'} days
- Best Trade: +${m.bestTrade?.toFixed(2) ?? 'N/A'}%
- Worst Trade: ${m.worstTrade?.toFixed(2) ?? 'N/A'}%
`
  }

  if (context.gradeResult) {
    const g = context.gradeResult
    prompt += `\n## Strategy Grade
- Letter Grade: ${g.letter}
- Score: ${g.score}/100
`
    if (g.insights && g.insights.length > 0) {
      prompt += `- Key Insights:\n`
      for (const insight of g.insights.slice(0, 5)) {
        prompt += `  - [${insight.type}] ${insight.title}: ${insight.body}\n`
      }
    }
  }

  if (context.trades && context.trades.length > 0) {
    try {
      const wins = context.trades.filter(t => t.pnlPercent > 0).length
      const losses = context.trades.filter(t => t.pnlPercent <= 0).length
      const best = context.trades.reduce((max, t) => (t.pnlPercent ?? 0) > (max.pnlPercent ?? 0) ? t : max, context.trades[0])
      const worst = context.trades.reduce((min, t) => (t.pnlPercent ?? 0) < (min.pnlPercent ?? 0) ? t : min, context.trades[0])

      prompt += `\n## Trade Summary
- ${wins} winning trades, ${losses} losing trades
- Best trade: ${best.symbol} (+${best.pnlPercent?.toFixed(2) ?? 'N/A'}%)
- Worst trade: ${worst.symbol} (${worst.pnlPercent?.toFixed(2) ?? 'N/A'}%)
`
    } catch {
      // Skip trade summary if there's an error
    }
  }

  return prompt
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    const appUrl = Deno.env.get('APP_URL') || 'https://natnlab.com'

    if (!openrouterApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify JWT and get user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const token = authHeader.replace('Bearer ', '')

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isOwner = profile?.role === 'owner'

    // Parse request body
    const body: RequestBody = await req.json()

    // Enforce free model for non-owners
    let model = body.model || DEFAULT_FREE_MODEL
    if (!isOwner && model !== DEFAULT_FREE_MODEL) {
      model = DEFAULT_FREE_MODEL
    }

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(body.context)

    // Prepare messages for OpenRouter
    const messages = [
      { role: 'system', content: systemPrompt },
      ...body.messages,
    ]

    // Call OpenRouter API
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': appUrl,
        'X-Title': 'NATN Lab',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter error:', response.status, errorText)
      console.error('Request model:', model)
      console.error('Request messages count:', messages.length)

      // Return more specific error message
      let errorMessage = 'AI service error. Please try again.'
      if (response.status === 401) {
        errorMessage = 'AI service authentication failed. Check API key.'
      } else if (response.status === 429) {
        errorMessage = 'AI service rate limited. Please wait and try again.'
      } else if (response.status === 400) {
        errorMessage = 'Invalid request to AI service.'
      }

      return new Response(
        JSON.stringify({ error: errorMessage, details: errorText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()

    const content = data.choices?.[0]?.message?.content || ''
    const usage = data.usage

    return new Response(
      JSON.stringify({
        content,
        model,
        usage,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
