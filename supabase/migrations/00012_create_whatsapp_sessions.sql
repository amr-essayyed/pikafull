-- ============================================
-- WhatsApp Sessions Table for State Machine Form
-- ============================================

CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  phone TEXT PRIMARY KEY,
  step TEXT NOT NULL DEFAULT 'IDLE',
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
-- Restricts client-side anon/auth access while allowing backend service_role key full access
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;

-- Index for auto-cleanup or expiration checks
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_updated_at ON whatsapp_sessions(updated_at);
