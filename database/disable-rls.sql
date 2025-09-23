-- Temporarily disable RLS for development and testing
-- Run this to get basic functionality working

-- Disable RLS on all tables
ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE files DISABLE ROW LEVEL SECURITY;
ALTER TABLE file_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to clean up
DROP POLICY IF EXISTS "Allow all authenticated users to view profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view workspaces they own or are members of" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can manage workspace" ON workspaces;
DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Allow viewing workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can manage members" ON workspace_members;
DROP POLICY IF EXISTS "Users can update their own membership" ON workspace_members;
DROP POLICY IF EXISTS "Allow viewing files in accessible workspaces" ON files;
DROP POLICY IF EXISTS "Allow uploading files to accessible workspaces" ON files;
DROP POLICY IF EXISTS "Users can update their own files" ON files;
DROP POLICY IF EXISTS "Users and workspace owners can delete files" ON files;
DROP POLICY IF EXISTS "Allow viewing file events in accessible workspaces" ON file_events;
DROP POLICY IF EXISTS "Allow creating file events" ON file_events;