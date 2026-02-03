/**
 * Privacy Policy page.
 */

import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-primary hover:text-primary/80 text-sm font-medium mb-6 inline-block">
          &larr; Back to Home
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none space-y-4 text-muted-foreground">
              <p><strong className="text-foreground">Last Updated:</strong> January 2026</p>

              <h2 className="text-lg font-semibold text-foreground mt-6">1. Information We Collect</h2>
              <p>
                We collect your email address for authentication, and store strategy configurations
                and backtest results you create. We do not collect financial account information
                or real trading data.
              </p>

              <h2 className="text-lg font-semibold text-foreground mt-6">2. How We Use Your Data</h2>
              <p>
                Your data is used solely to provide the NATN Lab service: account management,
                strategy storage, and backtest result persistence. We do not sell or share
                your personal data with third parties.
              </p>

              <h2 className="text-lg font-semibold text-foreground mt-6">3. Data Storage</h2>
              <p>
                Data is stored securely using Supabase (PostgreSQL) with row-level security
                policies ensuring you can only access your own data.
              </p>

              <h2 className="text-lg font-semibold text-foreground mt-6">4. Third-Party Services</h2>
              <p>
                We use Alpaca Markets for historical price data and Financial Modeling Prep
                for fundamental data. These services receive stock symbol queries but no
                personal user information.
              </p>

              <h2 className="text-lg font-semibold text-foreground mt-6">5. Data Deletion</h2>
              <p>
                You may request deletion of your account and all associated data by contacting
                the platform administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
