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
 * Optionally validates an invite code.
 */
export async function signUp(
  email: string,
  password: string,
  inviteCode?: string
): Promise<AuthResult> {
  // Validate invite code if provided
  if (inviteCode) {
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
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${import.meta.env.VITE_APP_URL}/dashboard`,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Update invite code usage if one was provided
  if (inviteCode && data.user) {
    await supabase
      .from('invite_codes')
      .update({
        current_uses: (await supabase
          .from('invite_codes')
          .select('current_uses')
          .eq('code', inviteCode)
          .single()
        ).data?.current_uses ?? 0 + 1,
      })
      .eq('code', inviteCode)

    // Store invite code on user profile
    await supabase
      .from('user_profiles')
      .update({ invite_code_used: inviteCode })
      .eq('id', data.user.id)
  }

  return { success: true, user: data.user ?? undefined }
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
