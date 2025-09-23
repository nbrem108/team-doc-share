# 🚀 Team Doc Share

**Instantly share documents with your team**

Drop markdown files → Instant team sync → Zero manual work

[![npm version](https://badge.fury.io/js/team-doc-share.svg)](https://www.npmjs.com/package/team-doc-share)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ⚡ Quick Start

### Prerequisites
You'll need a free [Supabase](https://supabase.com) account for your team's backend:

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Set up the database** with one command:
   ```bash
   npx team-doc-share sql
   ```
   - Copy the displayed SQL and paste into Supabase SQL Editor
   - Click "Run" to create all tables and settings
3. **Get credentials** from Supabase Settings → API (URL + anon key)
   - ⚠️ **Important**: Use the **anon/public key** (starts with `eyJ...`), not service keys
   - 📖 **Note**: This key is safe because our SQL setup configures proper Row Level Security (RLS) policies

**No git clone required!** Everything works via NPX.

### Team Admin (First-time setup)
```bash
# 1. Create .env file with your ACTUAL Supabase credentials
echo "SUPABASE_URL=https://your-actual-project-id.supabase.co" > .env
echo "SUPABASE_ANON_KEY=eyJyour-actual-anon-key-here" >> .env

# 2. Setup workspace
npx team-doc-share setup
```

### Team Members (Join workspace)
```bash
# Use the full command provided by your team admin
npx team-doc-share join <workspace-id> <access-key> <supabase-url> <supabase-anon-key> --name "Your Name"
```

### Daily Usage
```bash
npx team-doc-share start
```

Drop markdown files in `team-docs/` folder → Files sync instantly to team!

## 🎯 Why Use This?

**Before:** Manual copy/paste, email attachments, scattered AI outputs
**After:** Drop file → Team sees it instantly → Organized by project/sprint

## ✨ Features

- **🔥 Instant Sync** - Files appear for teammates in seconds
- **📱 Zero Setup** - No git, no servers, no complex configuration
- **🏷️ Smart Organization** - Auto-tags, sprint folders, search
- **🔔 Real-time** - See when teammates add files live
- **🔒 Secure** - Private team workspaces with access keys
- **📱 Cross-platform** - Windows, Mac, Linux support
- **🎯 Universal** - Works with any editor (Cursor, VS Code, etc.)

## 📖 How It Works

1. **Setup once**: Team admin creates workspace with `npx team-doc-share setup`
2. **Join workspace**: Team members join with shared workspace ID + access key
3. **Drop & sync**: Save documents as `.md` files in `team-docs/` folder
4. **Instant sharing**: Files automatically sync to team workspace in real-time

## 🗂️ File Organization

```
team-docs/
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
# Get database setup SQL (copy/paste into Supabase)
npx team-doc-share sql

# Setup new workspace (admin only, requires .env file)
npx team-doc-share setup

# Join existing workspace (all parameters required)
npx team-doc-share join <workspace-id> <access-key> <supabase-url> <supabase-anon-key> --name "John Doe"

# Start file watching
npx team-doc-share start

# Test connection (requires .env file or joined workspace)
npx team-doc-share test

# Help
npx team-doc-share --help
```

## 🚨 Troubleshooting

**"No .env file found" or "Configuration validation failed"**
- Create `.env` file with your Supabase credentials
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check your internet connection to Supabase

**"Setup failed" or "Database query failed"**
- Run `npx team-doc-share sql` and paste the SQL into Supabase SQL Editor
- Verify your Supabase project is active and you're using the **legacy anon key**
- Check the Supabase dashboard for errors

**"No files syncing"**
- Ensure files are `.md` or `.txt` format
- Check the console for error messages
- Run `npx team-doc-share test`
- Verify all team members joined the same workspace

**"Real-time sync not working"**
- Check that real-time is enabled in your Supabase project
- Verify network connectivity
- Try restarting with `npx team-doc-share start`

**Need help?** Open an [issue](https://github.com/nbrem108/team-doc-share/issues)

## 🎯 Perfect For

- **Dev Teams** sharing AI outputs (Cursor, ChatGPT, etc.)
- **Documentation Teams** collaborating on guides
- **Sprint Planning** with organized file sharing
- **Knowledge Management** across projects
- **Remote Teams** needing instant collaboration
- **Any Team** tired of manual file sharing

## 📊 Example Workflow

```bash
# Team lead sets up Supabase and workspace (REPLACE WITH YOUR REAL VALUES)
echo "SUPABASE_URL=https://your-project-id.supabase.co" > .env
echo "SUPABASE_ANON_KEY=eyJyour-full-anon-key-here" >> .env
npx team-doc-share setup
# Shares: npx team-doc-share join workspace123 key456 https://abc123.supabase.co eyJ...

# Developer joins and starts sharing
npx team-doc-share join workspace123 key456 https://abc123.supabase.co eyJ... --name "Alice"
npx team-doc-share start

# Alice saves AI output or documentation
echo "# API Design\n\n..." > team-docs/sprint-1/api-design.md

# Team sees file instantly! 🎉
```

## 🔒 Security & Infrastructure

- **Private workspaces** with access key authentication
- **Self-hosted backend** - your team controls the Supabase instance
- **User attribution** - see who shared what and when
- **Access control** - workspace-based team management
- **Secure by design** - no credentials stored in source code
- **Row Level Security (RLS)** - App tables use application-level security, storage files use RLS policies
- **Safe anon keys** - Public keys are safe to use because RLS prevents unauthorized access

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup
```bash
# Clone the repository
git clone https://github.com/nbrem108/team-doc-share.git
cd team-doc-share

# Install dependencies
npm install

# Create your own Supabase project for testing
# 1. Go to supabase.com and create a project
# 2. Run: npx team-doc-share sql (copy/paste the SQL into Supabase)
# 3. Create .env file with your REAL credentials:
echo "SUPABASE_URL=https://your-actual-test-project-id.supabase.co" > .env
echo "SUPABASE_ANON_KEY=eyJyour-actual-test-anon-key" >> .env

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
- 📖 Check existing [issues](https://github.com/nbrem108/team-doc-share/issues)
- 💬 Open a [discussion](https://github.com/nbrem108/team-doc-share/discussions)
- 🐛 Report bugs via [issues](https://github.com/nbrem108/team-doc-share/issues/new)

## 📜 License

MIT - see [LICENSE](LICENSE) file

---

**Made with ❤️ for teams who want seamless document collaboration**