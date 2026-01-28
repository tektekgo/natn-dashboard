/**
 * Sign up form component.
 * Registration with optional invite code.
 */

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Account created!</h3>
        <p className="text-gray-600">
          Please check your email to confirm your account.
          You'll be able to sign in once confirmed.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          placeholder="At least 6 characters"
        />
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          placeholder="Confirm your password"
        />
      </div>

      <div>
        <label htmlFor="invite-code" className="block text-sm font-medium text-gray-700 mb-1">
          Invite Code <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="invite-code"
          type="text"
          value={inviteCode}
          onChange={e => setInviteCode(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          placeholder="Enter invite code"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  )
}
