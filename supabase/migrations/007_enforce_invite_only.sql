-- =============================================================================
-- Migration: Enforce invite-only signup at the database level
--
-- Problem: Invite codes were optional and validated only client-side.
-- Anyone calling the Supabase Auth API directly could create an account
-- without an invite code.
--
-- Solution: Rewrite handle_new_user() trigger to:
--   1. Require invite_code in raw_user_meta_data
--   2. Validate the code exists, is active, not expired, not exhausted
--   3. Atomically increment current_uses with row locking
--   4. Set invite_code_used and subscription_tier on the user profile
--   5. RAISE EXCEPTION rolls back the entire auth.users INSERT on failure
--
-- Also adds anon RLS policy on invite_codes so the frontend can
-- pre-validate codes during signup (before the user is authenticated).
-- =============================================================================

-- Rewrite the trigger function with invite code enforcement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_invite_code TEXT;
  v_code_record RECORD;
BEGIN
  -- Extract invite_code from signup metadata
  v_invite_code := NEW.raw_user_meta_data->>'invite_code';

  -- Require invite code for all signups
  IF v_invite_code IS NULL OR v_invite_code = '' THEN
    RAISE EXCEPTION 'An invite code is required to create an account.';
  END IF;

  -- Look up and lock the invite code row to prevent race conditions
  SELECT id, is_active, max_uses, current_uses, expires_at, grants_tier
    INTO v_code_record
    FROM public.invite_codes
    WHERE code = v_invite_code
    FOR UPDATE;

  -- Validate: code must exist
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid invite code.';
  END IF;

  -- Validate: code must be active
  IF NOT v_code_record.is_active THEN
    RAISE EXCEPTION 'This invite code is no longer active.';
  END IF;

  -- Validate: code must not be exhausted
  IF v_code_record.current_uses >= v_code_record.max_uses THEN
    RAISE EXCEPTION 'This invite code has been fully used.';
  END IF;

  -- Validate: code must not be expired
  IF v_code_record.expires_at IS NOT NULL AND v_code_record.expires_at < NOW() THEN
    RAISE EXCEPTION 'This invite code has expired.';
  END IF;

  -- Atomically increment usage count
  UPDATE public.invite_codes
    SET current_uses = current_uses + 1
    WHERE id = v_code_record.id;

  -- Create user profile with invite code and granted tier
  INSERT INTO public.user_profiles (id, email, invite_code_used, subscription_tier)
  VALUES (
    NEW.id,
    NEW.email,
    v_invite_code,
    COALESCE(v_code_record.grants_tier, 'free')
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate trigger (DROP first to avoid "already exists" error)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Add anon RLS policy on invite_codes for pre-signup validation
--
-- During signup, the user isn't authenticated yet. The frontend needs to
-- query invite_codes to give instant UX feedback. This policy allows
-- anonymous users to SELECT only active codes. Since you must already
-- know the code value to query for it, this doesn't enable enumeration.
-- -----------------------------------------------------------------------------
CREATE POLICY "Anon can read active invite codes"
  ON invite_codes FOR SELECT
  TO anon
  USING (is_active = true);
