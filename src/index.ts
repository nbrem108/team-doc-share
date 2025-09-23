/**
 * Main entry point for Cursor Share Sync
 * Real-time file sharing for Cursor AI outputs
 */

import { config, validateConfig } from './config';
import { initializeSupabase } from './services/supabase';
import { FileWatcher } from './services/file-watcher';
import { SyncService } from './services/sync-service';

class CursorShareSync {
  private fileWatcher: FileWatcher;
  private syncService: SyncService;

  constructor() {
    this.fileWatcher = new FileWatcher();
    this.syncService = SyncService.getInstance();
  }

  async initialize() {
    console.log('🚀 Cursor Share Sync - Starting...');

    // Validate configuration
    if (!validateConfig()) {
      console.error('❌ Configuration validation failed');
      process.exit(1);
    }

    try {
      // Initialize Supabase connection
      console.log('🔧 Initializing Supabase connection...');
      initializeSupabase();
      console.log('✅ Supabase connection ready');

      // Set up real-time subscriptions if workspace is configured
      if (config.workspaceId) {
        console.log('🔔 Setting up real-time subscriptions...');
        await this.syncService.setupRealTimeSubscription(
          config.workspaceId,
          this.handleRealTimeEvent.bind(this)
        );
      }

      // Start file watcher
      console.log('👀 Starting file watcher...');
      this.fileWatcher.start();

      console.log('\n🎉 Cursor Share Sync is ready!');
      console.log(`📁 Watching folder: ${config.watchFolder}`);
      console.log(`🔗 Workspace ID: ${config.workspaceId || 'default'}`);
      console.log(`👤 User ID: ${config.userId || 'anonymous'}`);
      console.log('\n💡 Drop markdown files into the watch folder to sync them instantly!');

    } catch (error) {
      console.error('❌ Initialization failed:', error);
      process.exit(1);
    }
  }

  private handleRealTimeEvent(event: any) {
    const { eventType, new: newRecord, old: oldRecord } = event;

    switch (eventType) {
      case 'INSERT':
        console.log(`🔔 New file shared: ${newRecord.filename}`);
        break;
      case 'UPDATE':
        console.log(`🔔 File updated: ${newRecord.filename}`);
        break;
      case 'DELETE':
        console.log(`🔔 File deleted: ${oldRecord.filename}`);
        break;
    }
  }

  async shutdown() {
    console.log('\n🛑 Shutting down Cursor Share Sync...');
    this.fileWatcher.stop();
    console.log('✅ Shutdown complete');
  }

  getStatus() {
    return {
      watcher: this.fileWatcher.getStatus(),
      config: {
        watchFolder: config.watchFolder,
        workspaceId: config.workspaceId,
        userId: config.userId,
        allowedExtensions: config.allowedExtensions,
      },
    };
  }
}

// Handle graceful shutdown
const app = new CursorShareSync();

process.on('SIGINT', async () => {
  await app.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await app.shutdown();
  process.exit(0);
});

// Start the application
app.initialize().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});

export { CursorShareSync };