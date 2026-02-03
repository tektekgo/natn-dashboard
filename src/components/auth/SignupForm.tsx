/**
 * Sign up form component.
 * Registration with optional invite code.
 */

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SignupFormProps {
  onSuccess?: () => void
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const result = await signUp(email, password, inviteCode || undefined)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        onSuccess?.()
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="text-4xl mb-4">&#9989;</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Account created!</h3>
        <p className="text-muted-foreground">
          Please check your email to confirm your account.
          You'll be able to sign in once confirmed.
        </p>
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
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          placeholder="At least 6 characters"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          placeholder="Confirm your password"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="invite-code">
          Invite Code <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="invite-code"
          type="text"
          value={inviteCode}
          onChange={e => setInviteCode(e.target.value)}
          placeholder="Enter invite code"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  )
}
