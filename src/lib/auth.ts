/**
 * Authentication helpers wrapping Supabase Auth.
 */

import { supabase } from './supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface AuthResult {
  success: boolean
  error?: string
  user?: SupabaseUser
}

/**
 * Sign in with email and password.
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, user: data.user ?? undefined }
}

/**
 * Sign in with magic link (passwordless).
 */
export async function signInWithMagicLink(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${import.meta.env.VITE_APP_URL}/dashboard`,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Sign up with email and password.
 * Requires a valid invite code (enforced server-side by DB trigger).
 */
export async function signUp(
  email: string,
  password: string,
  inviteCode: string
): Promise<AuthResult> {
  if (!inviteCode.trim()) {
    return { success: false, error: 'An invite code is required to create an account.' }
  }

  // Client-side pre-validation for UX (real enforcement is the DB trigger)
  const { data: codeData, error: codeError } = await supabase
    .from('invite_codes')
    .select('id, max_uses, current_uses, is_active, expires_at')
    .eq('code', inviteCode)
    .single()

  if (codeError || !codeData) {
    return { success: false, error: 'Invalid invite code.' }
  }

  if (!codeData.is_active) {
    return { success: false, error: 'This invite code is no longer active.' }
  }

  if (codeData.current_uses >= codeData.max_uses) {
    return { success: false, error: 'This invite code has been fully used.' }
  }

  if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
    return { success: false, error: 'This invite code has expired.' }
  }

  // Pass invite_code in metadata so the DB trigger can read it
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${import.meta.env.VITE_APP_URL}/dashboard`,
      data: { invite_code: inviteCode },
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // The DB trigger handles: invite code validation, incrementing usage,
  // creating user_profiles with invite_code_used and subscription_tier.

  return { success: true, user: data.user ?? undefined }
}

/**
 * Send a password reset email.
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${import.meta.env.VITE_APP_URL}/reset-password`,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Update the current user's password (used after clicking reset link).
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

/**
 * Get the current authenticated user.
 */
export async function getUser(): Promise<SupabaseUser | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Get the current session.
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
