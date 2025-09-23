-- Fixed Row Level Security (RLS) Policies for Cursor Share Sync
-- Run these commands to replace the existing policies

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Workspace members can view workspace" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can update workspace" ON workspaces;
DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace members can view members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace admins can manage members" ON workspace_members;
DROP POLICY IF EXISTS "Users can join workspaces they're invited to" ON workspace_members;
DROP POLICY IF EXISTS "Workspace members can view files" ON files;
DROP POLICY IF EXISTS "Workspace members can upload files" ON files;
DROP POLICY IF EXISTS "File uploaders can update their files" ON files;
DROP POLICY IF EXISTS "Workspace admins can delete any files" ON files;
DROP POLICY IF EXISTS "Workspace members can view file events" ON file_events;
DROP POLICY IF EXISTS "Authenticated users can create file events" ON file_events;

-- User Profiles Policies (simplified)
CREATE POLICY "Allow all authenticated users to view profiles" ON user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage own profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

-- Workspaces Policies (simplified)
CREATE POLICY "Users can view workspaces they own or are members of" ON workspaces
  FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can manage workspace" ON workspaces
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create workspaces" ON workspaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Workspace Members Policies (simplified to avoid recursion)
CREATE POLICY "Allow viewing workspace members" ON workspace_members
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Workspace owners can manage members" ON workspace_members
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own membership" ON workspace_members
  FOR UPDATE USING (user_id = auth.uid());

-- Files Policies (simplified)
CREATE POLICY "Allow viewing files in accessible workspaces" ON files
  FOR SELECT USING (
    workspace_id IN (
      SELECT w.id FROM workspaces w
      WHERE w.owner_id = auth.uid()
      UNION
      SELECT wm.workspace_id FROM workspace_members wm
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow uploading files to accessible workspaces" ON files
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    workspace_id IN (
      SELECT w.id FROM workspaces w
      WHERE w.owner_id = auth.uid()
      UNION
      SELECT wm.workspace_id FROM workspace_members wm
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own files" ON files
  FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY "Users and workspace owners can delete files" ON files
  FOR DELETE USING (
    uploaded_by = auth.uid() OR
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

-- File Events Policies (simplified)
CREATE POLICY "Allow viewing file events in accessible workspaces" ON file_events
  FOR SELECT USING (
    workspace_id IN (
      SELECT w.id FROM workspaces w
      WHERE w.owner_id = auth.uid()
      UNION
      SELECT wm.workspace_id FROM workspace_members wm
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow creating file events" ON file_events
  FOR INSERT WITH CHECK (user_id = auth.uid());