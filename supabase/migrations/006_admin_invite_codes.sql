-- Migration: Admin invite code management
-- Adds grants_tier column and delete policy for admins

-- Add grants_tier column to invite_codes
ALTER TABLE invite_codes
  ADD COLUMN IF NOT EXISTS grants_tier TEXT NOT NULL DEFAULT 'free';

-- Allow admins/owners to delete invite codes
CREATE POLICY "Admins can delete invite codes"
  ON invite_codes FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')
  ));
