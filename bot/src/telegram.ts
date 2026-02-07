/**
 * Telegram notification helper.
 * Sends formatted messages to the configured chat.
 */

import { config } from './config.js'
import type { SymbolResult, RiskCheckResult } from './types.js'

/** Escape text for Telegram HTML parse mode (preserves intentional <b> etc). */
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function sendMessage(text: string): Promise<void> {
  if (!config.telegram.enabled) return

  try {
    const url = `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.telegram.chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })

    if (!res.ok) {
      console.warn(`[Telegram] Send failed: ${res.status} ${await res.text()}`)
    }
  } catch (err) {
    console.warn('[Telegram] Error:', err)
  }
}

export async function notifyExecutionStart(strategyName: string): Promise<void> {
  await sendMessage(`<b>NATN Bot Started</b>\nStrategy: ${esc(strategyName)}\nTime: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`)
}

export async function notifyRiskHalt(checks: RiskCheckResult): Promise<void> {
  const lines = ['<b>RISK HALT</b>']
  if (!checks.dailyTradeLimitOk) lines.push(`Daily trades: ${checks.dailyTrades}/${checks.dailyTradeLimit}`)
  if (!checks.dailyLossLimitOk) lines.push(`Daily P/L: ${checks.dailyPlPercent.toFixed(2)}% (limit: ${checks.dailyLossLimitPercent}%)`)
  if (!checks.exposureLimitOk) lines.push(`Exposure: $${checks.totalExposure.toFixed(0)} (max: $${checks.maxExposure.toFixed(0)})`)
  await sendMessage(lines.join('\n'))
}

export async function notifyOrder(result: SymbolResult, side: string): Promise<void> {
  const emoji = side === 'buy' ? '🟢' : side === 'sell_tp' ? '🎯' : '🔴'
  const scoreText = result.combinedScore !== null ? `Score: ${result.combinedScore.toFixed(1)}` : ''
  await sendMessage(
    `${emoji} <b>${side.toUpperCase()}</b> ${result.quantity} x ${esc(result.symbol)}\n` +
    `Price: $${result.price?.toFixed(2) ?? 'N/A'}\n` +
    `${scoreText}\n` +
    `Reason: ${esc(result.reason)}`
  )
}

export async function notifySummary(
  strategyName: string,
  results: SymbolResult[],
  ordersPlaced: number,
  dryRun: boolean
): Promise<void> {
  const buys = results.filter(r => r.action === 'buy').length
  const sells = results.filter(r => r.action === 'sell_tp' || r.action === 'sell_sl').length
  const skips = results.filter(r => r.action === 'skip').length

  const lines = [
    `<b>NATN Bot Complete</b>${dryRun ? ' (DRY RUN)' : ''}`,
    `Strategy: ${esc(strategyName)}`,
    `Symbols: ${results.length} | Buys: ${buys} | Sells: ${sells} | Skips: ${skips}`,
    `Orders placed: ${ordersPlaced}`,
  ]

  // Show top actions
  for (const r of results.filter(r => r.action !== 'skip').slice(0, 5)) {
    lines.push(`  ${r.action.toUpperCase()} ${esc(r.symbol)} — ${esc(r.reason)}`)
  }

  await sendMessage(lines.join('\n'))
}

export async function notifyError(message: string): Promise<void> {
  await sendMessage(`<b>NATN Bot ERROR</b>\n${esc(message)}`)
}
