# 🚀 Cursor Share Sync

**Instantly share Cursor AI outputs with your team**

Drop markdown files → Instant team sync → Zero manual work

[![npm version](https://badge.fury.io/js/cursor-share-sync.svg)](https://www.npmjs.com/package/cursor-share-sync)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ⚡ Quick Start

### Team Admin (First-time setup)
```bash
npx cursor-share-sync setup
```

### Team Members (30-second join)
```bash
npx cursor-share-sync join <workspace-id> <access-key> --name "Your Name"
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
# Setup new workspace (admin only)
npx cursor-share-sync setup

# Join existing workspace
npx cursor-share-sync join <workspace-id> <access-key> --name "John Doe"

# Start file watching
npx cursor-share-sync start

# Test connection
npx cursor-share-sync test

# Help
npx cursor-share-sync --help
```

## 🚨 Troubleshooting

**"Configuration validation failed"**
- Check your internet connection
- Verify workspace ID and access key

**"No files syncing"**
- Ensure files are `.md` or `.txt` format
- Check the console for error messages
- Run `npx cursor-share-sync test`

**Need help?** Open an [issue](https://github.com/nbrem108/cursor-share-sync/issues)

## 🎯 Perfect For

- **Dev Teams** sharing Cursor AI outputs
- **Sprint Planning** with organized file sharing
- **Knowledge Management** across projects
- **Remote Teams** needing instant collaboration
- **Anyone** tired of manual file sharing

## 📊 Example Workflow

```bash
# Team lead sets up workspace
npx cursor-share-sync setup
# Shares: npx cursor-share-sync join abc123 xyz789

# Developer joins and starts sharing
npx cursor-share-sync join abc123 xyz789 --name "Alice"
npx cursor-share-sync start

# Alice saves Cursor output
echo "# API Design\n\n..." > cursor-share/sprint-1/api-design.md

# Team sees file instantly! 🎉
```

## 🔒 Security

- **Private workspaces** with access key authentication
- **Encrypted transmission** via Supabase infrastructure
- **User attribution** - see who shared what
- **Access control** - admin can manage team members

## 📜 License

MIT - see [LICENSE](LICENSE) file

---

**Made with ❤️ for Cursor users who want seamless team collaboration**