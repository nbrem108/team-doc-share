# 🚀 Cursor Share Sync

**Instantly share Cursor AI outputs with your team**

Drop markdown files → Instant team sync → Zero manual work

[![npm version](https://badge.fury.io/js/cursor-share-sync.svg)](https://www.npmjs.com/package/cursor-share-sync)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ⚡ Quick Start

### Prerequisites
You'll need a free [Supabase](https://supabase.com) account for your team's backend:

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Set up the database** with one SQL file:
   - Go to your Supabase dashboard → SQL Editor
   - Copy and run: [`complete_setup.sql`](https://github.com/nbrem108/cursor-share-sync/blob/main/database/complete_setup.sql)
   - Or find it locally: `node_modules/cursor-share-sync/database/complete_setup.sql`
3. **Get credentials** from Supabase Settings → API (URL + anon key)

**No git clone required!** Everything works via NPX.

### Team Admin (First-time setup)
```bash
# 1. Create .env file with your Supabase credentials
echo "SUPABASE_URL=https://your-project.supabase.co" > .env
echo "SUPABASE_ANON_KEY=your-anon-key" >> .env

# 2. Setup workspace
npx cursor-share-sync setup
```

### Team Members (Join workspace)
```bash
# Use the full command provided by your team admin
npx cursor-share-sync join <workspace-id> <access-key> <supabase-url> <supabase-anon-key> --name "Your Name"
```

### Daily Usage
```bash
npx cursor-share-sync start
```

Drop markdown files in `cursor-share/` folder → Files sync instantly to team!

## 🎯 Why Use This?

**Before:** Manual copy/paste, email attachments, scattered Cursor outputs
**After:** Drop file → Team sees it instantly → Organized by project/sprint

## ✨ Features

- **🔥 Instant Sync** - Files appear for teammates in seconds
- **📱 Zero Setup** - No git, no servers, no complex configuration
- **🏷️ Smart Organization** - Auto-tags, sprint folders, search
- **🔔 Real-time** - See when teammates add files live
- **🔒 Secure** - Private team workspaces with access keys
- **📱 Cross-platform** - Windows, Mac, Linux support

## 📖 How It Works

1. **Setup once**: Team admin creates workspace with `npx cursor-share-sync setup`
2. **Join workspace**: Team members join with shared workspace ID + access key
3. **Drop & sync**: Save Cursor outputs as `.md` files in `cursor-share/` folder
4. **Instant sharing**: Files automatically sync to team workspace in real-time

## 🗂️ File Organization

```
cursor-share/
├── sprint-2025.1/
│   ├── feature-auth.md      # #authentication #backend
│   └── bug-fix-login.md     # #bugfix #frontend
├── sprint-2025.2/
│   └── new-dashboard.md     # #ui #react
└── research/
    └── ai-integration.md    # #research #ai
```

**Features:**
- 🏷️ **Auto-tagging**: Use #hashtags for instant categorization
- 📁 **Sprint folders**: Organize by project phases
- 🔍 **Smart search**: Find files by content, tags, or author
- ⏰ **Version history**: Track all changes with timestamps

## 🛠️ Commands

```bash
# Setup new workspace (admin only, requires .env file)
npx cursor-share-sync setup

# Join existing workspace (all parameters required)
npx cursor-share-sync join <workspace-id> <access-key> <supabase-url> <supabase-anon-key> --name "John Doe"

# Start file watching
npx cursor-share-sync start

# Test connection (requires .env file or joined workspace)
npx cursor-share-sync test

# Help
npx cursor-share-sync --help
```

## 🚨 Troubleshooting

**"No .env file found" or "Configuration validation failed"**
- Create `.env` file with your Supabase credentials
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check your internet connection to Supabase

**"Setup failed" or "Database query failed"**
- Ensure you've run the SQL scripts from `database/` folder in Supabase
- Verify your Supabase project is active
- Check the Supabase dashboard for errors

**"No files syncing"**
- Ensure files are `.md` or `.txt` format
- Check the console for error messages
- Run `npx cursor-share-sync test`
- Verify all team members joined the same workspace

**"Real-time sync not working"**
- Check that real-time is enabled in your Supabase project
- Verify network connectivity
- Try restarting with `npx cursor-share-sync start`

**Need help?** Open an [issue](https://github.com/nbrem108/cursor-share-sync/issues)

## 🎯 Perfect For

- **Dev Teams** sharing Cursor AI outputs
- **Sprint Planning** with organized file sharing
- **Knowledge Management** across projects
- **Remote Teams** needing instant collaboration
- **Anyone** tired of manual file sharing

## 📊 Example Workflow

```bash
# Team lead sets up Supabase and workspace
echo "SUPABASE_URL=https://abc123.supabase.co" > .env
echo "SUPABASE_ANON_KEY=eyJ..." >> .env
npx cursor-share-sync setup
# Shares: npx cursor-share-sync join workspace123 key456 https://abc123.supabase.co eyJ...

# Developer joins and starts sharing
npx cursor-share-sync join workspace123 key456 https://abc123.supabase.co eyJ... --name "Alice"
npx cursor-share-sync start

# Alice saves Cursor output
echo "# API Design\n\n..." > cursor-share/sprint-1/api-design.md

# Team sees file instantly! 🎉
```

## 🔒 Security & Infrastructure

- **Private workspaces** with access key authentication
- **Self-hosted backend** - your team controls the Supabase instance
- **User attribution** - see who shared what and when
- **Access control** - workspace-based team management
- **Secure by design** - no credentials stored in source code

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup
```bash
# Clone the repository
git clone https://github.com/nbrem108/cursor-share-sync.git
cd cursor-share-sync

# Install dependencies
npm install

# Create your own Supabase project for testing
# 1. Go to supabase.com and create a project
# 2. Run the SQL scripts from database/ folder
# 3. Create .env file with your credentials:
echo "SUPABASE_URL=https://your-test-project.supabase.co" > .env
echo "SUPABASE_ANON_KEY=your-test-anon-key" >> .env

# Build and test
npm run build
npm test
```

### Making Changes
1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes
4. **Test** your changes: `npm run build && npm test`
5. **Commit** your changes: `git commit -m 'Add amazing feature'`
6. **Push** to your branch: `git push origin feature/amazing-feature`
7. **Open** a Pull Request

### Development Commands
```bash
npm run build          # Compile TypeScript
npm run dev           # Development mode with hot reload
npm run lint          # Check code style
npm run lint:fix      # Fix code style issues
npm run format        # Format code with Prettier
```

### Architecture
- **TypeScript** - Type-safe JavaScript
- **Supabase** - Backend database and real-time subscriptions
- **chokidar** - Cross-platform file watching
- **commander** - CLI framework

### Need Help?
- 📖 Check existing [issues](https://github.com/nbrem108/cursor-share-sync/issues)
- 💬 Open a [discussion](https://github.com/nbrem108/cursor-share-sync/discussions)
- 🐛 Report bugs via [issues](https://github.com/nbrem108/cursor-share-sync/issues/new)

## 📜 License

MIT - see [LICENSE](LICENSE) file

---

**Made with ❤️ for Cursor users who want seamless team collaboration**