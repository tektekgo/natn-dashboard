/**
 * Privacy Policy page.
 */

import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-6 inline-block">
          &larr; Back to Home
        </Link>

        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Privacy Policy</h1>

          <div className="prose prose-gray max-w-none space-y-4 text-sm text-gray-700">
            <p><strong>Last Updated:</strong> January 2026</p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6">1. Information We Collect</h2>
            <p>
              We collect your email address for authentication, and store strategy configurations
              and backtest results you create. We do not collect financial account information
              or real trading data.
            </p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6">2. How We Use Your Data</h2>
            <p>
              Your data is used solely to provide the NATN Lab service: account management,
              strategy storage, and backtest result persistence. We do not sell or share
              your personal data with third parties.
            </p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6">3. Data Storage</h2>
            <p>
              Data is stored securely using Supabase (PostgreSQL) with row-level security
              policies ensuring you can only access your own data.
            </p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6">4. Third-Party Services</h2>
            <p>
              We use Alpaca Markets for historical price data and Financial Modeling Prep
              for fundamental data. These services receive stock symbol queries but no
              personal user information.
            </p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6">5. Data Deletion</h2>
            <p>
              You may request deletion of your account and all associated data by contacting
              the platform administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
