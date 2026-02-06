/**
 * Password reset page.
 * Handles both requesting a reset link and setting a new password.
 */

import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/card'

export default function ResetPasswordPage() {
  const { isPasswordRecovery } = useAuth()

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
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {isPasswordRecovery ? 'Set new password' : 'Reset your password'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isPasswordRecovery
                ? 'Enter your new password below'
                : 'Enter your email and we\'ll send you a reset link'}
            </p>
          </div>

          <Card className="shadow-elevated">
            <CardContent className="pt-6">
              <ResetPasswordForm />
            </CardContent>
          </Card>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Remember your password?{' '}
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
