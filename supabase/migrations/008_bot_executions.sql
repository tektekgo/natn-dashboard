-- Migration 008: Bot Execution Logging Tables
-- Phase INT-3: Tracks n8n trading bot workflow executions

-- bot_executions: one row per workflow run
CREATE TABLE bot_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'success', 'error', 'halted')),
  risk_checks JSONB DEFAULT '{}'::jsonb,
  symbols_processed INTEGER DEFAULT 0,
  orders_placed INTEGER DEFAULT 0,
  orders_skipped INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- bot_execution_details: one row per symbol per run (Phase C-2, populated later)
CREATE TABLE bot_execution_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id UUID NOT NULL REFERENCES bot_executions(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('buy','sell_tp','sell_sl','skip','error')),
  signals JSONB DEFAULT '{}'::jsonb,
  combined_score NUMERIC,
  outcome TEXT,
  order_id TEXT,
  price NUMERIC,
  quantity INTEGER,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bot_executions_user_id ON bot_executions(user_id);
CREATE INDEX idx_bot_executions_executed_at ON bot_executions(executed_at DESC);
CREATE INDEX idx_bot_executions_strategy_id ON bot_executions(strategy_id);
CREATE INDEX idx_bot_execution_details_execution_id ON bot_execution_details(execution_id);

-- RLS: Enable row-level security
ALTER TABLE bot_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_execution_details ENABLE ROW LEVEL SECURITY;

-- Users can read their own executions
CREATE POLICY "Users can view own executions"
  ON bot_executions FOR SELECT
  USING (auth.uid() = user_id);

-- Owner can read all executions
CREATE POLICY "Owner can view all executions"
  ON bot_executions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Users can read their own execution details (via execution ownership)
CREATE POLICY "Users can view own execution details"
  ON bot_execution_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bot_executions
      WHERE bot_executions.id = bot_execution_details.execution_id
        AND bot_executions.user_id = auth.uid()
    )
  );

-- Owner can read all execution details
CREATE POLICY "Owner can view all execution details"
  ON bot_execution_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Note: n8n writes via service_role_key which bypasses RLS.
-- No INSERT/UPDATE policies needed for dashboard users.
