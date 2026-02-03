-- =============================================================================
-- NATN Lab - Invite Code RPC Function
-- =============================================================================

-- Increment invite code usage counter atomically
-- Called from AuthContext after successful signup with an invite code
CREATE OR REPLACE FUNCTION increment_invite_uses(code_value TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE invite_codes
  SET current_uses = current_uses + 1
  WHERE code = code_value
    AND is_active = true
    AND current_uses < max_uses;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
