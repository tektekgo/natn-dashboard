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

5. Open http://localhost:5173

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only) |
| `RESEND_API_KEY` | Resend email API key |
| `OPENROUTER_API_KEY` | OpenRouter AI API key |

## Project Structure

```
natn-dashboard/
├── public/              # Static assets (logos, favicons)
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Route pages
│   ├── lib/             # Utilities (Supabase client, etc.)
│   ├── hooks/           # Custom React hooks
│   └── types/           # TypeScript type definitions
├── supabase/
│   └── migrations/      # Database migration files
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
