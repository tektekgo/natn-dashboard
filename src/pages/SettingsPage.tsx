/**
 * Settings page.
 * Profile, trading status, and API key management.
 */

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InfoPanel } from '@/components/ui/info-panel'

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
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and preferences.</p>
      </div>

      <InfoPanel variant="info" title="About Your Account">
        <p>
          Your NATN Lab account stores your strategies, backtest results, and preferences.
          Your display name is shown in the header and strategy reports.
          All data is private to your account.
        </p>
      </InfoPanel>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Your display name"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" loading={saving}>
                Save Changes
              </Button>
              {saved && <span className="text-sm text-success">Saved!</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Trading Status (Owner Only) */}
      {isOwner ? (
        <Card>
          <CardHeader>
            <CardTitle>Trading Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoPanel variant="info" title="Your Trading Bot">
              <p>
                The NATN trading bot runs every 30 minutes, executing your active strategy on your Alpaca
                paper trading account. Activate a strategy from the Strategies page to start trading.
              </p>
            </InfoPanel>
            {activeStrategy ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Strategy</span>
                  <span className="font-medium text-foreground">{activeStrategy.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mode</span>
                  <span className={`font-medium capitalize ${
                    activeStrategy.trading_mode === 'paper' ? 'text-success' : 'text-destructive'
                  }`}>
                    {activeStrategy.trading_mode} Trading
                  </span>
                </div>
                {activeStrategy.activated_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Activated</span>
                    <span className="font-medium">{new Date(activeStrategy.activated_at).toLocaleDateString()}</span>
                  </div>
                )}
                {activeStrategy.last_execution_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Execution</span>
                    <span className="font-medium">{new Date(activeStrategy.last_execution_at).toLocaleString()}</span>
                  </div>
                )}
                {activeStrategy.execution_status && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`font-medium ${
                      activeStrategy.execution_status === 'success' ? 'text-success' : 'text-destructive'
                    }`}>
                      {activeStrategy.execution_status}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No strategy is currently active for trading. Go to Strategies to activate one.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Trading Status</CardTitle>
          </CardHeader>
          <CardContent>
            <InfoPanel variant="info" title="Trading Features">
              <p>
                Automated paper trading features are available for owner accounts.
                You can use NATN Lab to build and backtest strategies to learn about trading concepts.
              </p>
            </InfoPanel>
          </CardContent>
        </Card>
      )}

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium capitalize">{profile?.subscription_tier || 'Free'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium capitalize">{profile?.role || 'User'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member Since</span>
              <span className="font-medium">
                {profile ? new Date(profile.created_at).toLocaleDateString() : '-'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys Info */}
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoPanel variant="tip" title="What are API Keys?">
            <p>
              API keys connect NATN Lab to external data providers. <strong>Alpaca</strong> provides historical
              stock price data and paper trading execution. <strong>FMP (Financial Modeling Prep)</strong> provides
              fundamental company data like P/E ratios and earnings. These keys are managed by administrators.
            </p>
          </InfoPanel>
          <div className="bg-muted rounded-lg p-3 font-mono text-xs">
            <p>VITE_ALPACA_API_KEY: {import.meta.env.VITE_ALPACA_API_KEY ? 'configured' : 'not set'}</p>
            <p>VITE_ALPACA_API_SECRET: {import.meta.env.VITE_ALPACA_API_SECRET ? 'configured' : 'not set'}</p>
            <p>VITE_FMP_API_KEY: {import.meta.env.VITE_FMP_API_KEY ? 'configured' : 'not set'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
