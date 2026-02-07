# NATN Lab — Operations Guide (Cheat Sheet)

Quick reference for day-to-day work with the NATN Lab platform.

---

## Architecture at a Glance

```
YOU (browser)                    AUTOMATED (GitHub Actions)
     │                                    │
     ▼                                    ▼
natnlab.com ──► PROD Supabase ◄── Cron (Mon-Fri 9:45 AM ET)
  (Vercel)       wavfrk...              │
                                   Trading Bot
preview URL ──► DEV Supabase ◄── Manual trigger (development)
  (Vercel)       cswtadq...

localhost:8000 ──► DEV Supabase ◄── npm run dry-run (local)
  (Vite dev)       (via bot/.env)
```

---

## Three Ways to Run the Bot

### 1. Local (your machine)

**When:** Testing code changes, debugging signals, quick experiments.

```bash
cd bot
npm run dry-run     # DRY_RUN=true in .env — no Alpaca orders
npm start           # Uses whatever DRY_RUN is set to in .env
```

- Uses: `bot/.env` (points to DEV Supabase)
- Alpaca orders: Depends on `DRY_RUN` setting in `bot/.env`
- Writes execution logs: YES (to DEV Supabase)
- Sends Telegram: YES
- See results: Vercel preview URL → Activity page

**To change DRY_RUN:** Edit `bot/.env` line `DRY_RUN=true` or `DRY_RUN=false`

### 2. GitHub Actions — Manual Trigger

**When:** Testing without your laptop, verifying the full CI pipeline works, running against PROD.

**How to trigger:**
1. Go to: github.com/tektekgo/natn-dashboard → Actions tab → "Trading Bot"
2. Click "Run workflow"
3. Select:
   - **Branch:** main
   - **Dry run:** checked (no orders) or unchecked (real paper orders)
   - **Environment:** development or production
4. Click "Run workflow"

| Environment Choice | Supabase | See Results At |
|--------------------|----------|----------------|
| development | DEV (cswtadq...) | Vercel preview URL |
| production | PROD (wavfrk...) | natnlab.com |

### 3. GitHub Actions — Scheduled Cron

**When:** Automatic. Runs every weekday.

- Schedule: Monday-Friday at 9:45 AM ET (13:45 UTC)
- Always runs against: **production** (PROD Supabase)
- DRY_RUN: **false** (places real paper trading orders)
- See results: natnlab.com → Activity page
- Telegram notification: sent to your phone

**Important:** The cron only executes if you have an active strategy on natnlab.com (PROD). If no strategy has `trading_mode = 'paper'`, the bot exits with "No active strategy found."

---

## What DRY_RUN Actually Controls

DRY_RUN **only** affects whether Alpaca orders are placed. Everything else runs normally:

| Action | DRY_RUN=true | DRY_RUN=false |
|--------|-------------|---------------|
| Fetch strategy from Supabase | Yes | Yes |
| Fetch Alpaca account/positions | Yes | Yes |
| Run risk assessment | Yes | Yes |
| Generate signals (tech/fund/sent) | Yes | Yes |
| Place Alpaca orders | **NO (fake order IDs)** | **YES (real paper orders)** |
| Log execution to Supabase | Yes | Yes |
| Log C-2 symbol details | Yes | Yes |
| Send Telegram notifications | Yes | Yes |

So a dry run still populates your Activity page with signal data — you just won't see real order fills in Alpaca.

---

## Daily Workflow

### Typical weekday (hands-off)

1. Bot runs automatically at 9:45 AM ET via cron
2. You get a Telegram notification with the summary
3. Optionally check natnlab.com → Activity page for signal details

### When you want to experiment

1. Make code changes in `bot/src/`
2. Test locally: `cd bot && npm run dry-run`
3. Check results on Vercel preview → Activity page
4. When satisfied, commit and push to dev, merge to main
5. Optionally trigger a manual GitHub Actions run to verify

### When you want to activate a strategy for production

1. Log into natnlab.com (PROD)
2. Go to Strategies page
3. Click "Activate" on the strategy you want (owner-only button)
4. The next cron run will pick it up automatically

### When you want to deactivate

1. Log into natnlab.com → Strategies → Click "Deactivate"
2. Cron will exit with "No active strategy found" until you activate another

---

## Environment Reference

### Three Independent Systems

| System | Purpose | DEV | PROD |
|--------|---------|-----|------|
| **Vercel** | Dashboard UI | dev branch → preview URL | main branch → natnlab.com |
| **Supabase** | Database + Auth | cswtadqnehrseskzcgzi | wavfrkcskjbgxdwxunjn |
| **GitHub Actions** | Trading Bot | "development" environment | "production" environment |

### Key Fact: User UUIDs Are Different

Your login on the Vercel preview site creates a user in DEV Supabase.
Your login on natnlab.com creates a different user in PROD Supabase.
These are completely separate databases with separate auth.

| | DEV | PROD |
|--|-----|------|
| Your UUID | d642884e-eb31-4703-b7c4-cd27a4a7f1b5 | fa6a82ed-2b0e-4992-8c7c-cc6c32910ac8 |
| Supabase Dashboard | supabase.com → natnlab-dev | supabase.com → natnlab-prod |

### GitHub Secrets Layout

```
Repo-level (shared — same for both environments):
  BOT_ALPACA_API_KEY, BOT_ALPACA_API_SECRET
  BOT_FMP_API_KEY, BOT_ALPHAVANTAGE_API_KEY
  BOT_TELEGRAM_BOT_TOKEN, BOT_TELEGRAM_CHAT_ID

Environment: development
  BOT_SUPABASE_URL → DEV
  BOT_SUPABASE_SERVICE_ROLE_KEY → DEV
  BOT_USER_ID → DEV UUID

Environment: production
  BOT_SUPABASE_URL → PROD
  BOT_SUPABASE_SERVICE_ROLE_KEY → PROD
  BOT_USER_ID → PROD UUID
```

No manual secret swapping needed — the workflow picks the right set automatically.

---

## Common Tasks

### Check bot status
```bash
# Latest run
gh run list --workflow=trading-bot.yml --limit 5

# View specific run logs
gh run view <RUN_ID> --log
```

### Check GitHub secrets
```bash
gh secret list                        # Repo-level
gh secret list --env development      # DEV environment
gh secret list --env production       # PROD environment
```

### Run bot locally
```bash
cd bot
npm run dry-run          # Safe: no real orders
# or
npm start                # Uses DRY_RUN value from .env
```

### Deploy code changes
```bash
git add <files>
git commit -m "description"
git push origin dev                   # Push to dev
git checkout main && git merge dev    # Merge to main
git push origin main                  # Deploy (Vercel auto-deploys, GitHub Actions picks up new code)
git checkout dev                      # Back to dev
```

### View Supabase data directly
- DEV: https://supabase.com/dashboard/project/cswtadqnehrseskzcgzi
- PROD: https://supabase.com/dashboard/project/wavfrkcskjbgxdwxunjn

### Check Alpaca positions
- Paper trading dashboard: https://app.alpaca.markets/paper/dashboard/overview

---

## Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| Bot says "No active strategy found" | No strategy with `trading_mode = 'paper'` in target Supabase | Activate a strategy on the corresponding site |
| Bot says "RISK HALT" | Exposure exceeds limit | Check strategy's risk config, may need to adjust maxPortfolioRiskPercent |
| Telegram errors about HTML parsing | Signal reasons contain `<` or `>` | Already fixed with `esc()` function |
| Alpaca returns 0 bars | Missing `start` date or wrong `feed` | Already fixed: uses `feed=iex` + calculated start date |
| GitHub Actions "No active strategy" on PROD | Haven't activated a strategy on natnlab.com yet | Log into natnlab.com, activate a strategy |
| Can't trigger workflow manually | Workflow file not on main branch | Merge dev to main first |

---

## Access Control Summary

| Who | Can Do | Cannot Do |
|-----|--------|-----------|
| **You (owner)** | Create strategies, activate for paper trading, see ALL execution results, manage invite codes | N/A |
| **Regular users** | Create strategies, run backtests, see own backtest results | Activate trading, see other users' data, place any trades |
| **Bot** | Read active strategy, place paper orders, write execution logs | Anything else (uses service_role key, scoped to writes) |
