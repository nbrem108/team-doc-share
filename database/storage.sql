-- Storage bucket and policies for file uploads
-- Run these commands in your Supabase SQL editor

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public)
VALUES ('cursor-files', 'cursor-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the cursor-files bucket
CREATE POLICY "Workspace members can view files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'cursor-files' AND
    auth.uid() IN (
      SELECT user_id FROM workspace_members
      WHERE workspace_id = (storage.foldername(name))[1]::uuid
    )
  );

CREATE POLICY "Workspace members can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cursor-files' AND
    auth.uid() IN (
      SELECT user_id FROM workspace_members
      WHERE workspace_id = (storage.foldername(name))[1]::uuid
    )
  );

CREATE POLICY "File uploaders can update their files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'cursor-files' AND
    auth.uid() = owner::uuid
  );

CREATE POLICY "File uploaders and admins can delete files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'cursor-files' AND (
      auth.uid() = owner::uuid OR
      auth.uid() IN (
        SELECT user_id FROM workspace_members
        WHERE workspace_id = (storage.foldername(name))[1]::uuid
        AND role = 'admin'
      )
    )
  );