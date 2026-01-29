/**
 * Settings page.
 * Profile, trading status, and API key management.
 */

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import InfoPanel from '@/components/common/InfoPanel'

interface ActiveStrategy {
  name: string
  trading_mode: string
  last_execution_at: string | null
  execution_status: string | null
  activated_at: string | null
}

export default function SettingsPage() {
  const { profile, user, isOwner } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeStrategy, setActiveStrategy] = useState<ActiveStrategy | null>(null)

  useEffect(() => {
    if (!user || !isOwner) return

    async function loadActiveStrategy() {
      const { data } = await supabase
        .from('strategies')
        .select('name, trading_mode, last_execution_at, execution_status, activated_at')
        .eq('user_id', user!.id)
        .neq('trading_mode', 'none')
        .limit(1)
        .single()

      if (data) {
        setActiveStrategy(data as unknown as ActiveStrategy)
      }
    }

    loadActiveStrategy()
  }, [user, isOwner])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setSaved(false)

    await supabase
      .from('user_profiles')
      .update({ display_name: displayName || null })
      .eq('id', user.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your profile and preferences.</p>
      </div>

      <InfoPanel variant="info" title="About Your Account">
        <p>
          Your NATN Lab account stores your strategies, backtest results, and preferences.
          Your display name is shown in the header and strategy reports.
          All data is private to your account.
        </p>
      </InfoPanel>

      {/* Profile */}
      <Card title="Profile">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Email"
            value={user?.email || ''}
            disabled
            className="bg-gray-50"
          />
          <Input
            label="Display Name"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Your display name"
          />
          <div className="flex items-center gap-3">
            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
            {saved && <span className="text-sm text-green-600">Saved!</span>}
          </div>
        </form>
      </Card>

      {/* Trading Status (Owner Only) */}
      {isOwner ? (
        <Card title="Trading Status">
          <div className="space-y-3">
            <InfoPanel variant="info" title="Your Trading Bot">
              <p>
                The NATN trading bot runs every 30 minutes, executing your active strategy on your Alpaca
                paper trading account. Activate a strategy from the Strategies page to start trading.
              </p>
            </InfoPanel>
            {activeStrategy ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Active Strategy</span>
                  <span className="font-medium text-gray-900">{activeStrategy.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Mode</span>
                  <span className={`font-medium capitalize ${
                    activeStrategy.trading_mode === 'paper' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {activeStrategy.trading_mode} Trading
                  </span>
                </div>
                {activeStrategy.activated_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Activated</span>
                    <span className="font-medium">{new Date(activeStrategy.activated_at).toLocaleDateString()}</span>
                  </div>
                )}
                {activeStrategy.last_execution_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Execution</span>
                    <span className="font-medium">{new Date(activeStrategy.last_execution_at).toLocaleString()}</span>
                  </div>
                )}
                {activeStrategy.execution_status && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-medium ${
                      activeStrategy.execution_status === 'success' ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {activeStrategy.execution_status}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No strategy is currently active for trading. Go to Strategies to activate one.
              </p>
            )}
          </div>
        </Card>
      ) : (
        <Card title="Trading Status">
          <InfoPanel variant="info" title="Trading Features">
            <p>
              Automated paper trading features are available for owner accounts.
              You can use NATN Lab to build and backtest strategies to learn about trading concepts.
            </p>
          </InfoPanel>
        </Card>
      )}

      {/* Account Info */}
      <Card title="Account">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Plan</span>
            <span className="font-medium capitalize">{profile?.subscription_tier || 'Free'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Role</span>
            <span className="font-medium capitalize">{profile?.role || 'User'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Member Since</span>
            <span className="font-medium">
              {profile ? new Date(profile.created_at).toLocaleDateString() : '-'}
            </span>
          </div>
        </div>
      </Card>

      {/* API Keys Info */}
      <Card title="API Keys">
        <div className="text-sm text-gray-600 space-y-3">
          <InfoPanel variant="tip" title="What are API Keys?">
            <p>
              API keys connect NATN Lab to external data providers. <strong>Alpaca</strong> provides historical
              stock price data and paper trading execution. <strong>FMP (Financial Modeling Prep)</strong> provides
              fundamental company data like P/E ratios and earnings. These keys are managed by administrators.
            </p>
          </InfoPanel>
          <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs">
            <p>VITE_ALPACA_API_KEY: {import.meta.env.VITE_ALPACA_API_KEY ? 'configured' : 'not set'}</p>
            <p>VITE_ALPACA_API_SECRET: {import.meta.env.VITE_ALPACA_API_SECRET ? 'configured' : 'not set'}</p>
            <p>VITE_FMP_API_KEY: {import.meta.env.VITE_FMP_API_KEY ? 'configured' : 'not set'}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
