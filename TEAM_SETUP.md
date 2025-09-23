# Cursor Share Sync - Team Setup Guide

Welcome! This guide will help you set up Cursor Share Sync to automatically share your Cursor AI outputs with your team.

## 🚀 Quick Start (2 Options)

### Option 1: Standalone Executable (Easiest)
**No Node.js required!**

1. **Download**: Get the `cursor-share-sync.exe` file
2. **Run**: Double-click the executable
3. **Configure**: Edit the `.env` file (created automatically)
4. **Start**: Run the executable again

### Option 2: Source Code (For Developers)
**Requires Node.js 18+**

1. **Download**: Unzip the project folder
2. **Setup**: Run `scripts/setup.bat` (Windows) or `scripts/setup.sh` (Mac/Linux)
3. **Configure**: Edit the `.env` file
4. **Start**: Run `npm start`

## 📋 Configuration

Both options create a `.env` file that you need to configure:

```env
# Supabase Configuration (Get from team admin)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Team Workspace (Same for all team members)
WORKSPACE_ID=your-workspace-id
USER_ID=your-unique-user-id

# File Watcher Settings (Optional)
WATCH_FOLDER=./cursor-share
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=.md,.txt
```

**Important**: Get the Supabase credentials and Workspace ID from your team admin!

## 📁 How It Works

1. **Install & Configure**: Set up the app with your team's credentials
2. **Auto-Watch**: The app creates a `cursor-share/` folder
3. **Drop Files**: Save Cursor outputs as `.md` files in this folder
4. **Instant Sync**: Files automatically upload to team workspace
5. **Real-time**: Team members see your files immediately

## 🛠️ Folder Structure

Your files can be organized by sprint/project:

```
cursor-share/
├── sprint-2025.1/
│   ├── feature-auth.md
│   └── bug-fix-login.md
├── sprint-2025.2/
│   └── new-dashboard.md
└── research/
    └── ai-integration.md
```

## 🏷️ File Features

- **Auto-tagging**: Use #hashtags in your content for automatic categorization
- **Sprint folders**: Organize by project phases
- **Real-time sync**: Changes appear instantly for teammates
- **Version tracking**: All changes are logged with timestamps

## 🔧 Troubleshooting

### Common Issues:

**"Configuration validation failed"**
- Check your `.env` file has all required values
- Verify Supabase credentials are correct

**"Storage upload error"**
- Contact team admin to check database permissions
- Ensure your User ID is valid

**"File watcher not starting"**
- Make sure the folder path exists and is writable
- Check antivirus isn't blocking the app

### Getting Help:

1. Check the console output for specific error messages
2. Verify your `.env` configuration
3. Contact your team admin for workspace setup issues

## 🎯 Team Admin Setup

If you're the first person setting this up:

1. **Create Supabase Project**: Sign up at supabase.com
2. **Run Database Setup**: Use the SQL scripts in `database/` folder
3. **Create Workspace**: Run `npm run setup-workspace`
4. **Share Credentials**: Give team members the Supabase URL, API key, and Workspace ID

## 📱 Next Steps

Once everyone is set up:
- Drop your Cursor outputs in the `cursor-share/` folder
- Files sync automatically across the team
- View shared files through Supabase dashboard
- Build custom web interface for better browsing (optional)

## 🎉 You're Ready!

Start dropping markdown files in your `cursor-share/` folder and watch them sync instantly with your team!