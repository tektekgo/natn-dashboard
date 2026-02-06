/**
 * Dashboard header bar.
 * Clean professional header with user avatar, theme toggle, and sign out.
 */

import { Bot, Sparkles } from 'lucide-react'
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
    <header className="bg-gradient-to-r from-card via-card to-primary/5 border-b border-border px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-sm bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent font-bold uppercase tracking-wider">
          NATN Lab
        </h2>
        <Badge className="hidden sm:inline-flex bg-gradient-to-r from-primary/20 to-cyan-500/20 text-primary border-primary/30 hover:from-primary/30 hover:to-cyan-500/30">
          {profile?.subscription_tier === 'pro' ? 'Pro' : 'Beta'}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        {/* AI Assistant Button - Colorful CTA */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative group flex items-center gap-2 px-3 py-2 rounded-full
            bg-gradient-to-r from-primary to-cyan-500
            text-white text-sm font-medium
            shadow-lg shadow-primary/25
            hover:shadow-xl hover:shadow-primary/30
            hover:scale-105
            transition-all duration-200
            ${isOpen ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background' : ''}
          `}
          title="General AI Assistant — Ask any question about trading strategies, concepts, or get help anytime"
        >
          <Bot className="h-4 w-4" />
          <span className="hidden sm:inline">Ask AI</span>
          <Sparkles className="h-3 w-3 opacity-75" />

          {/* Subtle pulse animation */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-cyan-500 animate-ping opacity-20 pointer-events-none" />
        </button>

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
