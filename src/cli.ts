#!/usr/bin/env node

/**
 * CLI for Team Doc Share
 * Instant team document sharing via NPX
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();

program
  .name('team-doc-share')
  .description('Instant team document sharing - Drop files, sync with your team')
  .version('1.0.0');

program
  .command('setup')
  .description('Set up a new workspace (requires Supabase credentials)')
  .action(async () => {
    console.log('🏗️  Setting up new team document sharing workspace...');
    console.log('');

    // Check if .env exists in current working directory
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
      console.error('❌ No .env file found in current directory!');
      console.log(`\n📁 Looking for: ${envPath}`);
      console.log('\n📋 Simple setup:');
      console.log('1. Create a .env file in your current directory');
      console.log('2. Copy your Supabase credentials from Settings → API');
      console.log('3. Add these two lines to .env:');
      console.log('   SUPABASE_URL=https://your-project.supabase.co');
      console.log('   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
      console.log('');
      console.log('💡 Don\'t worry about encoding - we\'ll auto-fix any issues!');
      console.log('💡 Use the anon/public key from Settings → API (starts with eyJ...)');
      console.log('');
      console.log('4. Set up your Supabase database:');
      console.log('   - Run: npx team-doc-share sql (to display the SQL)');
      console.log('   - Copy and paste the displayed SQL into Supabase SQL Editor');
      console.log('5. Run this setup command again');
      process.exit(1);
    }

    try {
      const { setupWorkspace } = await import('./utils/setup-workspace');
      const result = await setupWorkspace();

      console.log('\n🎉 Workspace setup complete!');
      console.log('\n📋 Share this command with your team (copy exactly):');
      console.log(`\nnpx team-doc-share join ${result.workspaceId} ${result.accessKey} ${process.env.SUPABASE_URL} "${process.env.SUPABASE_ANON_KEY}"\n`);
      console.log('💡 Important: The anon key is quoted to prevent truncation issues');
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

    // Validate inputs
    console.log('🔍 Validating credentials...');

    if (!workspaceId || workspaceId.length < 10) {
      console.error('❌ Invalid workspace ID. Should be a long UUID.');
      process.exit(1);
    }

    if (!accessKey || accessKey.length < 20) {
      console.error('❌ Invalid access key. Should be a long base64 string.');
      process.exit(1);
    }

    if (!supabaseUrl || !supabaseUrl.includes('.supabase.co')) {
      console.error('❌ Invalid Supabase URL. Should end with .supabase.co');
      process.exit(1);
    }

    if (!supabaseAnonKey || !supabaseAnonKey.startsWith('eyJ') || supabaseAnonKey.length < 100) {
      console.error('❌ Invalid anon key. Should start with "eyJ" and be 100+ characters long.');
      console.log(`📏 Received key length: ${supabaseAnonKey ? supabaseAnonKey.length : 0} characters`);
      console.log(`🔍 Key preview: ${supabaseAnonKey ? supabaseAnonKey.slice(0, 50) + '...' : 'none'}`);
      console.log('');
      console.log('💡 The anon key was likely truncated by shell special characters (~, &, etc)');
      console.log('');
      console.log('🔧 Solutions:');
      console.log('1. Put the ENTIRE anon key in quotes:');
      console.log('   npx team-doc-share join workspace-id access-key url "eyJyour-complete-anon-key"');
      console.log('');
      console.log('2. Or manually create .env file:');
      console.log('   echo "SUPABASE_ANON_KEY=your-complete-key" > .env');
      console.log('   (then add other variables and run npx team-doc-share start)');
      process.exit(1);
    }

    console.log(`✅ Workspace ID: ${workspaceId.slice(0, 8)}...`);
    console.log(`✅ Access Key: ${accessKey.slice(0, 10)}...`);
    console.log(`✅ Supabase URL: ${supabaseUrl}`);
    console.log(`✅ Anon Key: ${supabaseAnonKey.slice(0, 20)}... (${supabaseAnonKey.length} chars)`);

    // Create .env file with all required settings
    const envContent = `# Team Doc Share - Team Configuration
# Instant team document sharing

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
WATCH_FOLDER=./team-docs
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=.md,.txt
`;

    // Write with explicit UTF-8 encoding to prevent issues
    fs.writeFileSync('.env', envContent, 'utf8');
    console.log('✅ Configuration saved');

    // Test connection
    const { testConnection } = await import('./utils/test-connection');
    await testConnection();

    console.log('\n🎉 Successfully joined workspace!');
    console.log('\nNext steps:');
    console.log('1. Run: npx team-doc-share start');
    console.log('2. Drop markdown files in the team-docs folder');
    console.log('3. Watch them sync with your team!');
  });

program
  .command('start')
  .description('Start the file watcher')
  .action(async () => {
    console.log('🚀 Starting Team Doc Share...');

    // Check if .env exists in current working directory
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
      console.error('❌ No configuration found!');
      console.log(`\n📁 Looking for: ${envPath}`);
      console.log('\nFirst time setup:');
      console.log('• Team admin: npx team-doc-share setup');
      console.log('• Team members: npx team-doc-share join <workspace-id> <access-key> <supabase-url> <supabase-anon-key>');
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

program
  .command('sql')
  .description('Display the database setup SQL (copy and paste into Supabase)')
  .action(async () => {
    const fs = await import('fs');
    const path = await import('path');

    try {
      // Try to find SQL file in npm package first
      const npmSqlPath = path.join(__dirname, '..', 'database', 'complete_setup.sql');
      let sqlContent = '';

      if (fs.existsSync(npmSqlPath)) {
        sqlContent = fs.readFileSync(npmSqlPath, 'utf8');
      } else {
        console.error('❌ SQL file not found in package');
        console.log('\n📥 Download directly from:');
        console.log('https://github.com/nbrem108/team-doc-share/blob/main/database/complete_setup.sql');
        process.exit(1);
      }

      console.log('📋 Copy the SQL below and paste into your Supabase SQL Editor:');
      console.log('=' .repeat(70));
      console.log(sqlContent);
      console.log('=' .repeat(70));
      console.log('\n✅ After running this SQL, come back and run: npx team-doc-share setup');

    } catch (error) {
      console.error('❌ Error reading SQL file:', error);
      console.log('\n📥 Download directly from:');
      console.log('https://github.com/nbrem108/team-doc-share/blob/main/database/complete_setup.sql');
    }
  });

program.parse();