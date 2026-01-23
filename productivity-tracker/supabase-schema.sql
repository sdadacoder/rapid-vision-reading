-- Supabase SQL Schema for Productivity Tracker
-- Run this in your Supabase SQL Editor to set up the database

-- Activity Options (predefined activities like Gym, Work, Study, etc.)
CREATE TABLE activity_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Scheduled Activities (what you plan to do on the calendar)
CREATE TABLE scheduled_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  option_id UUID REFERENCES activity_options(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Activity Logs (actual tracked time)
CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  option_id UUID REFERENCES activity_options(id) ON DELETE CASCADE,
  scheduled_id UUID REFERENCES scheduled_activities(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security (optional, for future auth)
ALTER TABLE activity_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- For MVP, allow all operations (you'd add user auth policies later)
CREATE POLICY "Allow all for activity_options" ON activity_options FOR ALL USING (true);
CREATE POLICY "Allow all for scheduled_activities" ON scheduled_activities FOR ALL USING (true);
CREATE POLICY "Allow all for activity_logs" ON activity_logs FOR ALL USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_scheduled_start ON scheduled_activities(start_time);
CREATE INDEX idx_logs_started ON activity_logs(started_at);
CREATE INDEX idx_logs_option ON activity_logs(option_id);

-- Insert some sample activity options
INSERT INTO activity_options (name, color) VALUES
  ('Work', '#3b82f6'),
  ('Gym', '#22c55e'),
  ('Study', '#8b5cf6'),
  ('Break', '#f97316'),
  ('Meals', '#eab308');
