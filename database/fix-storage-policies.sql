-- Fix storage policies to work without authentication
-- Run this in your Supabase SQL editor

-- Drop existing storage policies
DROP POLICY IF EXISTS "Workspace members can view files" ON storage.objects;
DROP POLICY IF EXISTS "Workspace members can upload files" ON storage.objects;
DROP POLICY IF EXISTS "File uploaders can update their files" ON storage.objects;
DROP POLICY IF EXISTS "File uploaders and admins can delete files" ON storage.objects;

-- Create simple policies that allow all operations for development
-- (You can make these more restrictive later)

CREATE POLICY "Allow all operations on cursor-files bucket" ON storage.objects
  FOR ALL USING (bucket_id = 'cursor-files')
  WITH CHECK (bucket_id = 'cursor-files');

-- Alternative: Disable RLS on storage.objects entirely for development
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;