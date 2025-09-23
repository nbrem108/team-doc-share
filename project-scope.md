# Real-time Cursor Output Sharing App

## Project Overview
A modern file-sharing solution that eliminates manual processes for sharing Cursor AI outputs across development teams. Team members simply drop markdown files into a watched folder and they instantly appear for all teammates via real-time cloud sync.

## Core Objectives
- **Instant Sharing**: Files sync in real-time (seconds, not minutes)
- **Zero Technical Barriers**: No git commands, no manual uploads
- **Team Collaboration**: Real-time notifications and activity feeds
- **Sprint Integration**: Organize outputs by project/sprint with search
- **Mobile Access**: View shared outputs on any device

## Key Features

### 1. Drop & Sync
- Local `cursor-share/` folder monitoring
- Automatic upload to cloud on file changes
- Real-time sync to all team members
- Support for markdown files and attachments

### 2. Cloud Infrastructure
- **Supabase Backend**: Real-time database + file storage
- **Authentication**: Team workspace management
- **Real-time Updates**: Instant notifications when files are added
- **File Storage**: Secure cloud storage with access controls

### 3. User Interfaces
- **Desktop Watcher**: Background service for file monitoring
- **Web Dashboard**: Browse, search, and organize shared files
- **Mobile View**: Read-only access to shared content
- **Notifications**: Desktop/browser alerts for new files

### 4. Organization & Search
- **Sprint Folders**: Organize by project phases
- **Tagging System**: #billing, #dispatch, #architecture tags
- **Search**: Full-text search across all content
- **Filtering**: By author, date, project, tags

## Technical Architecture

### Stack
- **Backend**: Supabase (PostgreSQL + real-time + storage)
- **Desktop Watcher**: Electron app or Node.js service
- **Frontend**: Next.js web app with real-time subscriptions
- **File Monitoring**: chokidar for cross-platform file watching

### Data Flow
1. User drops markdown file in `cursor-share/`
2. Local watcher detects change via file system events
3. File uploaded to Supabase storage + metadata to database
4. Real-time event triggers notifications to all team members
5. Teammates see new file instantly in web dashboard

### Security
- Team workspace isolation
- Role-based access (admin, member, read-only)
- Secure file uploads with validation
- Audit log of all file activities

## MVP Deliverables
1. **Local Watcher Service** - Cross-platform file monitoring
2. **Supabase Setup** - Database schema + storage buckets
3. **Web Dashboard** - File browsing and search interface
4. **Team Management** - User authentication and workspace setup
5. **Real-time Sync** - Live updates across all clients

## Success Metrics
- Files sync within 5 seconds of being dropped
- Zero manual git operations required
- 100% team adoption (no training needed)
- Mobile accessibility for remote viewing
- Search finds relevant content in under 2 seconds

## Future Enhancements
- **Slack/Teams Integration**: Notifications in chat channels
- **Jira Linking**: Auto-detect issue keys and link tickets
- **AI Search**: Semantic search across all shared content
- **Version History**: Track changes to shared files
- **Offline Support**: Queue uploads when disconnected