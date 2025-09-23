-- Fix foreign key constraints for development
-- Run this in your Supabase SQL editor

-- Drop foreign key constraints that reference auth.users
ALTER TABLE files DROP CONSTRAINT IF EXISTS files_uploaded_by_fkey;
ALTER TABLE workspaces DROP CONSTRAINT IF EXISTS workspaces_owner_id_fkey;
ALTER TABLE workspace_members DROP CONSTRAINT IF EXISTS workspace_members_user_id_fkey;
ALTER TABLE file_events DROP CONSTRAINT IF EXISTS file_events_user_id_fkey;
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- Make uploaded_by nullable to allow development without auth
ALTER TABLE files ALTER COLUMN uploaded_by DROP NOT NULL;
ALTER TABLE file_events ALTER COLUMN user_id DROP NOT NULL;

-- Alternative: Set default values for development
UPDATE files SET uploaded_by = null WHERE uploaded_by IS NOT NULL;
UPDATE file_events SET user_id = null WHERE user_id IS NOT NULL;