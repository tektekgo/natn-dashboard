/**
 * Dashboard header bar.
 * Clean professional header with user avatar, theme toggle, and sign out.
 */

import { MessageSquare } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAiChatContext } from '@/hooks/useAiChatContext'
import { useNavigate } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export default function Header() {
  const { user, profile, signOut } = useAuth()
  const { isOpen, setIsOpen } = useAiChatContext()
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
    <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-sm text-primary font-bold uppercase tracking-wider">
          NATN Lab
        </h2>
        <Badge variant="secondary" className="hidden sm:inline-flex">
          {profile?.subscription_tier === 'pro' ? 'Pro' : 'Beta'}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="h-9 w-9"
          title="AI Assistant"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>

        {user && (
          <>
            <Separator orientation="vertical" className="h-6" />

            {/* User info + avatar */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">
                  {profile?.display_name || user.email}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {profile?.subscription_tier || 'free'} plan
                </p>
              </div>
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-700 text-white text-xs font-bold">
                  {initials || '?'}
                </AvatarFallback>
              </Avatar>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Sign out */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
