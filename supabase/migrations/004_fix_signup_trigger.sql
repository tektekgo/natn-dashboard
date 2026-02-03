-- =============================================================================
-- Fix: handle_new_user() trigger must use public schema explicitly
--
-- The trigger fires from auth.users (in the auth schema). Without an explicit
-- search_path, the function can't find public.user_profiles, causing:
--   "Database error saving user" (Supabase Auth 500)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate trigger (DROP first to avoid "already exists" error)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
