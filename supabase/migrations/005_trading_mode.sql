-- Migration 005: Add trading_mode to strategies table
-- Supports owner-only paper trading activation (and future live trading)

-- Add trading_mode column (replaces the semantic use of is_active for trading)
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS trading_mode TEXT NOT NULL DEFAULT 'none'
  CHECK (trading_mode IN ('none', 'paper', 'live'));

-- Track when a strategy was activated for trading
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ;

-- Track last time the n8n bot executed this strategy
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS last_execution_at TIMESTAMPTZ;

-- Track execution status from the bot ('success', 'error', 'no_signal')
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS execution_status TEXT;

-- Index for the n8n bot to quickly find the active trading strategy
CREATE INDEX IF NOT EXISTS idx_strategies_trading_mode ON strategies(trading_mode)
  WHERE trading_mode != 'none';

-- RLS policy: only owner role can set trading_mode to paper or live
CREATE POLICY "Only owner can activate trading" ON strategies
  FOR UPDATE
  USING (
    user_id = auth.uid()
    AND (
      -- Allow any user to update non-trading fields
      true
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND (
      -- If trading_mode is being set to paper or live, user must be owner
      trading_mode = 'none'
      OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'owner'
      )
    )
  );
