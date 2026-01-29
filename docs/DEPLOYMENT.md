# NATN Lab Dashboard — Build, Deploy & Environment Guide

## Architecture Overview

```
Local Development          Preview (dev branch)          Production (main branch)
─────────────────          ────────────────────          ──────────────────────────
localhost:8000             Vercel preview URL             natnlab.com
.env file                  Vercel env vars (Preview)      Vercel env vars (Production)
natnlab-dev (Supabase)     natnlab-dev (Supabase)         natnlab-prod (Supabase)
```

---

## 1. Local Development

### First-time setup

```bash
cd natn-dashboard
npm install
```

### Configure environment

1. Copy the template:
   ```bash
   cp .env.example .env
   ```
2. Fill in your `.env` file with actual values (see [Environment Variables](#environment-variables) below).

   The `.env.dev` file has Supabase dev credentials already.
   You can start from that:
   ```bash
   cp .env.dev .env
   ```
   Then **add** the missing API keys for Alpaca and FMP:
   ```
   VITE_ALPACA_API_KEY=your-alpaca-paper-key
   VITE_ALPACA_API_SECRET=your-alpaca-paper-secret
   VITE_FMP_API_KEY=your-fmp-key
   ```

### Run the dev server

```bash
npm run dev
```

- Opens at **http://localhost:8000**
- Hot-reloads on file changes (Vite HMR)
- Uses `.env` file for all environment variables

### Other local commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start Vite dev server (localhost:8000) |
| `npm run build` | TypeScript check + production build → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run type-check` | TypeScript check only (no build) |
| `npm run lint` | ESLint check |
| `npm test` | Run unit tests (Vitest, 49 tests) |
| `npm run test:watch` | Run tests in watch mode |

### When backtests fail with 401

The backtest engine calls Alpaca's Data API directly from the browser to fetch
historical stock prices. If you see `Alpaca API error (401)`, your `.env` file
is missing or has invalid Alpaca keys.

Get your paper trading keys from:
https://app.alpaca.markets/paper/dashboard/overview

---

## 2. Preview Environment (dev branch)

### How it works

1. Push commits to the `dev` branch
2. Vercel automatically builds and deploys a **Preview** environment
3. Vercel provides a unique preview URL (e.g., `natn-dashboard-xyz.vercel.app`)
4. Uses **Preview** environment variables from Vercel dashboard

### Trigger a preview deploy

```bash
git checkout dev
git add .
git commit -m "your changes"
git push origin dev
```

Vercel detects the push and deploys automatically. Check the Vercel dashboard
or GitHub PR for the preview URL.

### What Preview uses

- **Supabase**: natnlab-dev project (same as local)
- **API keys**: Set in Vercel dashboard under Preview environment
- **URL**: Auto-generated Vercel preview URL

---

## 3. Production Environment (main branch)

### How it works

1. Create a Pull Request from `dev` → `main`
2. Vercel builds a preview of the PR (preview URL attached to PR)
3. Merge the PR into `main`
4. Vercel automatically deploys to **Production** at **natnlab.com**
5. Uses **Production** environment variables from Vercel dashboard

### Deploy to production

```bash
# On dev branch, after testing
git checkout dev
git push origin dev

# Create PR via GitHub UI or CLI
gh pr create --base main --head dev --title "Release: description"

# After review, merge the PR
# Vercel auto-deploys to natnlab.com
```

### What Production uses

- **Supabase**: natnlab-prod project (separate from dev!)
- **API keys**: Set in Vercel dashboard under Production environment
- **URL**: https://natnlab.com

---

## Environment Variables

### Variable categories

| Prefix | Visibility | Description |
|--------|-----------|-------------|
| `VITE_` | **Client-side** (browser JS) | Bundled into JavaScript, visible in DevTools |
| No prefix | **Server-side only** | Only available during build or in Edge Functions |

### All variables

| Variable | Required | VITE? | Where to get it |
|----------|----------|-------|-----------------|
| `VITE_SUPABASE_URL` | Yes | Yes | Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Yes | Yes | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | No* | No | Supabase → Project Settings → API |
| `VITE_ALPACA_API_KEY` | Yes** | Yes | https://app.alpaca.markets/paper/dashboard |
| `VITE_ALPACA_API_SECRET` | Yes** | Yes | https://app.alpaca.markets/paper/dashboard |
| `VITE_FMP_API_KEY` | Yes** | Yes | https://financialmodelingprep.com/developer |
| `VITE_APP_URL` | Yes | Yes | `http://localhost:8000` / `https://natnlab.com` |
| `VITE_APP_ENV` | Yes | Yes | `development` / `production` |
| `RESEND_API_KEY` | No* | No | https://resend.com/api-keys |
| `OPENROUTER_API_KEY` | No* | No | https://openrouter.ai/keys |
| `OPENROUTER_SPENDING_LIMIT` | No* | No | Monthly $ limit for AI features |

\* Needed for future Edge Functions (email, AI).
\** Required for backtesting to work. Without Alpaca keys, backtests fail with 401.

### Where variables live per environment

| Variable | Local (.env) | Preview (Vercel) | Production (Vercel) |
|----------|-------------|-------------------|---------------------|
| `VITE_SUPABASE_URL` | DEV URL | DEV URL | PROD URL |
| `VITE_SUPABASE_ANON_KEY` | DEV key | DEV key | PROD key |
| `VITE_ALPACA_API_KEY` | Your paper key | Paper key | Paper key |
| `VITE_ALPACA_API_SECRET` | Your paper secret | Paper secret | Paper secret |
| `VITE_FMP_API_KEY` | Your FMP key | FMP key | FMP key |
| `VITE_APP_URL` | `http://localhost:8000` | (auto) | `https://natnlab.com` |
| `VITE_APP_ENV` | `development` | `development` | `production` |

### Setting Vercel environment variables

1. Go to https://vercel.com → your project → Settings → Environment Variables
2. Add each variable with the appropriate scope:
   - **Preview**: Used for `dev` branch deploys
   - **Production**: Used for `main` branch deploys
   - **Development**: Not used (Vercel CLI only)
3. Variables are picked up on the **next deploy** (not retroactive)

### Security note

Variables prefixed with `VITE_` are embedded in the client-side JavaScript
bundle and visible in the browser DevTools. This is acceptable for:
- Supabase anon key (designed to be public, protected by RLS)
- Alpaca paper trading keys (no real money at risk)
- FMP key (250 req/day quota — low risk)

Future plan: Move Alpaca/FMP calls behind Supabase Edge Functions so keys are
never exposed to the browser. See `docs/SECURITY-NOTES.md`.

---

## File Reference

```
.env              → Local development (gitignored, you create this)
.env.dev          → DEV reference values (gitignored, has Supabase DEV creds)
.env.prod         → PROD reference values (gitignored, has Supabase PROD creds)
.env.example      → Template with placeholder values (committed to git)
```

**Important:** `.env`, `.env.dev`, and `.env.prod` are all gitignored.
Only `.env.example` is committed. Never commit real keys to git.

---

## Supabase Databases

| Project | Environment | Dashboard URL |
|---------|-------------|---------------|
| natnlab-dev | Local + Preview | https://supabase.com/dashboard/project/cswtadqnehrseskzcgzi |
| natnlab-prod | Production | https://supabase.com/dashboard/project/wavfrkcskjbgxdwxunjn |

### Running migrations

Migrations are in `supabase/migrations/`. Apply them via the Supabase SQL Editor
or the Supabase CLI:

```bash
supabase db push --project-ref cswtadqnehrseskzcgzi   # DEV
supabase db push --project-ref wavfrkcskjbgxdwxunjn   # PROD
```

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| Backtest 401 error | Missing Alpaca keys in `.env` | Add `VITE_ALPACA_API_KEY` and `VITE_ALPACA_API_SECRET` |
| Vite HMR failures on index.css | Dev server stale after edits | Restart: `Ctrl+C` then `npm run dev` |
| Supabase 406 on cache_metadata | Cache table missing in Supabase | Run migrations in SQL Editor |
| `tabs/sendMessage` console errors | Browser extension (password manager, etc.) | Ignore — not related to NATN Lab |
| Google Fonts not loading | Offline / DNS issue | Works when internet is available; app still functions without it |
| Build fails on TypeScript | Type errors in code | Run `npm run type-check` to see details |
