/**
 * Terms of Use page.
 */

import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-6 inline-block">
          &larr; Back to Home
        </Link>

        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Terms of Use</h1>

          <div className="prose prose-gray max-w-none space-y-4 text-sm text-gray-700">
            <p><strong>Last Updated:</strong> January 2026</p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6">1. Educational Purpose</h2>
            <p>
              NATN Lab is an educational platform for learning about trading strategies,
              technical analysis, and market concepts. All features including backtesting
              and strategy building are for educational and research purposes only.
            </p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6">2. Not Financial Advice</h2>
            <p>
              Nothing on this platform constitutes financial advice, investment recommendations,
              or solicitation to buy or sell securities. Past performance in backtesting does
              not guarantee future results. Always consult a qualified financial advisor before
              making investment decisions.
            </p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6">3. Paper Trading Only</h2>
            <p>
              NATN Lab operates exclusively with simulated (paper) trading. No real money
              is at risk. Users understand that simulation results may differ significantly
              from real-world trading due to slippage, liquidity, fees, and market impact.
            </p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6">4. User Responsibilities</h2>
            <p>
              Users are responsible for maintaining the confidentiality of their account
              credentials and for all activities under their account.
            </p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6">5. Limitation of Liability</h2>
            <p>
              NATN Lab and its operators are not liable for any financial losses incurred
              from acting on information obtained through this platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
