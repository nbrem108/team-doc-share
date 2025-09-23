import * as chokidar from 'chokidar';
import * as path from 'path';
import * as fs from 'fs';
import { config } from '../config';
import { FileMetadata, WatcherStatus } from '../types';

export class FileWatcher {
  private watcher: chokidar.FSWatcher | null = null;
  private status: WatcherStatus = {
    isRunning: false,
    lastSync: null,
    errorCount: 0,
    filesWatched: 0,
  };

  constructor() {
    this.ensureWatchFolderExists();
  }

  private ensureWatchFolderExists() {
    if (!fs.existsSync(config.watchFolder)) {
      console.log(`📁 Creating watch folder: ${config.watchFolder}`);
      fs.mkdirSync(config.watchFolder, { recursive: true });
    }
  }

  private isValidFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return config.allowedExtensions.includes(ext);
  }

  private async getFileMetadata(filePath: string): Promise<FileMetadata | null> {
    try {
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      const filename = path.basename(filePath);
      const relativePath = path.relative(config.watchFolder, filePath);

      // Check file size limit
      if (stats.size > config.maxFileSize) {
        console.warn(`⚠️  File ${filename} exceeds size limit (${stats.size} bytes)`);
        return null;
      }

      // Extract sprint folder from path if exists
      const pathParts = relativePath.split(path.sep);
      const sprintFolder = pathParts.length > 1 ? pathParts[0] : undefined;

      return {
        id: '', // Will be set by database
        filename,
        filepath: relativePath,
        content,
        size: stats.size,
        mimeType: this.getMimeType(filename),
        uploadedAt: new Date(),
        updatedAt: new Date(),
        uploadedBy: config.userId || 'anonymous',
        workspaceId: config.workspaceId || 'default',
        sprintFolder,
        tags: this.extractTags(content),
      };
    } catch (error) {
      console.error(`❌ Error reading file ${filePath}:`, error);
      return null;
    }
  }

  private getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
      case '.md':
        return 'text/markdown';
      case '.txt':
        return 'text/plain';
      default:
        return 'text/plain';
    }
  }

  private extractTags(content: string): string[] {
    // Extract hashtags from content
    const tagRegex = /#(\w+)/g;
    const tags: string[] = [];
    let match;

    while ((match = tagRegex.exec(content)) !== null) {
      tags.push(match[1].toLowerCase());
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  private async handleFileEvent(eventType: 'add' | 'change' | 'unlink', filePath: string) {
    if (!this.isValidFile(filePath)) {
      return;
    }

    const filename = path.basename(filePath);
    console.log(`📄 ${eventType === 'unlink' ? 'Deleting' : 'Syncing'} ${filename}...`);

    try {
      if (eventType === 'unlink') {
        await this.handleFileDelete(filePath);
      } else {
        const metadata = await this.getFileMetadata(filePath);
        if (metadata) {
          if (eventType === 'add') {
            await this.handleFileCreate(metadata);
          } else {
            await this.handleFileUpdate(metadata);
          }
        }
      }

      this.status.lastSync = new Date();
    } catch (error) {
      console.error(`❌ Failed to sync ${filename}:`, error);
      this.status.errorCount++;
    }
  }

  private async handleFileCreate(metadata: FileMetadata) {
    const { SyncService } = await import('./sync-service');
    const syncService = SyncService.getInstance();
    await syncService.uploadFile(metadata);
  }

  private async handleFileUpdate(metadata: FileMetadata) {
    const { SyncService } = await import('./sync-service');
    const syncService = SyncService.getInstance();
    await syncService.updateFile(metadata);
  }

  private async handleFileDelete(filePath: string) {
    const filename = path.basename(filePath);
    const { SyncService } = await import('./sync-service');
    const syncService = SyncService.getInstance();
    await syncService.deleteFile(filename, config.workspaceId || 'default');
  }

  public start(): void {
    if (this.status.isRunning) {
      return;
    }

    this.watcher = chokidar.watch(config.watchFolder, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: false, // Process existing files on startup
    });

    this.watcher
      .on('add', (filePath) => this.handleFileEvent('add', filePath))
      .on('change', (filePath) => this.handleFileEvent('change', filePath))
      .on('unlink', (filePath) => this.handleFileEvent('unlink', filePath))
      .on('error', (error) => {
        console.error('❌ Watcher error:', error);
        this.status.errorCount++;
      })
      .on('ready', () => {
        this.status.isRunning = true;
        this.updateFileCount();
      });
  }

  public stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      this.status.isRunning = false;
      console.log('🛑 File watcher stopped');
    }
  }

  private updateFileCount(): void {
    try {
      const files = this.getAllWatchedFiles();
      this.status.filesWatched = files.length;
      if (files.length > 0) {
        console.log(`📊 Found ${files.length} existing files`);
      }
    } catch (error) {
      console.error('❌ Error counting files:', error);
    }
  }

  private getAllWatchedFiles(): string[] {
    const files: string[] = [];

    function scanDirectory(dir: string) {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else {
          const ext = path.extname(item).toLowerCase();
          if (config.allowedExtensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    }

    if (fs.existsSync(config.watchFolder)) {
      scanDirectory(config.watchFolder);
    }

    return files;
  }

  public getStatus(): WatcherStatus {
    return { ...this.status };
  }
}