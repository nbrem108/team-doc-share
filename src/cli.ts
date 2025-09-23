#!/usr/bin/env node

/**
 * CLI for Cursor Share Sync
 * Enables simple team distribution via NPX
 */

import { Command } from 'commander';
import { setupWorkspace } from './utils/setup-workspace';
import { testConnection } from './utils/test-connection';
import { CursorShareSync } from './index';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();

program
  .name('cursor-share-sync')
  .description('Real-time file sharing for Cursor AI outputs')
  .version('1.0.0');

program
  .command('setup')
  .description('Set up a new workspace (run this once per team)')
  .action(async () => {
    console.log('🏗️  Setting up new Cursor Share Sync workspace...');

    try {
      const result = await setupWorkspace();
      console.log('\n🎉 Workspace setup complete!');
      console.log('\n📋 Share these credentials with your team:');
      console.log(`npx cursor-share-sync join ${result.workspaceId} ${result.accessKey}`);
    } catch (error) {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    }
  });

program
  .command('join')
  .description('Join an existing workspace')
  .argument('<workspace-id>', 'Workspace ID from team admin')
  .argument('<access-key>', 'Access key from team admin')
  .option('-n, --name <name>', 'Your display name')
  .option('-e, --email <email>', 'Your email address')
  .action(async (workspaceId: string, accessKey: string, options) => {
    console.log('🤝 Joining workspace...');

    // Create .env file
    const envContent = `# Cursor Share Sync Configuration
SUPABASE_URL=${process.env.SUPABASE_URL || 'https://wmjrycdtqrcygorokudy.supabase.co'}
SUPABASE_ANON_KEY=${process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtanJ5Y2R0cXJjeWdvcm9rdWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1Nzk3MTUsImV4cCI6MjA3NDE1NTcxNX0.bKhev7W0dsMYGxFsiT81CIU5N-e8y8MtCip-k4K9vGI'}

# Team Workspace
WORKSPACE_ID=${workspaceId}
WORKSPACE_ACCESS_KEY=${accessKey}

# Your Information
USER_DISPLAY_NAME=${options.name || 'Team Member'}
USER_EMAIL=${options.email || ''}

# File Watcher Settings
WATCH_FOLDER=./cursor-share
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=.md,.txt
`;

    fs.writeFileSync('.env', envContent);
    console.log('✅ Configuration saved to .env');

    // Test connection
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

    // Start the application
    const app = new CursorShareSync();
    await app.initialize();
  });

program
  .command('test')
  .description('Test connection to Supabase')
  .action(async () => {
    await testConnection();
  });

program.parse();