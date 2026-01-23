-- Supabase Schema Update for User Authentication
-- Run this in your Supabase SQL Editor AFTER enabling Google Auth in the dashboard

-- =============================================
-- STEP 1: Add user_id columns to all tables
-- =============================================

-- Add user_id to activity_options
ALTER TABLE activity_options
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to scheduled_activities
ALTER TABLE scheduled_activities
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to activity_logs
ALTER TABLE activity_logs
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- =============================================
-- STEP 2: Create indexes for better performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_activity_options_user ON activity_options(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_activities_user ON scheduled_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);

-- =============================================
-- STEP 3: Drop old "allow all" policies
-- =============================================

DROP POLICY IF EXISTS "Allow all for activity_options" ON activity_options;
DROP POLICY IF EXISTS "Allow all for scheduled_activities" ON scheduled_activities;
DROP POLICY IF EXISTS "Allow all for activity_logs" ON activity_logs;

-- =============================================
-- STEP 4: Create new user-specific RLS policies
-- =============================================

-- Policies for activity_options
CREATE POLICY "Users can view own activity_options"
ON activity_options FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity_options"
ON activity_options FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity_options"
ON activity_options FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity_options"
ON activity_options FOR DELETE
USING (auth.uid() = user_id);

-- Policies for scheduled_activities
CREATE POLICY "Users can view own scheduled_activities"
ON scheduled_activities FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled_activities"
ON scheduled_activities FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled_activities"
ON scheduled_activities FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled_activities"
ON scheduled_activities FOR DELETE
USING (auth.uid() = user_id);

-- Policies for activity_logs
CREATE POLICY "Users can view own activity_logs"
ON activity_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity_logs"
ON activity_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity_logs"
ON activity_logs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity_logs"
ON activity_logs FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- NOTES:
-- =============================================
--
-- Before running this script, make sure to:
--
-- 1. Go to Supabase Dashboard > Authentication > Providers
-- 2. Enable Google provider
-- 3. Add your Google OAuth credentials:
--    - Client ID (from Google Cloud Console)
--    - Client Secret (from Google Cloud Console)
--
-- In Google Cloud Console:
-- 1. Create OAuth 2.0 credentials (Web application)
-- 2. Add authorized redirect URI:
--    https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
-- 3. Add your app URLs to authorized origins
--
-- After running this script:
-- - Existing data without user_id will NOT be visible to users
-- - Each user will start with a fresh slate
-- - Users can only see/modify their own data
