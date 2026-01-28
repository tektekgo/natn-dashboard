/**
 * Login form component.
 * Supports email/password and magic link authentication.
 */

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

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
    } finally {
      setLoading(false)
    }
  }

  if (magicLinkSent) {
    return (
      <div className="text-center">
        <div className="text-4xl mb-4">&#9993;</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h3>
        <p className="text-gray-600">
          We sent a magic link to <strong>{email}</strong>.
          Click the link in the email to sign in.
        </p>
        <button
          onClick={() => setMagicLinkSent(false)}
          className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          Try a different method
        </button>
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
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          placeholder="you@example.com"
        />
      </div>

      {mode === 'password' && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="Your password"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Signing in...' : mode === 'password' ? 'Sign In' : 'Send Magic Link'}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setMode(mode === 'password' ? 'magic' : 'password')}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          {mode === 'password' ? 'Sign in with magic link instead' : 'Sign in with password instead'}
        </button>
      </div>
    </form>
  )
}
