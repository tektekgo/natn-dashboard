# NATN Lab Dashboard

**Your Trading Strategy Laboratory**

NATN Lab is an educational trading platform for learning and experimenting with trading strategies using paper trading.

## Features

- **Learn**: Understand trading signals, technical indicators, and market fundamentals
- **Test**: Backtest strategies against historical data
- **Trade Smarter**: Paper trade with confidence using automated strategies

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Email**: Resend

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/tektekgo/natn-dashboard.git
   cd natn-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Copy the example file
   cp .env.example .env

   # Edit .env with your Supabase credentials
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:8000

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key (public) | Yes |
| `VITE_APP_ENV` | `development` or `production` | Yes |
| `VITE_ALPACA_API_KEY` | Alpaca API key (paper trading data) | Yes |
| `VITE_ALPACA_API_SECRET` | Alpaca API secret (paper trading data) | Yes |
| `VITE_FMP_API_KEY` | Financial Modeling Prep key (fundamentals) | Yes |
| `VITE_APP_URL` | App URL (production only) | No |

See `.env.example` for the full template. Note: `VITE_` keys are exposed in client-side JS. See `docs/SECURITY-NOTES.md` for the Edge Function migration plan.

## Project Structure

```
natn-dashboard/
├── public/              # Static assets (logos, favicons)
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React contexts (Auth, etc.)
│   ├── data/providers/  # API clients (Alpaca, FMP, Alpha Vantage)
│   ├── engine/          # Backtesting engine (simulator, signals, indicators)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities (Supabase client, fetch-with-retry)
│   ├── pages/           # Route pages
│   └── types/           # TypeScript type definitions
├── supabase/
│   └── migrations/      # Database migration files (001-005)
├── docs/
│   ├── DEPLOYMENT.md    # Build/deploy/env guide
│   └── SECURITY-NOTES.md # API key security + migration plan
└── .env.example         # Environment variable template
```

## Deployment

This project deploys to Vercel:
- `dev` branch → Preview deployments
- `main` branch → Production (natnlab.com)

## License

Private - All rights reserved.

---

*NATN Lab - Educational Trading Platform*
*Paper trading only. This is not financial advice.*

