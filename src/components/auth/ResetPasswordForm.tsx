/**
 * Password reset form component.
 * Two states: (1) enter email to send reset link, (2) enter new password after clicking link.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPasswordForm() {
  const { isPasswordRecovery, resetPassword, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSendReset(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await resetPassword(email)
      if (result.error) {
        setError(result.error)
      } else {
        setEmailSent(true)
      }
    } catch {
      setError('Unable to connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    try {
      const result = await updatePassword(newPassword)
      if (result.error) {
        setError(result.error)
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch {
      setError('Unable to connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // State 2: User clicked the reset link — show new password form
  if (isPasswordRecovery) {
    return (
      <form onSubmit={handleUpdatePassword} className="space-y-4">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            minLength={6}
            placeholder="At least 6 characters"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-new-password">Confirm New Password</Label>
          <Input
            id="confirm-new-password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Confirm your new password"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Updating password...' : 'Update Password'}
        </Button>
      </form>
    )
  }

  // State 1b: Email sent confirmation
  if (emailSent) {
    return (
      <div className="text-center">
        <div className="text-4xl mb-4">&#9993;</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Check your email</h3>
        <p className="text-muted-foreground">
          If an account exists for <strong>{email}</strong>, we sent a password reset link.
          Click the link in the email to set a new password.
        </p>
        <Button
          variant="link"
          onClick={() => setEmailSent(false)}
          className="mt-4"
        >
          Try a different email
        </Button>
      </div>
    )
  }

  // State 1a: Enter email to request reset
  return (
    <form onSubmit={handleSendReset} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Sending...' : 'Send Reset Link'}
      </Button>
    </form>
  )
}
