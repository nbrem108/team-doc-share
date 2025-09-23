#!/usr/bin/env node

/**
 * CLI for Cursor Share Sync
 * Enables simple team distribution via NPX
 */

import { Command } from 'commander';
import * as fs from 'fs';

const program = new Command();

program
  .name('cursor-share-sync')
  .description('Real-time file sharing for Cursor AI outputs')
  .version('2.0.1');

program
  .command('setup')
  .description('Set up a new workspace (requires Supabase credentials)')
  .action(async () => {
    console.log('🏗️  Setting up new Cursor Share Sync workspace...');
    console.log('');

    // Check if .env exists with required credentials
    if (!fs.existsSync('.env')) {
      console.error('❌ No .env file found!');
      console.log('\n📋 Required setup:');
      console.log('1. Create a .env file with your Supabase credentials:');
      console.log('   SUPABASE_URL=https://your-project.supabase.co');
      console.log('   SUPABASE_ANON_KEY=your-anon-key');
      console.log('');
      console.log('2. Set up your Supabase database:');
      console.log('   - In your Supabase dashboard, go to SQL Editor');
      console.log('   - Copy and run: node_modules/cursor-share-sync/database/complete_setup.sql');
      console.log('   - Or download from: https://github.com/nbrem108/cursor-share-sync/blob/main/database/complete_setup.sql');
      console.log('3. Run this setup command again');
      process.exit(1);
    }

    try {
      const { setupWorkspace } = await import('./utils/setup-workspace');
      const result = await setupWorkspace();

      console.log('\n🎉 Workspace setup complete!');
      console.log('\n📋 Share this command with your team:');
      console.log(`\nnpx cursor-share-sync join ${result.workspaceId} ${result.accessKey} ${process.env.SUPABASE_URL} ${process.env.SUPABASE_ANON_KEY}\n`);
      console.log('🔐 Keep all credentials secure - anyone with them can join your workspace!');

    } catch (error) {
      console.error('❌ Setup failed:', error);
      console.log('\n💡 Make sure your Supabase credentials are correct and database is set up.');
      process.exit(1);
    }
  });

program
  .command('join')
  .description('Join an existing workspace')
  .argument('<workspace-id>', 'Workspace ID from team admin')
  .argument('<access-key>', 'Access key from team admin')
  .argument('<supabase-url>', 'Supabase URL from team admin')
  .argument('<supabase-anon-key>', 'Supabase anon key from team admin')
  .option('-n, --name <name>', 'Your display name')
  .option('-e, --email <email>', 'Your email address')
  .action(async (workspaceId: string, accessKey: string, supabaseUrl: string, supabaseAnonKey: string, options) => {
    console.log('🤝 Joining workspace...');

    // Create .env file with all required settings
    const envContent = `# Cursor Share Sync - Team Configuration
# Simple team file sharing for Cursor AI outputs

# Supabase Configuration (provided by admin)
SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${supabaseAnonKey}

# Team Workspace (provided by admin)
WORKSPACE_ID=${workspaceId}
WORKSPACE_ACCESS_KEY=${accessKey}

# Your Information
USER_DISPLAY_NAME=${options.name || 'Team Member'}
USER_EMAIL=${options.email || ''}

# File Watcher Settings (customize if needed)
WATCH_FOLDER=./cursor-share
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=.md,.txt
`;

    fs.writeFileSync('.env', envContent);
    console.log('✅ Configuration saved');

    // Test connection
    const { testConnection } = await import('./utils/test-connection');
    await testConnection();

    console.log('\n🎉 Successfully joined workspace!');
    console.log('\nNext steps:');
    console.log('1. Run: npx cursor-share-sync start');
    console.log('2. Drop markdown files in the cursor-share folder');
    console.log('3. Watch them sync with your team!');
  });

program
  .command('start')
  .description('Start the file watcher')
  .action(async () => {
    console.log('🚀 Starting Cursor Share Sync...');

    // Check if .env exists
    if (!fs.existsSync('.env')) {
      console.error('❌ No configuration found!');
      console.log('\nFirst time setup:');
      console.log('• Team admin: npx cursor-share-sync setup');
      console.log('• Team members: npx cursor-share-sync join <workspace-id> <access-key>');
      process.exit(1);
    }

    // Import and run the main application (it will auto-initialize)
    await import('./index');
  });

program
  .command('test')
  .description('Test connection to Supabase')
  .action(async () => {
    const { testConnection } = await import('./utils/test-connection');
    await testConnection();
  });

program.parse();