-- API Keys Migration
-- Run this in Supabase SQL Editor to enable API key authentication for Enterprise customers

-- Add API key columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS api_key TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS api_key_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS api_key_created_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS api_key_last_used_at TIMESTAMPTZ;

-- Create index for faster API key lookups
CREATE INDEX IF NOT EXISTS idx_users_api_key ON public.users(api_key) WHERE api_key IS NOT NULL;

-- Function to generate API key (can be called from application)
-- Format: vs_live_<random 32 char hex string>
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
DECLARE
  key_prefix TEXT := 'vs_live_';
  random_part TEXT;
BEGIN
  -- Generate 32 character random hex string
  random_part := encode(gen_random_bytes(16), 'hex');
  RETURN key_prefix || random_part;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION generate_api_key() TO authenticated;
