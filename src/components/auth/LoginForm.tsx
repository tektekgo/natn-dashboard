/**
 * Login form component.
 * Supports email/password and magic link authentication.
 */

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LoginFormProps {
  onSuccess?: () => void
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { signIn, signInWithMagicLink } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [mode, setMode] = useState<'password' | 'magic'>('password')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'password') {
        const result = await signIn(email, password)
        if (result.error) {
          setError(result.error)
        } else {
          onSuccess?.()
        }
      } else {
        const result = await signInWithMagicLink(email)
        if (result.error) {
          setError(result.error)
        } else {
          setMagicLinkSent(true)
        }
      }
    } catch {
      setError('Unable to connect to the server. Please check your internet connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (magicLinkSent) {
    return (
      <div className="text-center">
        <div className="text-4xl mb-4">&#9993;</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Check your email</h3>
        <p className="text-muted-foreground">
          We sent a magic link to <strong>{email}</strong>.
          Click the link in the email to sign in.
        </p>
        <Button
          variant="link"
          onClick={() => setMagicLinkSent(false)}
          className="mt-4"
        >
          Try a different method
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />
      </div>

      {mode === 'password' && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Your password"
          />
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Signing in...' : mode === 'password' ? 'Sign In' : 'Send Magic Link'}
      </Button>

      <div className="text-center">
        <Button
          type="button"
          variant="link"
          onClick={() => setMode(mode === 'password' ? 'magic' : 'password')}
        >
          {mode === 'password' ? 'Sign in with magic link instead' : 'Sign in with password instead'}
        </Button>
      </div>
    </form>
  )
}
