/**
 * Login page.
 */

import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/card'

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50/50 via-background to-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/">
              <img
                src="/natnlab-logo+name.png"
                alt="NATN Lab"
                className="h-56 mx-auto mb-6 dark:brightness-0 dark:invert"
              />
            </Link>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground mt-1">Sign in to your <span className="text-orange-500">N</span>ATN Lab account</p>
          </div>

          <Card className="shadow-elevated">
            <CardContent className="pt-6">
              <LoginForm onSuccess={() => navigate(from, { replace: true })} />
            </CardContent>
          </Card>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-primary/80 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
