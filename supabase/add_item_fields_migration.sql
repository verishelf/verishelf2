-- Migration: Add aisle, shelf, and item_status fields to items table
-- Run this in Supabase SQL Editor

-- Add aisle column
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS aisle TEXT;

-- Add shelf column
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS shelf TEXT;

-- Add item_status column (active, removed, discounted, re-merchandised)
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS item_status TEXT DEFAULT 'active';

-- Create index for item_status for faster filtering
CREATE INDEX IF NOT EXISTS idx_items_item_status ON items(user_id, item_status);

-- Create index for aisle/shelf for faster location-based queries
CREATE INDEX IF NOT EXISTS idx_items_aisle_shelf ON items(user_id, aisle, shelf);

-- Update existing items: if removed = true, set item_status = 'removed'
UPDATE items 
SET item_status = 'removed' 
WHERE removed = true AND (item_status IS NULL OR item_status = 'active');

-- Update existing items: if removed = false and item_status is NULL, set to 'active'
UPDATE items 
SET item_status = 'active' 
WHERE removed = false AND item_status IS NULL;
