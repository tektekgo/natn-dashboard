/**
 * Sign up page.
 */

import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import SignupForm from '@/components/auth/SignupForm'
import Footer from '@/components/layout/Footer'

export default function SignupPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-slate-50 to-slate-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/">
              <img
                src="/natnlab-logo+name-svg.svg"
                alt="NATN Lab"
                className="h-14 mx-auto mb-4"
              />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create your account</h1>
            <p className="text-gray-600 mt-1">Start building and testing trading strategies</p>
          </div>

          <div className="card shadow-elevated">
            <SignupForm />
          </div>

          <p className="text-center mt-6 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
