/**
 * Dashboard header bar.
 * Clean professional header with user avatar and sign out.
 */

import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  // Build user initials for avatar
  const displayName = profile?.display_name || user?.email || ''
  const initials = displayName
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join('')

  return (
    <header className="bg-white border-b border-gray-200/80 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-sm text-primary-600 font-bold uppercase tracking-wider">
          NATN Lab
        </h2>
        <span className="hidden sm:inline-block text-xs bg-primary-50 text-primary-600 font-semibold px-2 py-0.5 rounded-full">
          {profile?.subscription_tier === 'pro' ? 'Pro' : 'Beta'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <>
            {/* User info + avatar */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">
                  {profile?.display_name || user.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {profile?.subscription_tier || 'free'} plan
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {initials || '?'}
              </div>
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-gray-200" />

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-900 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </header>
  )
}
