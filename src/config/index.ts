import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from current working directory (where user runs the command)
// We call this in getConfig() to ensure it loads after process.cwd() is set correctly
const loadEnvironment = () => {
  const envPath = path.join(process.cwd(), '.env');
  const result = dotenv.config({ path: envPath });

  // Check if .env file exists but no variables were loaded (encoding issue)
  if (!result.error && Object.keys(result.parsed || {}).length === 0) {
    const fs = require('fs');
    if (fs.existsSync(envPath)) {
      console.error('❌ .env file found but no variables loaded!');
      console.log('💡 This usually means your .env file has encoding issues.');
      console.log('');
      console.log('🔧 Quick fix (run these commands):');
      console.log('  rm .env');
      console.log('  echo "SUPABASE_URL=your-actual-url" > .env');
      console.log('  echo "SUPABASE_ANON_KEY=your-actual-key" >> .env');
      console.log('');
      console.log('⚠️  Make sure to use your REAL Supabase credentials, not placeholders!');
      console.log('');
    }
  }
};

export interface Config {
  // Supabase configuration
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey?: string;

  // File watcher configuration
  watchFolder: string;
  maxFileSize: number; // in bytes
  allowedExtensions: string[];

  // Application configuration
  port: number;
  environment: 'development' | 'production' | 'test';
  logLevel: 'debug' | 'info' | 'warn' | 'error';

  // Team workspace configuration
  workspaceId?: string;
  userId?: string;
}

const getConfig = (): Config => {
  // Load environment variables when config is actually requested
  loadEnvironment();

  return {
    // Supabase configuration (required - no defaults)
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,

    // File watcher configuration
    watchFolder:
      process.env.WATCH_FOLDER ||
      path.join(process.cwd(), 'team-docs'),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    allowedExtensions: (process.env.ALLOWED_EXTENSIONS || '.md,.txt')
      .split(',')
      .map((ext) => ext.trim()),

    // Application configuration
    port: parseInt(process.env.PORT || '3000'),
    environment: (process.env.NODE_ENV as any) || 'development',
    logLevel: (process.env.LOG_LEVEL as any) || 'info',

    // Team workspace configuration
    workspaceId: process.env.WORKSPACE_ID,
    userId: process.env.USER_ID,
  };
};

export const config = getConfig();

export const validateConfig = (): boolean => {
  const required = ['supabaseUrl', 'supabaseAnonKey'];
  const missing = required.filter((key) => !config[key as keyof Config]);

  if (missing.length > 0) {
    console.error(`Missing required configuration: ${missing.join(', ')}`);
    return false;
  }

  return true;
};