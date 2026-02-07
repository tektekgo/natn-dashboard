# NATN Trading Bot

Standalone TypeScript trading bot for the NATN Lab platform. Reads strategies from Supabase, executes paper trades via Alpaca, logs per-symbol details (C-2), and sends Telegram notifications.

## Architecture

```
GitHub Actions (cron: Mon-Fri 9:45 AM ET)
  │
  ▼
bot/src/index.ts (orchestrator)
  ├── Supabase: read active strategy
  ├── Alpaca: account info, positions, historical bars
  ├── Signals: technical (RSI/SMA) + fundamental (FMP) + sentiment (Alpha Vantage)
  ├── Combiner: weighted scoring + majority vote + veto logic
  ├── Executor: place orders via Alpaca paper trading API
  ├── Logger: write bot_executions + bot_execution_details to Supabase
  └── Telegram: send execution summary
```

## Files

| File | Purpose |
|------|---------|
| `src/index.ts` | Main orchestrator — the entire execution flow |
| `src/config.ts` | Environment variables loader |
| `src/types.ts` | TypeScript types (mirrors dashboard engine types) |
| `src/alpaca.ts` | Alpaca Trading + Market Data API client |
| `src/market-data.ts` | FMP fundamentals + Alpha Vantage sentiment |
| `src/supabase.ts` | Strategy reads + execution logging (C-2) |
| `src/telegram.ts` | Telegram notification helper |
| `src/signals/technical.ts` | RSI + SMA signal generation |
| `src/signals/fundamental.ts` | PE, EPS, beta scoring |
| `src/signals/sentiment.ts` | News sentiment scoring |
| `src/signals/combiner.ts` | Weighted signal combination |
| `src/indicators/rsi.ts` | RSI calculation (Wilder's smoothing) |
| `src/indicators/sma.ts` | SMA calculation |

## Running Locally

```bash
# 1. Copy env template and fill in your values
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Dry run (no real orders)
npm run dry-run

# 4. Live paper trading run
npm start
```

## GitHub Actions (Scheduled)

The bot runs automatically via `.github/workflows/trading-bot.yml`:
- **Schedule:** Mon-Fri at 9:45 AM ET (15 min after market open)
- **Manual trigger:** Actions tab → "Trading Bot" → "Run workflow" (with dry run option)

### Required GitHub Secrets

Set these in the repo: Settings → Secrets and variables → Actions

| Secret | Value |
|--------|-------|
| `BOT_SUPABASE_URL` | Supabase project URL |
| `BOT_SUPABASE_SERVICE_ROLE_KEY` | Service role key (NOT anon key) |
| `BOT_ALPACA_API_KEY` | Alpaca paper trading API key |
| `BOT_ALPACA_API_SECRET` | Alpaca paper trading secret |
| `BOT_FMP_API_KEY` | Financial Modeling Prep API key |
| `BOT_ALPHAVANTAGE_API_KEY` | Alpha Vantage API key |
| `BOT_TELEGRAM_BOT_TOKEN` | Telegram bot token |
| `BOT_TELEGRAM_CHAT_ID` | Telegram chat ID for notifications |
| `BOT_USER_ID` | Your Supabase user UUID |

## Execution Flow

1. **Fetch strategy** — reads first active strategy (trading_mode = 'paper') from Supabase
2. **Risk assessment** — checks daily trade count, daily P&L, total exposure
3. **For each symbol:**
   - Check existing position → take profit / stop loss
   - Fetch 200-day historical bars from Alpaca
   - Calculate technical signal (RSI, SMA crossovers)
   - Fetch fundamentals from FMP → calculate fundamental signal
   - Fetch sentiment from Alpha Vantage → calculate sentiment signal
   - Combine signals (weighted score + majority vote + veto logic)
   - Execute buy order if signal passes all gates
   - Log C-2 detail to `bot_execution_details`
4. **Log completion** — update `bot_executions` with summary
5. **Telegram summary** — send formatted notification

## Modifying Strategies

Strategies are configured in the NATN Lab dashboard (natnlab.com). The bot reads whatever strategy is set to `trading_mode = 'paper'`. No code changes needed to adjust strategy parameters.

## Coexistence with n8n

This bot and the existing n8n workflow can run side-by-side. Both read from the same `strategies` table. To avoid conflicts, only activate one at a time (or use different strategies).
