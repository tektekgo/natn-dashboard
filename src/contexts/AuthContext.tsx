/**
 * Authentication context provider.
 * Manages auth state and provides it to the component tree.
 */

import { createContext, useEffect, useState, type ReactNode } from 'react'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database'

export interface AuthContextValue {
  user: SupabaseUser | null
  profile: Tables<'user_profiles'> | null
  session: Session | null
  loading: boolean
  isOwner: boolean
  isPasswordRecovery: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, inviteCode: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
  updatePassword: (newPassword: string) => Promise<{ error?: string }>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Tables<'user_profiles'> | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  // Load initial session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) {
        fetchProfile(s.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, s) => {
        setSession(s)
        setUser(s?.user ?? null)
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true)
        }
        if (s?.user) {
          fetchProfile(s.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    setProfile(data)
  }

  async function handleSignIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message }
  }

  async function handleSignInWithMagicLink(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${import.meta.env.VITE_APP_URL}/dashboard`,
      },
    })
    return { error: error?.message }
  }

  async function handleSignUp(email: string, password: string, inviteCode: string) {
    // Early return if invite code is blank
    if (!inviteCode.trim()) {
      return { error: 'An invite code is required to create an account.' }
    }

    // Client-side pre-validation for UX (real enforcement is the DB trigger)
    const { data: codeData, error: codeError } = await supabase
      .from('invite_codes')
      .select('id, max_uses, current_uses, is_active, expires_at')
      .eq('code', inviteCode)
      .single()

    if (codeError || !codeData) {
      return { error: 'Invalid invite code.' }
    }
    if (!codeData.is_active) {
      return { error: 'This invite code is no longer active.' }
    }
    if (codeData.current_uses >= codeData.max_uses) {
      return { error: 'This invite code has been fully used.' }
    }
    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      return { error: 'This invite code has expired.' }
    }

    // Pass invite_code in metadata so the DB trigger can read it
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${import.meta.env.VITE_APP_URL}/dashboard`,
        data: { invite_code: inviteCode },
      },
    })

    if (error) {
      return { error: error.message }
    }

    // The DB trigger handles: invite code validation, incrementing usage,
    // creating user_profiles with invite_code_used and subscription_tier.
    // No post-signup RPC or update calls needed.

    return { error: undefined }
  }

  async function handleResetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.VITE_APP_URL}/reset-password`,
    })
    return { error: error?.message }
  }

  async function handleUpdatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (!error) {
      setIsPasswordRecovery(false)
    }
    return { error: error?.message }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
    setIsPasswordRecovery(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isOwner: profile?.role === 'owner',
        isPasswordRecovery,
        signIn: handleSignIn,
        signInWithMagicLink: handleSignInWithMagicLink,
        signUp: handleSignUp,
        signOut: handleSignOut,
        resetPassword: handleResetPassword,
        updatePassword: handleUpdatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
