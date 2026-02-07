/**
 * Alpaca API client — Trading + Market Data.
 * Uses native fetch (Node 18+). No SDK dependency.
 */

import { config } from './config.js'
import type { AlpacaAccount, AlpacaPosition, AlpacaOrder, AlpacaBar, OHLCV } from './types.js'

const tradingHeaders = {
  'APCA-API-KEY-ID': config.alpaca.apiKey,
  'APCA-API-SECRET-KEY': config.alpaca.apiSecret,
  'Content-Type': 'application/json',
}

const dataHeaders = {
  'APCA-API-KEY-ID': config.alpaca.apiKey,
  'APCA-API-SECRET-KEY': config.alpaca.apiSecret,
}

// ---------------------------------------------------------------------------
// Trading API
// ---------------------------------------------------------------------------

export async function getAccount(): Promise<AlpacaAccount> {
  const res = await fetch(`${config.alpaca.baseUrl}/v2/account`, { headers: tradingHeaders })
  if (!res.ok) throw new Error(`Alpaca getAccount failed: ${res.status} ${await res.text()}`)
  return res.json()
}

export async function getAllPositions(): Promise<AlpacaPosition[]> {
  const res = await fetch(`${config.alpaca.baseUrl}/v2/positions`, { headers: tradingHeaders })
  if (!res.ok) throw new Error(`Alpaca getPositions failed: ${res.status} ${await res.text()}`)
  return res.json()
}

export async function getPosition(symbol: string): Promise<AlpacaPosition | null> {
  const res = await fetch(`${config.alpaca.baseUrl}/v2/positions/${symbol}`, { headers: tradingHeaders })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Alpaca getPosition(${symbol}) failed: ${res.status} ${await res.text()}`)
  return res.json()
}

export async function getTodaysOrders(): Promise<AlpacaOrder[]> {
  const today = new Date().toISOString().split('T')[0]
  const res = await fetch(
    `${config.alpaca.baseUrl}/v2/orders?status=filled&after=${today}T00:00:00Z&limit=100`,
    { headers: tradingHeaders }
  )
  if (!res.ok) throw new Error(`Alpaca getTodaysOrders failed: ${res.status} ${await res.text()}`)
  return res.json()
}

export async function placeOrder(params: {
  symbol: string
  qty: number
  side: 'buy' | 'sell'
  type?: 'market' | 'limit'
  time_in_force?: 'day' | 'gtc'
}): Promise<AlpacaOrder> {
  const body = {
    symbol: params.symbol,
    qty: String(params.qty),
    side: params.side,
    type: params.type || 'market',
    time_in_force: params.time_in_force || 'day',
  }

  console.log(`  [ORDER] ${params.side.toUpperCase()} ${params.qty} x ${params.symbol}${config.dryRun ? ' (DRY RUN)' : ''}`)

  if (config.dryRun) {
    return {
      id: `dry-run-${Date.now()}`,
      symbol: params.symbol,
      qty: String(params.qty),
      side: params.side,
      type: body.type,
      status: 'accepted',
      filled_at: null,
      filled_avg_price: null,
      created_at: new Date().toISOString(),
    }
  }

  const res = await fetch(`${config.alpaca.baseUrl}/v2/orders`, {
    method: 'POST',
    headers: tradingHeaders,
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Alpaca placeOrder failed: ${res.status} ${await res.text()}`)
  return res.json()
}

// ---------------------------------------------------------------------------
// Market Data API
// ---------------------------------------------------------------------------

export async function getHistoricalBars(symbol: string, limit = 200): Promise<OHLCV[]> {
  // Alpaca requires an explicit start date; go back ~400 calendar days to cover 200 trading days
  const start = new Date()
  start.setDate(start.getDate() - Math.ceil(limit * 2))
  const startStr = start.toISOString().split('T')[0]
  const url = `${config.alpaca.dataUrl}/stocks/${symbol}/bars?timeframe=1Day&limit=${limit}&start=${startStr}&adjustment=split&feed=iex&sort=asc`
  const res = await fetch(url, { headers: dataHeaders })
  if (!res.ok) throw new Error(`Alpaca getBars(${symbol}) failed: ${res.status} ${await res.text()}`)

  const data = await res.json() as { bars: AlpacaBar[] }
  return (data.bars || []).map(bar => ({
    date: bar.t.substring(0, 10),
    open: bar.o,
    high: bar.h,
    low: bar.l,
    close: bar.c,
    volume: bar.v,
  }))
}

export async function getLatestQuote(symbol: string): Promise<{ askPrice: number; bidPrice: number }> {
  const url = `${config.alpaca.dataUrl}/stocks/${symbol}/quotes/latest`
  const res = await fetch(url, { headers: dataHeaders })
  if (!res.ok) throw new Error(`Alpaca getQuote(${symbol}) failed: ${res.status} ${await res.text()}`)

  const data = await res.json() as { quote: { ap: number; bp: number } }
  return { askPrice: data.quote.ap, bidPrice: data.quote.bp }
}
