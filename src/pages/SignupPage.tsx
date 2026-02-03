/**
 * Sign up page.
 */

import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import SignupForm from '@/components/auth/SignupForm'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/card'

export default function SignupPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/50 via-background to-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/">
              <img
                src="/natnlab-logo+name-svg.svg"
                alt="NATN Lab"
                className="h-14 mx-auto mb-4 dark:brightness-0 dark:invert"
              />
            </Link>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Create your account</h1>
            <p className="text-muted-foreground mt-1">Start building and testing trading strategies</p>
          </div>

          <Card className="shadow-elevated">
            <CardContent className="pt-6">
              <SignupForm />
            </CardContent>
          </Card>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
