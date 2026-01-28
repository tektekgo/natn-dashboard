/**
 * Login page.
 */

import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true })
    }
  }, [user, navigate, from])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <img
              src="/natnlab-logo+name-svg.svg"
              alt="NATN Lab"
              className="h-12 mx-auto mb-4"
            />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600 mt-1">Sign in to your NATN Lab account</p>
        </div>

        <div className="card">
          <LoginForm onSuccess={() => navigate(from, { replace: true })} />
        </div>

        <p className="text-center mt-6 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
