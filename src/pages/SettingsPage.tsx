/**
 * Settings page.
 * Profile and API key management.
 */

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'

export default function SettingsPage() {
  const { profile, user } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

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
          <p>
            API keys for Alpaca and FMP are configured via environment variables.
            Contact an administrator to update API key settings.
          </p>
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
