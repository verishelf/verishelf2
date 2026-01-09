-- Migration: Add Stripe Product and Price IDs to subscriptions table
-- Run this in your Supabase SQL Editor if you already have the subscriptions table

-- Add new columns for Stripe Product Catalog
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_product_id ON subscriptions(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_price_id ON subscriptions(stripe_price_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

