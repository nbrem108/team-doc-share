-- Enable real-time for Cursor Share Sync
-- Run this in your Supabase SQL editor

-- Enable real-time for the files table
ALTER PUBLICATION supabase_realtime ADD TABLE files;

-- Enable real-time for file_events table (for activity tracking)
ALTER PUBLICATION supabase_realtime ADD TABLE file_events;

-- Optional: Enable for other tables if needed in the future
-- ALTER PUBLICATION supabase_realtime ADD TABLE workspaces;
-- ALTER PUBLICATION supabase_realtime ADD TABLE workspace_members;

-- Verify real-time is enabled
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';