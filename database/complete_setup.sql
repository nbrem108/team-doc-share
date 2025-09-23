-- Cursor Share Sync - Complete Database Setup
-- Copy and paste this entire file into your Supabase SQL Editor and run it
-- This will set up everything needed for Cursor Share Sync

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  owner_id UUID, -- Nullable to avoid auth.users foreign key issues
  settings JSONB DEFAULT '{}'::jsonb
);

-- Create workspace members table
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID, -- Nullable to avoid auth.users foreign key issues
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  invited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  joined_at TIMESTAMPTZ,
  UNIQUE(workspace_id, user_id)
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_path TEXT,
  content TEXT,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) DEFAULT 'text/markdown',
  storage_path TEXT, -- Path in Supabase storage
  uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  uploaded_by UUID, -- Nullable to avoid auth.users foreign key issues
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  sprint_folder VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create file events table for activity tracking
CREATE TABLE IF NOT EXISTS file_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('created', 'updated', 'deleted', 'viewed')),
  user_id UUID, -- Nullable to avoid auth.users foreign key issues
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create user profiles table (simplified, no auth.users dependency)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  display_name VARCHAR(255),
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  last_active TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_files_workspace_id ON files(workspace_id);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_at ON files(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_sprint_folder ON files(sprint_folder);
CREATE INDEX IF NOT EXISTS idx_files_tags ON files USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_file_events_file_id ON file_events(file_id);
CREATE INDEX IF NOT EXISTS idx_file_events_created_at ON file_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to files table
DROP TRIGGER IF EXISTS update_files_updated_at ON files;
CREATE TRIGGER update_files_updated_at
    BEFORE UPDATE ON files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public)
VALUES ('cursor-files', 'cursor-files', false)
ON CONFLICT (id) DO NOTHING;

-- Disable Row Level Security for all tables to avoid permission issues
ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE files DISABLE ROW LEVEL SECURITY;
ALTER TABLE file_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Remove any existing storage policies that might block uploads
DROP POLICY IF EXISTS "Workspace members can view files" ON storage.objects;
DROP POLICY IF EXISTS "Workspace members can upload files" ON storage.objects;
DROP POLICY IF EXISTS "File uploaders can update their files" ON storage.objects;
DROP POLICY IF EXISTS "File uploaders and admins can delete files" ON storage.objects;

-- Add simple storage policies that allow all operations
CREATE POLICY "Allow all uploads" ON storage.objects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all downloads" ON storage.objects FOR SELECT USING (true);
CREATE POLICY "Allow all updates" ON storage.objects FOR UPDATE USING (true);
CREATE POLICY "Allow all deletes" ON storage.objects FOR DELETE USING (true);

-- Enable real-time for the files table
ALTER PUBLICATION supabase_realtime ADD TABLE files;

-- Enable real-time for file_events table (for activity tracking)
ALTER PUBLICATION supabase_realtime ADD TABLE file_events;

-- Note: RLS (Row Level Security) is intentionally disabled for simplicity
-- All access control is handled at the application level
-- This makes setup easier and avoids authentication complexity

-- Verify setup
SELECT
  'Tables created successfully' as status,
  COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('workspaces', 'workspace_members', 'files', 'file_events', 'user_profiles');

-- Verify real-time is enabled
SELECT
  'Real-time enabled for:' as status,
  string_agg(tablename, ', ') as tables
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('files', 'file_events');

-- Setup complete!
SELECT '🎉 Cursor Share Sync database setup complete!' as message;