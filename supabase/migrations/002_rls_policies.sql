-- =============================================================================
-- NATN Lab - Row Level Security Policies
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE backtest_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_data_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE fundamental_data_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- User Profiles
-- Users can read and update their own profile
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- Invite Codes
-- Anyone authenticated can read active codes (to validate), only admins/owner create
-- -----------------------------------------------------------------------------
CREATE POLICY "Authenticated users can read invite codes"
  ON invite_codes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create invite codes"
  ON invite_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can update invite codes"
  ON invite_codes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- -----------------------------------------------------------------------------
-- Strategies
-- Users can CRUD their own strategies
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can read own strategies"
  ON strategies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create strategies"
  ON strategies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own strategies"
  ON strategies FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own strategies"
  ON strategies FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Backtest Results
-- Users can read and create their own results
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can read own backtest results"
  ON backtest_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create backtest results"
  ON backtest_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own backtest results"
  ON backtest_results FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Historical Data Cache
-- All authenticated users can read/write (shared cache)
-- -----------------------------------------------------------------------------
CREATE POLICY "Authenticated users can read historical cache"
  ON historical_data_cache FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert historical cache"
  ON historical_data_cache FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- Cache Metadata
-- All authenticated users can read/write (shared cache)
-- -----------------------------------------------------------------------------
CREATE POLICY "Authenticated users can read cache metadata"
  ON cache_metadata FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert cache metadata"
  ON cache_metadata FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update cache metadata"
  ON cache_metadata FOR UPDATE
  TO authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- Fundamental Data Cache
-- All authenticated users can read/write (shared cache)
-- -----------------------------------------------------------------------------
CREATE POLICY "Authenticated users can read fundamental cache"
  ON fundamental_data_cache FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert fundamental cache"
  ON fundamental_data_cache FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update fundamental cache"
  ON fundamental_data_cache FOR UPDATE
  TO authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- AI Conversations
-- Users can CRUD their own conversations
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can read own conversations"
  ON ai_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations"
  ON ai_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON ai_conversations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON ai_conversations FOR DELETE
  USING (auth.uid() = user_id);
