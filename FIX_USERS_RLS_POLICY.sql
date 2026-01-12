-- Fix: Add INSERT policy for users table
-- Run this in your Supabase SQL Editor to allow users to create their own profile

-- Check if policy exists, and create it if it doesn't
-- This avoids the "destructive operation" warning
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'Users can create own profile'
  ) THEN
    CREATE POLICY "Users can create own profile" ON users
      FOR INSERT WITH CHECK (auth.uid() = id);
  ELSE
    RAISE NOTICE 'Policy "Users can create own profile" already exists';
  END IF;
END $$;
