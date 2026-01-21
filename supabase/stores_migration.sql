-- Stores/Locations Migration
-- Run this in Supabase SQL Editor to enable cross-device store persistence
-- This migration is idempotent - safe to run multiple times

-- Create stores table
CREATE TABLE IF NOT EXISTS public.stores (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name) -- Prevent duplicate store names per user
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON public.stores(user_id);

-- Enable Row Level Security
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own stores" ON public.stores;
DROP POLICY IF EXISTS "Users can create own stores" ON public.stores;
DROP POLICY IF EXISTS "Users can update own stores" ON public.stores;
DROP POLICY IF EXISTS "Users can delete own stores" ON public.stores;

-- RLS Policies for stores table
-- Users can view their own stores
CREATE POLICY "Users can view own stores" ON public.stores
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own stores
CREATE POLICY "Users can create own stores" ON public.stores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own stores
CREATE POLICY "Users can update own stores" ON public.stores
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own stores
CREATE POLICY "Users can delete own stores" ON public.stores
  FOR DELETE USING (auth.uid() = user_id);

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS update_stores_updated_at ON public.stores;

-- Trigger to update updated_at automatically
CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
