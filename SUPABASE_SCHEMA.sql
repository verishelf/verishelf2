-- VeriShelf Supabase Database Schema
-- Run these SQL commands in your Supabase SQL Editor to create the required tables

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  company TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL, -- 'Professional' or 'Enterprise'
  plan_key TEXT NOT NULL, -- 'professional' or 'enterprise'
  price DECIMAL(10, 2) NOT NULL, -- Total monthly price
  price_per_location DECIMAL(10, 2) NOT NULL, -- Price per location after discount
  location_count INTEGER NOT NULL DEFAULT 1,
  base_price DECIMAL(10, 2) NOT NULL, -- Base price before discount
  discount DECIMAL(5, 4) NOT NULL DEFAULT 0, -- Discount percentage (0.00 to 1.00)
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'past_due', etc.
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  payment_method_id TEXT, -- Stripe payment method ID
  stripe_payment_method_id TEXT, -- Stripe payment method ID (duplicate for clarity)
  stripe_subscription_id TEXT, -- Stripe subscription ID (if using subscriptions)
  stripe_product_id TEXT, -- Stripe product ID from Product Catalog
  stripe_price_id TEXT, -- Stripe price ID from Product Catalog
  stripe_customer_id TEXT, -- Stripe customer ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can create own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for subscriptions table
-- Users can read their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own subscriptions
CREATE POLICY "Users can create own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at automatically
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Items/Inventory table (user-specific inventory data)
CREATE TABLE IF NOT EXISTS items (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  barcode TEXT,
  location TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  quantity INTEGER DEFAULT 1,
  category TEXT,
  cost DECIMAL(10, 2),
  notes TEXT,
  removed BOOLEAN DEFAULT FALSE,
  removed_at TIMESTAMPTZ,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for items table
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_location ON items(user_id, location);
CREATE INDEX IF NOT EXISTS idx_items_expiry_date ON items(user_id, expiry_date);
CREATE INDEX IF NOT EXISTS idx_items_removed ON items(user_id, removed);

-- Enable RLS for items table
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for items table
-- Users can view their own items
CREATE POLICY "Users can view own items" ON items
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own items
CREATE POLICY "Users can create own items" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own items
CREATE POLICY "Users can update own items" ON items
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own items
CREATE POLICY "Users can delete own items" ON items
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update updated_at for items
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

