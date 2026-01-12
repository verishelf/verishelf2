-- Fix: Add INSERT policy for users table
-- Run this in your Supabase SQL Editor to allow users to create their own profile

-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Users can create own profile" ON users;

-- Create INSERT policy for users table
CREATE POLICY "Users can create own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
