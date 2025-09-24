import * as chokidar from 'chokidar';
import * as path from 'path';
import * as fs from 'fs';
import { config } from '../config';
import { FileMetadata, WatcherStatus } from '../types';
import { SyncService } from './sync-service';

export class FileWatcher {
  private watcher: chokidar.FSWatcher | null = null;
  private status: WatcherStatus = {
    isRunning: false,
    lastSync: null,
    errorCount: 0,
    filesWatched: 0,
  };
  private recentlyDownloaded: Set<string> = new Set();
  private static instance: FileWatcher;

  constructor() {
    this.ensureWatchFolderExists();
  }

  public static getInstance(): FileWatcher {
    if (!FileWatcher.instance) {
      FileWatcher.instance = new FileWatcher();
    }
    return FileWatcher.instance;
  }

  public markAsDownloaded(filename: string): void {
    this.recentlyDownloaded.add(filename);
    // Remove from set after 5 seconds to prevent permanent blocking
    setTimeout(() => {
      this.recentlyDownloaded.delete(filename);
    }, 5000);
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
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const filename = path.basename(filePath);

      // Get previous version for diff tracking
      const previousContent = await this.getPreviousFileContent(filename);

      // Add attribution header with diff information
      const content = await this.addAttributionHeader(originalContent, filename, previousContent);
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
        uploadedBy: config.userDisplayName || config.userEmail || config.userId || 'anonymous',
        workspaceId: config.workspaceId || 'default',
        sprintFolder,
        tags: this.extractTags(content),
      };
    } catch (error) {
      console.error(`❌ Error reading file ${filePath}:`, error);
      return null;
    }
  }

  private async getPreviousFileContent(filename: string): Promise<string | null> {
    try {
      const syncService = SyncService.getInstance();
      return await syncService.getFileContent(filename, config.workspaceId || 'default');
    } catch (error) {
      // File doesn't exist yet, this is a new file
      return null;
    }
  }

  private addAttributionHeader(content: string, filename: string, previousContent?: string | null): string {
    const ext = path.extname(filename).toLowerCase();
    const userName = config.userDisplayName || config.userEmail || 'Team Member';
    const timestamp = new Date().toLocaleString();

    // For markdown files
    if (ext === '.md') {
      // Check if this is a new file or an update
      if (!content.includes('<!-- Team Doc Share Attribution -->')) {
        // New file - add initial attribution
        const attributionHeader = `<!-- Team Doc Share Attribution -->
> **Originally shared by:** ${userName}
> **Date:** ${timestamp}
> **File:** ${filename}

**📝 Edit History:**
- Created by ${userName} on ${timestamp}

---

`;
        return attributionHeader + content;
      } else {
        // Existing file - add amendment to history with diff information
        const historyPattern = /(\*\*📝 Edit History:\*\*\n(?:- .+\n)*)/;
        const match = content.match(historyPattern);

        if (match) {
          // Generate diff information
          let diffInfo = '';
          if (previousContent) {
            const changes = this.generateDiffInfo(previousContent, content);
            if (changes.length > 0) {
              diffInfo = `\n  ${changes.join('\n  ')}`;
            }
          }

          const newHistoryEntry = `- Updated by ${userName} on ${timestamp}${diffInfo}\n`;
          const updatedHistory = match[1] + newHistoryEntry;

          // Also add inline comments for changes
          let updatedContent = content.replace(historyPattern, updatedHistory);
          if (previousContent) {
            updatedContent = this.addInlineChangeComments(updatedContent, previousContent, userName, timestamp);
          }

          return updatedContent;
        }
      }
    }

    // For text files
    if (ext === '.txt') {
      if (!content.includes('=== SHARED BY ===')) {
        // New file
        const attributionHeader = `=== SHARED BY ===
Originally shared by: ${userName}
Date: ${timestamp}
File: ${filename}

EDIT HISTORY:
- Created by ${userName} on ${timestamp}
==================

`;
        return attributionHeader + content;
      } else {
        // Existing file - add to history
        const historyPattern = /(EDIT HISTORY:\n(?:- .+\n)*)/;
        const match = content.match(historyPattern);

        if (match) {
          const newHistoryEntry = `- Updated by ${userName} on ${timestamp}\n`;
          const updatedHistory = match[1] + newHistoryEntry;
          return content.replace(historyPattern, updatedHistory);
        }
      }
    }

    return content;
  }

  private generateDiffInfo(previousContent: string, currentContent: string): string[] {
    const changes: string[] = [];

    // Remove attribution headers for comparison
    const cleanPrevious = this.removeAttributionHeaders(previousContent);
    const cleanCurrent = this.removeAttributionHeaders(currentContent);

    const previousLines = cleanPrevious.split('\n');
    const currentLines = cleanCurrent.split('\n');

    // Simple diff algorithm - detect line changes, additions, and deletions
    let lineNum = 1;
    let prevIndex = 0;
    let currIndex = 0;

    while (prevIndex < previousLines.length || currIndex < currentLines.length) {
      if (prevIndex >= previousLines.length) {
        // Added lines at the end
        const addedCount = currentLines.length - currIndex;
        changes.push(`Lines ${lineNum}-${lineNum + addedCount - 1}: Added new content`);
        break;
      } else if (currIndex >= currentLines.length) {
        // Deleted lines at the end
        const deletedCount = previousLines.length - prevIndex;
        changes.push(`Lines ${lineNum}: Deleted ${deletedCount} line(s)`);
        break;
      } else if (previousLines[prevIndex] !== currentLines[currIndex]) {
        // Line changed
        changes.push(`Line ${lineNum}: Modified content`);
        prevIndex++;
        currIndex++;
        lineNum++;
      } else {
        // Lines are the same
        prevIndex++;
        currIndex++;
        lineNum++;
      }
    }

    return changes.slice(0, 5); // Limit to first 5 changes to keep header readable
  }

  private addInlineChangeComments(content: string, previousContent: string, userName: string, timestamp: string): string {
    // For now, add a simple comment at the end indicating changes were made
    // This prevents the file from becoming too cluttered with inline comments
    const changeComment = `\n<!-- Changes made by ${userName} on ${timestamp} -->\n`;

    // Find the end of the attribution section
    const endOfAttribution = content.indexOf('---\n');
    if (endOfAttribution !== -1) {
      const beforeAttribution = content.substring(0, endOfAttribution + 4);
      const afterAttribution = content.substring(endOfAttribution + 4);
      return beforeAttribution + changeComment + afterAttribution;
    }

    return content + changeComment;
  }

  private removeAttributionHeaders(content: string): string {
    // Remove attribution headers for clean comparison
    const attributionStart = content.indexOf('<!-- Team Doc Share Attribution -->');
    const contentStart = content.indexOf('---\n');

    if (attributionStart !== -1 && contentStart !== -1) {
      return content.substring(contentStart + 4);
    }

    return content;
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
    const relativePath = path.relative(config.watchFolder, filePath);

    // Skip files that were recently downloaded to prevent infinite loop
    if (this.recentlyDownloaded.has(relativePath)) {
      console.log(`⏭️  Skipping recently downloaded file: ${filename}`);
      return;
    }

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
    const relativePath = path.relative(config.watchFolder, filePath);
    const { SyncService } = await import('./sync-service');
    const syncService = SyncService.getInstance();
    await syncService.deleteFile(relativePath, config.workspaceId || 'default');
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