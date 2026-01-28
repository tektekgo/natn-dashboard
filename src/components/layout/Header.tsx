/**
 * Dashboard header bar.
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

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div>
        <h2 className="text-sm font-medium text-gray-500">NATN Lab</h2>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {profile?.display_name || user.email}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {profile?.subscription_tier || 'free'} plan
              </p>
            </div>

            <div className="relative">
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
