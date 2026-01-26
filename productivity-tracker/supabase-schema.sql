-- Supabase SQL Schema for Bitmap Editor
-- Run this in your Supabase SQL Editor to set up the database

-- Bitmap Designs Table
CREATE TABLE IF NOT EXISTS bitmap_designs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Untitled Design',
  rows INTEGER NOT NULL DEFAULT 10,
  cols INTEGER NOT NULL DEFAULT 5,
  cell_size INTEGER NOT NULL DEFAULT 40,
  cells JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE bitmap_designs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own designs
CREATE POLICY "Users can view own designs" ON bitmap_designs
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own designs
CREATE POLICY "Users can insert own designs" ON bitmap_designs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own designs
CREATE POLICY "Users can update own designs" ON bitmap_designs
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own designs
CREATE POLICY "Users can delete own designs" ON bitmap_designs
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster user queries
CREATE INDEX IF NOT EXISTS idx_bitmap_designs_user_id ON bitmap_designs(user_id);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_bitmap_designs_updated_at ON bitmap_designs;
CREATE TRIGGER update_bitmap_designs_updated_at
  BEFORE UPDATE ON bitmap_designs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
