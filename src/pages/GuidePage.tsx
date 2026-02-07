/**
 * User Guide & FAQ page.
 * Comprehensive product documentation for NATN Lab users.
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InfoPanel } from '@/components/ui/info-panel'
import { useAuth } from '@/hooks/useAuth'

interface FaqItem {
  question: string
  answer: string
}

const faqs: FaqItem[] = [
  {
    question: 'Is NATN Lab free to use?',
    answer:
      'NATN Lab offers a free tier that lets you create one strategy, run a limited number of backtests, and explore trading concepts. Higher tiers unlock more strategies, longer historical data, and additional features.',
  },
  {
    question: 'Does NATN Lab use real money?',
    answer:
      'No. NATN Lab is a paper trading platform. All trades are simulated using historical or live market data, but no real money is involved. This makes it a safe environment to learn and experiment.',
  },
  {
    question: 'What data sources does NATN Lab use?',
    answer:
      'Historical price data comes from Alpaca Markets. Fundamental data (P/E ratio, revenue growth, etc.) comes from Financial Modeling Prep (FMP). Sentiment analysis uses Alpha Vantage news sentiment scores.',
  },
  {
    question: 'How accurate is backtesting?',
    answer:
      'Backtesting simulates how a strategy would have performed on historical data. While useful for learning and comparison, real-world results differ due to slippage, liquidity, trading fees, and market impact. Treat backtest results as educational tools, not guarantees.',
  },
  {
    question: 'What is an invite code and how do I get one?',
    answer:
      'NATN Lab is invite-only. You need a valid invite code to create an account. Contact the platform owner to request one. Each code has a limited number of uses and may have an expiration date.',
  },
  {
    question: 'Can I reset my password?',
    answer:
      'Yes. Click "Forgot password?" on the login page, enter your email, and you\'ll receive a reset link. Click the link, set a new password, and you\'re back in.',
  },
  {
    question: 'What is the AI Chat Assistant?',
    answer:
      'The AI Chat Assistant (accessible via the chat icon in the header) helps you understand trading concepts, interpret backtest results, and learn about technical indicators. It\'s an educational tool powered by AI language models.',
  },
  {
    question: 'What does the Sharpe Ratio mean?',
    answer:
      'The Sharpe Ratio measures risk-adjusted return. A ratio above 1.0 is generally considered good, above 2.0 is very good, and above 3.0 is excellent. It tells you how much excess return you get per unit of risk (volatility). Higher is better.',
  },
  {
    question: 'What is maximum drawdown?',
    answer:
      'Maximum drawdown is the largest peak-to-trough decline in your portfolio value during a backtest. For example, if your portfolio went from $10,000 to $8,500, that\'s a 15% max drawdown. Lower drawdowns indicate more stable strategies.',
  },
  {
    question: 'Can I export my backtest results?',
    answer:
      'Yes. After running a backtest, click the "Export CSV" button on the results page to download a spreadsheet with all trades, metrics, and performance data.',
  },
]

function FaqSection({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="border border-border rounded-lg overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            {item.question}
            <svg
              className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIndex === i && (
            <div className="px-4 pb-3 text-sm text-muted-foreground">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function GuidePage() {
  const { isOwner } = useAuth()

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Guide</h1>
        <p className="text-muted-foreground mt-1">
          Everything you need to know about using NATN Lab
        </p>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoPanel variant="info" title="What is NATN Lab?">
            <p>
              NATN Lab (<span className="font-mono text-orange-500">n8n</span> Automated Trading Network) is your personal trading strategy laboratory. It lets you create, backtest, and compare
              trading strategies using real market data — all in a safe, simulated environment with no real money at risk.
            </p>
          </InfoPanel>

          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p>Here's the typical workflow:</p>
            <ol className="list-decimal list-inside space-y-2 mt-2">
              <li>
                <strong className="text-foreground">Create a Strategy</strong> — Define your trading rules using
                technical indicators (RSI, SMA), fundamental filters (P/E ratio, revenue growth),
                and sentiment signals. Set risk parameters like stop-loss and take-profit levels.
              </li>
              <li>
                <strong className="text-foreground">Backtest It</strong> — Run your strategy against historical
                market data to see how it would have performed. Review charts, metrics, and individual trades.
              </li>
              <li>
                <strong className="text-foreground">Compare & Learn</strong> — Compare your strategy against
                a Buy & Hold benchmark or other strategies you've created. Understand what worked and why.
              </li>
              <li>
                <strong className="text-foreground">Iterate</strong> — Adjust your parameters, try different
                indicators, and test again. The goal is to build deep understanding of how trading strategies work.
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Creating Strategies */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Creating Strategies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p>
              Navigate to <strong className="text-foreground">Strategies</strong> in the sidebar and click
              <strong className="text-foreground"> New Strategy</strong>. You'll configure three types of signals:
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs text-primary font-bold">T</span>
                Technical Signals
              </h4>
              <p className="text-sm text-muted-foreground">
                <strong>RSI</strong> (Relative Strength Index) measures overbought/oversold conditions.
                <strong> SMA</strong> (Simple Moving Average) crossovers detect trend changes.
                Configure periods and thresholds to fine-tune sensitivity.
              </p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-xs text-emerald-500 font-bold">F</span>
                Fundamental Signals
              </h4>
              <p className="text-sm text-muted-foreground">
                Filters based on company financials: <strong>P/E ratio</strong> (valuation),
                <strong> revenue growth</strong>, and <strong>profit margins</strong>.
                These help you avoid overvalued or declining companies.
              </p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-purple-500/10 flex items-center justify-center text-xs text-purple-500 font-bold">S</span>
                Sentiment Signals
              </h4>
              <p className="text-sm text-muted-foreground">
                Analyzes news sentiment from Alpha Vantage. Positive news sentiment can boost a buy signal,
                while negative sentiment can trigger caution. Currently used in live trading signals only.
              </p>
            </div>
          </div>

          <InfoPanel variant="learn" title="Signal Weights">
            <p>
              Each signal type has a weight (Technical, Fundamental, Sentiment) that determines its influence
              on the final trading decision. The weights must add up to 100%. For example, 60% Technical /
              30% Fundamental / 10% Sentiment means technical indicators have the most say.
            </p>
          </InfoPanel>

          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h4 className="text-base font-semibold text-foreground">Risk Management</h4>
            <p>
              Every strategy includes risk parameters to protect your (simulated) capital:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong className="text-foreground">Stop-Loss</strong> — Automatically sell if a position drops by this percentage (e.g., -5%)</li>
              <li><strong className="text-foreground">Take-Profit</strong> — Automatically sell if a position gains by this percentage (e.g., +10%)</li>
              <li><strong className="text-foreground">Max Position Size</strong> — Maximum percentage of capital in a single stock</li>
              <li><strong className="text-foreground">Max Total Exposure</strong> — Maximum percentage of capital invested at once</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Backtesting */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Running Backtests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p>
              From a strategy's detail page, click <strong className="text-foreground">Run Backtest</strong>.
              The engine will simulate your strategy day-by-day over the selected time period using historical price data.
            </p>
          </div>

          <InfoPanel variant="tip" title="Choosing a Time Period">
            <p>
              Longer periods give more statistically meaningful results. A 1-year backtest captures different market
              conditions (bull markets, corrections, sideways trends). Start with 6 months to a year for your first tests.
            </p>
          </InfoPanel>

          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h4 className="text-base font-semibold text-foreground">Reading Your Results</h4>
            <p>After a backtest completes, you'll see:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong className="text-foreground">Equity Curve</strong> — Shows your portfolio value over time. An upward-sloping line is good.</li>
              <li><strong className="text-foreground">Drawdown Chart</strong> — Shows peak-to-trough declines. Shallower drawdowns mean a more stable strategy.</li>
              <li><strong className="text-foreground">Trade List</strong> — Every buy and sell with entry/exit prices, dates, and profit/loss.</li>
              <li><strong className="text-foreground">Metrics Bar</strong> — Key numbers like total return, Sharpe ratio, win rate, and max drawdown.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Understanding Key Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground text-sm">Total Return</h4>
              <p className="text-sm text-muted-foreground mt-1">
                The overall percentage gain or loss. If you started with $10,000 and ended at $11,500, that's a +15% total return.
              </p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground text-sm">Sharpe Ratio</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Risk-adjusted return. Above 1.0 = good, above 2.0 = very good. It measures how much return you get per unit of risk.
              </p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground text-sm">Max Drawdown</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Largest drop from a peak. A -20% drawdown means at one point you were down 20% from your highest value. Lower is better.
              </p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground text-sm">Win Rate</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Percentage of trades that were profitable. Note: a 40% win rate can still be profitable if winning trades are much larger than losing ones.
              </p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground text-sm">Profit Factor</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Total gross profits divided by total gross losses. Above 1.0 means profits exceed losses. Above 2.0 is considered strong.
              </p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground text-sm">Number of Trades</h4>
              <p className="text-sm text-muted-foreground mt-1">
                More trades give more statistical confidence. A strategy with only 3 trades may have gotten lucky; 30+ trades is more reliable.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparing Strategies */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comparing Strategies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p>
              The <strong className="text-foreground">Compare</strong> page lets you view backtest results
              side-by-side. Select two or more strategies to see how they stack up across all metrics.
            </p>
            <p>
              Every backtest automatically includes a <strong className="text-foreground">Buy & Hold</strong> benchmark —
              this shows what would have happened if you simply bought the stock and held it for the entire period.
              If your strategy doesn't beat Buy & Hold, it may not be adding value over passive investing.
            </p>
          </div>

          <InfoPanel variant="learn" title="Learning from Comparisons">
            <p>
              When comparing strategies, ask yourself: <em>Why did one strategy outperform the other?</em> Look at the
              signal attribution to understand which signals (technical, fundamental, sentiment) drove the decisions.
              This is where the real learning happens.
            </p>
          </InfoPanel>
        </CardContent>
      </Card>

      {/* AI Chat */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI Chat Assistant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p>
              Click the chat icon in the top-right corner of the dashboard to open the AI assistant.
              It can help you:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Understand trading concepts (RSI, moving averages, P/E ratios)</li>
              <li>Interpret your backtest results</li>
              <li>Get strategy improvement suggestions</li>
              <li>Learn about risk management principles</li>
            </ul>
          </div>

          <InfoPanel variant="tip" title="Getting the Best Answers">
            <p>
              Be specific in your questions. Instead of "Is my strategy good?", try "My strategy has a Sharpe ratio
              of 0.8 and a max drawdown of -25%. What does this mean and how can I improve it?"
            </p>
          </InfoPanel>
        </CardContent>
      </Card>

      {/* Account & Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account & Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p>
              The <strong className="text-foreground">Settings</strong> page shows your profile, subscription tier,
              and account status. From there you can:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>View your email and subscription tier</li>
              <li>See your active trading strategies (if any are activated for paper trading)</li>
              <li>Sign out of your account</li>
            </ul>
            <p className="mt-3">
              To reset your password, sign out and use the "Forgot password?" link on the login page.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <FaqSection items={faqs} />
        </CardContent>
      </Card>

      {/* Owner Administration — only visible to owner */}
      {isOwner && (
        <>
          <div className="pt-4">
            <h2 className="text-xl font-bold text-foreground">Owner Administration</h2>
            <p className="text-muted-foreground mt-1">
              Platform management documentation (visible only to you)
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Owner Setup */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs text-primary font-bold">1</span>
                  Owner Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  The owner role is set manually via the Supabase SQL Editor. It cannot be assigned through the dashboard UI.
                </p>
                <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs">
                  <p className="text-foreground">UPDATE user_profiles</p>
                  <p className="text-foreground">SET role = 'owner'</p>
                  <p className="text-foreground">WHERE email = 'your@email.com';</p>
                </div>
                <p>
                  Run this in <strong className="text-foreground">Supabase Dashboard &gt; SQL Editor</strong> after
                  creating your account through the normal signup flow with an invite code.
                </p>
              </CardContent>
            </Card>

            {/* Invite Code Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-xs text-emerald-500 font-bold">2</span>
                  Invite Code Management
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>Invite code lifecycle:</p>
                <ol className="list-decimal list-inside space-y-1.5">
                  <li><strong className="text-foreground">Create</strong> — Admin page &gt; generate a code with max uses, expiry date, and tier grant</li>
                  <li><strong className="text-foreground">Distribute</strong> — Copy the code and share it with prospective users</li>
                  <li><strong className="text-foreground">Monitor</strong> — Admin page shows usage count and status for each code</li>
                  <li><strong className="text-foreground">Retire</strong> — Delete or let codes expire when no longer needed</li>
                </ol>
                <p>
                  The <strong className="text-foreground">grants_tier</strong> field determines which subscription tier
                  new users receive. Server-side enforcement ensures invalid or expired codes are rejected at signup.
                </p>
              </CardContent>
            </Card>

            {/* User Onboarding */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-purple-500/10 flex items-center justify-center text-xs text-purple-500 font-bold">3</span>
                  User Onboarding
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>To invite a new user:</p>
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>Create an invite code on the Admin page</li>
                  <li>Share the code with the user</li>
                  <li>User visits the signup page and enters the code along with email/password</li>
                </ol>
                <p className="mt-2">What happens server-side when they sign up:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>A database trigger validates the invite code</li>
                  <li>The code's usage count is incremented</li>
                  <li>A user profile is created with the tier granted by the code</li>
                  <li>If the code is invalid, expired, or fully used, signup is rejected</li>
                </ul>
              </CardContent>
            </Card>

            {/* Platform Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-amber-500/10 flex items-center justify-center text-xs text-amber-500 font-bold">4</span>
                  Platform Management
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p><strong className="text-foreground">Viewing users:</strong></p>
                <p>Supabase Dashboard &gt; Table Editor &gt; <code className="bg-muted px-1 rounded">user_profiles</code></p>

                <p><strong className="text-foreground">Changing a user's tier:</strong></p>
                <p>Update the <code className="bg-muted px-1 rounded">subscription_tier</code> column directly in the table editor (free, basic, pro, premium).</p>

                <p><strong className="text-foreground">Password resets:</strong></p>
                <p>Users can reset their own passwords via the login page. If needed, you can also trigger a reset from Supabase Dashboard &gt; Authentication &gt; Users.</p>

                <p><strong className="text-foreground">Deactivating users:</strong></p>
                <p>In Supabase Dashboard &gt; Authentication &gt; Users, find the user and click "Ban user" to prevent login.</p>
              </CardContent>
            </Card>
          </div>

          {/* Trading Bot Operations */}
          <div className="pt-4">
            <h2 className="text-xl font-bold text-foreground">Trading Bot</h2>
            <p className="text-muted-foreground mt-1">
              Automated strategy execution via the standalone bot
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How the Bot Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoPanel variant="info" title="Execution Flow">
                <p>
                  The trading bot runs automatically on weekdays at 9:45 AM ET (15 minutes after market open).
                  It reads your active strategy, generates signals for each symbol, and places paper trades via Alpaca.
                  Results are logged here on the Activity page with full per-symbol signal details.
                </p>
              </InfoPanel>

              <div className="prose prose-sm max-w-none text-muted-foreground">
                <h4 className="text-base font-semibold text-foreground">Three Ways to Run</h4>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="text-lg">💻</span> Local
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Run <code className="bg-muted px-1 rounded text-xs">cd bot && npm run dry-run</code> on your machine.
                    Uses DEV Supabase. Good for testing code changes.
                  </p>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="text-lg">👆</span> Manual Trigger
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    GitHub Actions &gt; Trading Bot &gt; Run workflow. Choose DEV or PROD environment
                    and whether to dry-run. No laptop needed.
                  </p>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="text-lg">⏰</span> Daily Cron
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Runs automatically Mon-Fri at 9:45 AM ET against PROD.
                    Places real paper trades. Sends Telegram summary. Fully hands-off.
                  </p>
                </div>
              </div>

              <div className="prose prose-sm max-w-none text-muted-foreground">
                <h4 className="text-base font-semibold text-foreground">Telegram Notifications</h4>
                <p>Every run sends notifications to your Telegram with colored context tags:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li><span className="font-semibold text-foreground">🟢 PROD</span> / <span className="font-semibold text-foreground">🔵 DEV</span> — which database was used</li>
                  <li><span className="font-semibold text-foreground">⏰ Cron</span> / <span className="font-semibold text-foreground">👆 Manual</span> / <span className="font-semibold text-foreground">💻 Local</span> — how it was triggered</li>
                  <li><span className="font-semibold text-foreground">🟠 DRY RUN</span> — no real orders placed (shown only when active)</li>
                </ul>
              </div>

              <div className="prose prose-sm max-w-none text-muted-foreground">
                <h4 className="text-base font-semibold text-foreground">What DRY RUN Controls</h4>
                <p>
                  DRY RUN only skips placing Alpaca orders. Everything else runs normally — signals are generated,
                  execution logs are written, and Telegram notifications are sent. Your Activity page still gets populated.
                </p>
              </div>

              <InfoPanel variant="learn" title="Future: Bring Your Own Broker (BYOB)">
                <p>
                  Currently, all trades execute on the platform owner's Alpaca paper account.
                  In the future, users will be able to connect their own Alpaca paper trading credentials
                  and run strategies independently on their own accounts.
                </p>
              </InfoPanel>
            </CardContent>
          </Card>
        </>
      )}

      {/* Disclaimer */}
      <InfoPanel variant="info" title="Disclaimer">
        <p>
          NATN Lab is an educational platform. All trading is simulated (paper trading). Nothing on this platform
          constitutes financial advice. Past backtest performance does not guarantee future results. Always consult
          a qualified financial advisor before making investment decisions with real money.
        </p>
      </InfoPanel>
    </div>
  )
}
