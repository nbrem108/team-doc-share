import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from current working directory (where user runs the command)
// We call this in getConfig() to ensure it loads after process.cwd() is set correctly
const loadEnvironment = () => {
  const envPath = path.join(process.cwd(), '.env');
  const fs = require('fs');

  let result = dotenv.config({ path: envPath });

  // Check if .env file exists but no variables were loaded (encoding issue)
  if (!result.error && Object.keys(result.parsed || {}).length === 0 && fs.existsSync(envPath)) {
    console.log('🔧 Detected encoding issue in .env file. Auto-fixing...');

    try {
      // Read the file with different encodings and try to fix it
      let content = '';

      // Try UTF-16 first (common Windows issue)
      try {
        content = fs.readFileSync(envPath, 'utf16le');
        // Remove BOM if present
        if (content.charCodeAt(0) === 0xFEFF) {
          content = content.slice(1);
        }
      } catch {
        // Fallback to binary read and manual conversion
        try {
          const buffer = fs.readFileSync(envPath);
          // Check for UTF-16 BOM
          if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
            content = buffer.toString('utf16le').slice(1);
          } else if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
            // UTF-8 BOM
            content = buffer.toString('utf8').slice(1);
          } else {
            content = buffer.toString('utf8');
          }
        } catch {
          console.error('❌ Could not read .env file with any encoding');
          return;
        }
      }

      if (content && content.includes('SUPABASE_URL')) {
        // Write back as clean UTF-8
        fs.writeFileSync(envPath, content, 'utf8');
        console.log('✅ Fixed .env file encoding automatically');

        // Reload with fixed encoding
        result = dotenv.config({ path: envPath });

        if (Object.keys(result.parsed || {}).length > 0) {
          console.log('✅ Environment variables loaded successfully');
        }
      }
    } catch (error) {
      console.error('❌ Auto-fix failed. Please recreate your .env file:');
      console.log('');
      console.log('Windows PowerShell:');
      console.log('  Remove-Item .env -ErrorAction SilentlyContinue');
      console.log('  Set-Content -Path ".env" -Value "SUPABASE_URL=your-actual-url" -Encoding UTF8');
      console.log('  Add-Content -Path ".env" -Value "SUPABASE_ANON_KEY=your-actual-key" -Encoding UTF8');
      console.log('');
      console.log('⚠️  Make sure to use your REAL Supabase credentials!');
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