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
    console.log('🚀 Cursor Share Sync starting...');

    // Validate configuration
    if (!validateConfig()) {
      console.error('❌ Configuration error - check your .env file');
      process.exit(1);
    }

    try {
      // Initialize Supabase connection (silent)
      initializeSupabase();

      // Set up real-time subscriptions if workspace is configured
      if (config.workspaceId) {
        await this.syncService.setupRealTimeSubscription(
          config.workspaceId,
          this.handleRealTimeEvent.bind(this)
        );
      }

      // Start file watcher
      this.fileWatcher.start();

      console.log('✅ Ready! Watching for files...');
      console.log(`📁 Folder: ${config.watchFolder}`);

      if (config.workspaceId) {
        console.log(`👥 Workspace: ${config.workspaceId.substring(0, 8)}...`);
      } else {
        console.log('⚠️  No workspace configured - files will only be saved locally');
        console.log('💡 Run "npx cursor-share-sync setup" or "join" to enable team sharing');
      }
      console.log('');

    } catch (error) {
      console.error('❌ Failed to start:', error);
      process.exit(1);
    }
  }

  private async handleRealTimeEvent(event: any) {
    const { eventType, new: newRecord, old: oldRecord } = event;

    switch (eventType) {
      case 'INSERT':
        if (newRecord && newRecord.filename) {
          console.log(`📄 Team file added: ${newRecord.filename}`);
          // Download the file to local folder
          await this.syncService.downloadFile(newRecord.id);
        }
        break;
      case 'UPDATE':
        if (newRecord && newRecord.filename) {
          console.log(`📝 Team file updated: ${newRecord.filename}`);
          // Download the updated file
          await this.syncService.downloadFile(newRecord.id);
        }
        break;
      case 'DELETE':
        if (oldRecord && oldRecord.filename) {
          console.log(`🗑️ Team file deleted: ${oldRecord.filename}`);
          // TODO: Remove file from local folder
        }
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