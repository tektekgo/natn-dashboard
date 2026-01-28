/**
 * Agreements & Guidelines page.
 */

import { Link } from 'react-router-dom'

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-6 inline-block">
          &larr; Back to Home
        </Link>

        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Agreements & Guidelines</h1>

          <div className="prose prose-gray max-w-none space-y-4 text-sm text-gray-700">
            <p><strong>Last Updated:</strong> January 2026</p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6">Community Guidelines</h2>
            <p>
              NATN Lab is a learning community. Users are expected to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the platform for educational purposes</li>
              <li>Not misrepresent backtest results as real trading performance</li>
              <li>Respect other users and their strategies</li>
              <li>Report any bugs or security issues responsibly</li>
            </ul>

            <h2 className="text-lg font-semibold text-gray-900 mt-6">Acceptable Use</h2>
            <p>Users agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the platform for market manipulation or fraud</li>
              <li>Attempt to bypass security measures or access others' data</li>
              <li>Abuse API rate limits or scrape data for commercial use</li>
              <li>Present educational backtesting results as investment advice</li>
            </ul>

            <h2 className="text-lg font-semibold text-gray-900 mt-6">Risk Acknowledgment</h2>
            <p>
              By using NATN Lab, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Trading involves significant risk of loss</li>
              <li>Backtest results do not predict future performance</li>
              <li>This platform is for education, not financial advice</li>
              <li>You are solely responsible for your investment decisions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
