# SECURITY NOTES - API Key Management

**Status:** Enhancement planned
**Priority:** Medium (before public launch)
**Created:** January 27, 2026

---

## Current Issue

Several API keys use the `VITE_` prefix, which means Vite bundles them into
client-side JavaScript. Anyone can open browser DevTools and extract these keys
from the built JS files.

### Currently Exposed (VITE_ prefix)

| Variable | Risk Level | Why |
|----------|-----------|-----|
| `VITE_SUPABASE_URL` | Low | Public by design, RLS protects data |
| `VITE_SUPABASE_ANON_KEY` | Low | Public by design, limited by RLS policies |
| `VITE_ALPACA_API_KEY` | Medium | Paper trading only, no real money risk |
| `VITE_ALPACA_API_SECRET` | Medium | Paper trading only, but could be abused for excessive API calls |
| `VITE_FMP_API_KEY` | Medium | 250 calls/day limit, someone could exhaust your quota |
| `VITE_ALPHAVANTAGE_API_KEY` | Medium | 25 calls/day limit, very easy to exhaust |

### Already Server-Side Only (No VITE_ prefix)

| Variable | Status |
|----------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | Correct - never exposed |
| `OPENROUTER_API_KEY` | Correct - never exposed (has spending implications) |
| `RESEND_API_KEY` | Correct - never exposed |

---

## Why It Works For Now

- **Alpaca keys** are for paper trading (simulated money), so exposure doesn't
  risk real funds. Alpaca's free tier has no rate limits on market data.
- **FMP key** is free tier (250/day). If someone abuses it, worst case is the
  daily quota gets exhausted. Key can be regenerated.
- **Alpha Vantage** is free tier (25/day). Same situation as FMP.
- The app is currently invite-only (beta), limiting exposure.

---

## Migration Plan: Supabase Edge Functions

Move all external API calls behind Supabase Edge Functions so keys stay
server-side. The frontend calls the Edge Function, which calls the external
API with the secret key.

### Architecture Change

```
CURRENT (keys in browser):
  Browser  -->  Alpaca API (with VITE_ALPACA_API_KEY)
  Browser  -->  FMP API (with VITE_FMP_API_KEY)

TARGET (keys on server):
  Browser  -->  Supabase Edge Function  -->  Alpaca API (with secret key)
  Browser  -->  Supabase Edge Function  -->  FMP API (with secret key)
```

### Implementation Steps

1. **Create Supabase Edge Functions** for each external API:
   - `supabase/functions/alpaca-bars/index.ts` - proxies historical data requests
   - `supabase/functions/fmp-profile/index.ts` - proxies fundamental data requests
   - `supabase/functions/fmp-metrics/index.ts` - proxies quarterly metrics
   - `supabase/functions/alphavantage-sentiment/index.ts` - proxies sentiment data
   - `supabase/functions/openrouter-chat/index.ts` - proxies AI requests (Phase 6)

2. **Store API keys as Supabase Secrets** (not in Vercel):
   ```bash
   supabase secrets set ALPACA_API_KEY=your-key
   supabase secrets set ALPACA_API_SECRET=your-secret
   supabase secrets set FMP_API_KEY=your-key
   supabase secrets set ALPHAVANTAGE_API_KEY=your-key
   supabase secrets set OPENROUTER_API_KEY=your-key
   ```

3. **Add auth checks** in Edge Functions:
   - Verify the request has a valid Supabase JWT
   - Optionally rate-limit per user (prevent abuse)
   - Log usage for monitoring

4. **Update frontend data providers** to call Edge Functions instead:
   - `alpaca-client.ts` -> calls `/functions/v1/alpaca-bars` instead of Alpaca directly
   - `fmp-client.ts` -> calls `/functions/v1/fmp-profile` instead of FMP directly

5. **Remove VITE_ prefixed API keys** from Vercel environment variables

6. **Update .env.example** to reflect new structure

### Edge Function Example

```typescript
// supabase/functions/alpaca-bars/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Verify auth
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Parse request
  const { symbol, startDate, endDate, timeframe } = await req.json()

  // Call Alpaca with server-side key
  const alpacaResponse = await fetch(
    `https://data.alpaca.markets/v2/stocks/${symbol}/bars?` +
    `start=${startDate}&end=${endDate}&timeframe=${timeframe}&adjustment=split`,
    {
      headers: {
        'APCA-API-KEY-ID': Deno.env.get('ALPACA_API_KEY')!,
        'APCA-API-SECRET-KEY': Deno.env.get('ALPACA_API_SECRET')!,
      },
    }
  )

  const data = await alpacaResponse.json()
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### Frontend Client Change

```typescript
// Before (key exposed):
const response = await fetch(`https://data.alpaca.markets/v2/stocks/${symbol}/bars?...`, {
  headers: {
    'APCA-API-KEY-ID': import.meta.env.VITE_ALPACA_API_KEY,
    'APCA-API-SECRET-KEY': import.meta.env.VITE_ALPACA_API_SECRET,
  },
})

// After (key hidden):
const response = await supabase.functions.invoke('alpaca-bars', {
  body: { symbol, startDate, endDate, timeframe },
})
```

---

## Additional Security Enhancements (Future)

| Enhancement | Priority | Notes |
|-------------|----------|-------|
| Per-user rate limiting in Edge Functions | Medium | Prevent single user from exhausting API quotas |
| API usage logging/monitoring | Medium | Track which users make how many API calls |
| User-provided API keys (BYOK) | Low | Store encrypted in user_profiles.api_keys |
| API key rotation alerts | Low | Notify when keys should be rotated |
| Content Security Policy headers | Low | Restrict which domains the app can call |

---

## When To Do This

- **Before public launch** (removing invite-code requirement)
- **Before adding paid tiers** (paying users expect their data/keys to be secure)
- **Before OpenRouter integration** (Phase 6, since AI calls have real cost)

For the current invite-only beta with paper trading, the existing setup is
acceptable but should not go to full public access without this migration.
