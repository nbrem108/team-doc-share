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
    this.fileWatcher = FileWatcher.getInstance();
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

        // Sync existing files from workspace on startup
        console.log('🔄 Syncing existing workspace files...');
        await this.syncExistingFiles();
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

  private async syncExistingFiles() {
    try {
      if (!config.workspaceId) return;

      // Get all files from the workspace
      const workspaceFiles = await this.syncService.getWorkspaceFiles(config.workspaceId);

      if (!workspaceFiles || workspaceFiles.length === 0) {
        console.log('📊 Found 0 existing files');
        return;
      }

      console.log(`📊 Found ${workspaceFiles.length} existing files`);

      // Download each file that doesn't exist locally or is outdated
      let downloadedCount = 0;
      let skippedCount = 0;

      for (const file of workspaceFiles) {
        const shouldDownload = await this.shouldDownloadFile(file);

        if (shouldDownload) {
          // Mark as downloaded to prevent upload when file is created locally
          this.fileWatcher.markAsDownloaded(file.original_path || file.filename);

          const success = await this.syncService.downloadFile(file.id);
          if (success) {
            downloadedCount++;
            console.log(`📄 Downloaded: ${file.filename}`);
          }
        } else {
          skippedCount++;
        }
      }

      if (downloadedCount > 0) {
        console.log(`✅ Downloaded ${downloadedCount} files, skipped ${skippedCount} existing files`);
      } else {
        console.log('✅ All files are up to date');
      }

    } catch (error) {
      console.error('⚠️  Failed to sync existing files (will continue with real-time sync):', error);
    }
  }

  private async shouldDownloadFile(file: any): Promise<boolean> {
    try {
      const fs = await import('fs');
      const path = await import('path');

      const relativePath = file.original_path || file.filename;
      const localPath = path.join(config.watchFolder, relativePath);

      // If file doesn't exist locally, download it
      if (!fs.existsSync(localPath)) {
        return true;
      }

      // If file exists, check if remote is newer
      const localStats = fs.statSync(localPath);
      const remoteUpdated = new Date(file.updated_at);
      const localUpdated = localStats.mtime;

      return remoteUpdated > localUpdated;
    } catch (error) {
      // If we can't check, err on the side of downloading
      return true;
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
          // Remove file from local folder
          await this.handleLocalFileDelete(oldRecord);
        }
        break;
    }
  }

  private async handleLocalFileDelete(fileRecord: any) {
    try {
      const fs = await import('fs');
      const path = await import('path');

      // Use original_path to preserve folder structure, fallback to filename
      const relativePath = fileRecord.original_path || fileRecord.filename;
      const localPath = path.join(config.watchFolder, relativePath);

      if (fs.existsSync(localPath)) {
        // Mark file as recently downloaded to prevent upload when we delete it
        this.fileWatcher.markAsDownloaded(relativePath);

        fs.unlinkSync(localPath);
        console.log(`🗑️ Removed local file: ${fileRecord.filename}`);
      }
    } catch (error) {
      console.error(`❌ Failed to delete local file: ${fileRecord.filename}`, error);
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