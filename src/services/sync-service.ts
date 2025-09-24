import { getSupabaseClient } from './supabase';
import { FileMetadata, FileEvent } from '../types';
import { config } from '../config';
import * as path from 'path';

const supabase = getSupabaseClient();

export class SyncService {
  private static instance: SyncService;

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private constructor() {}

  async uploadFile(metadata: FileMetadata): Promise<string | null> {
    try {
      const storageKey = await this.uploadToStorage(metadata);
      if (!storageKey) {
        throw new Error('Storage upload failed');
      }

      const fileRecord = await this.saveToDatabase(metadata, storageKey);
      if (!fileRecord) {
        throw new Error('Database save failed');
      }

      await this.createFileEvent(fileRecord.id, 'created');
      console.log(`✅ Synced by ${metadata.uploadedBy}: ${metadata.filename}`);
      return fileRecord.id;

    } catch (error) {
      console.error(`❌ Failed to sync ${metadata.filename}:`, error);
      return null;
    }
  }

  async updateFile(metadata: FileMetadata): Promise<boolean> {
    try {
      const { data: existingFile, error: findError } = await supabase
        .from('files')
        .select('id, storage_path')
        .eq('filename', metadata.filename)
        .eq('workspace_id', metadata.workspaceId)
        .single();

      if (findError || !existingFile) {
        return (await this.uploadFile(metadata)) !== null;
      }

      const storageKey = await this.uploadToStorage(metadata, existingFile.storage_path);
      if (!storageKey) {
        throw new Error('Storage update failed');
      }

      const { error: updateError } = await supabase
        .from('files')
        .update({
          content: metadata.content,
          file_size: metadata.size,
          updated_at: new Date().toISOString(),
          tags: metadata.tags,
          sprint_folder: metadata.sprintFolder,
        })
        .eq('id', existingFile.id);

      if (updateError) {
        throw updateError;
      }

      await this.createFileEvent(existingFile.id, 'updated');
      console.log(`✅ Updated: ${metadata.filename}`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to update ${metadata.filename}:`, error);
      return false;
    }
  }

  async deleteFile(relativePath: string, workspaceId: string): Promise<boolean> {
    const filename = relativePath.split(/[/\\]/).pop() || relativePath;
    try {
      console.log(`☁️  Deleting file: ${filename}`);

      // 1. Find existing file record by original_path (preferred) or filename (fallback)
      let { data: existingFile, error: findError } = await supabase
        .from('files')
        .select('id, storage_path, filename')
        .eq('original_path', relativePath)
        .eq('workspace_id', workspaceId)
        .single();

      // Fallback to filename search if path search fails
      if (findError || !existingFile) {
        ({ data: existingFile, error: findError } = await supabase
          .from('files')
          .select('id, storage_path, filename')
          .eq('filename', filename)
          .eq('workspace_id', workspaceId)
          .single());
      }

      if (findError || !existingFile) {
        console.log(`⚠️  File not found in database: ${filename}`);
        return true; // Already deleted
      }

      // 2. Delete from storage
      if (existingFile.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('team-doc-files')
          .remove([existingFile.storage_path]);

        if (storageError) {
          console.warn(`⚠️  Storage deletion warning:`, storageError);
        }
      }

      // 3. Create delete event before removing from database
      await this.createFileEvent(existingFile.id, 'deleted');

      // 4. Delete from database
      const { error: deleteError } = await supabase
        .from('files')
        .delete()
        .eq('id', existingFile.id);

      if (deleteError) {
        throw deleteError;
      }

      console.log(`✅ Successfully deleted: ${filename}`);
      return true;

    } catch (error) {
      console.error(`❌ Delete failed for ${filename}:`, error);
      return false;
    }
  }

  private async uploadToStorage(metadata: FileMetadata, existingPath?: string): Promise<string | null> {
    try {
      // Create storage path: workspace_id/sprint_folder/filename
      const storagePath = existingPath || this.generateStoragePath(metadata);

      // Convert content to blob
      const fileBlob = new Blob([metadata.content], { type: metadata.mimeType });

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('team-doc-files')
        .upload(storagePath, fileBlob, {
          upsert: true, // Overwrite if exists
          contentType: metadata.mimeType,
        });

      if (error) {
        throw error;
      }

      return data.path;

    } catch (error) {
      console.error('❌ Storage upload error:', error);
      return null;
    }
  }

  private generateStoragePath(metadata: FileMetadata): string {
    const parts = [metadata.workspaceId];

    if (metadata.sprintFolder) {
      parts.push(metadata.sprintFolder);
    }

    parts.push(metadata.filename);

    return parts.join('/');
  }

  private async saveToDatabase(metadata: FileMetadata, storagePath: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('files')
        .insert({
          filename: metadata.filename,
          original_path: metadata.filepath,
          content: metadata.content,
          file_size: metadata.size,
          mime_type: metadata.mimeType,
          storage_path: storagePath,
          uploaded_by: null, // Set to null for development
          workspace_id: metadata.workspaceId,
          sprint_folder: metadata.sprintFolder,
          tags: metadata.tags,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;

    } catch (error) {
      console.error('❌ Database save error:', error);
      return null;
    }
  }

  private async createFileEvent(fileId: string, eventType: 'created' | 'updated' | 'deleted'): Promise<void> {
    try {
      const { error } = await supabase
        .from('file_events')
        .insert({
          file_id: fileId,
          event_type: eventType,
          user_id: null, // Set to null for development
          workspace_id: config.workspaceId || 'default',
        });

      if (error) {
        console.warn('⚠️  Event creation warning:', error);
      }

    } catch (error) {
      console.warn('⚠️  Event creation error:', error);
    }
  }

  async getFileList(workspaceId: string): Promise<FileMetadata[]> {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('❌ Error fetching file list:', error);
      return [];
    }
  }

  async downloadFile(fileId: string): Promise<boolean> {
    try {
      // Get file record from database
      const { data: fileRecord, error: dbError } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (dbError || !fileRecord) {
        console.error(`❌ Failed to fetch file record:`, dbError);
        return false;
      }

      // Download file content from storage
      const { data: fileData, error: storageError } = await supabase.storage
        .from('team-doc-files')
        .download(fileRecord.storage_path);

      if (storageError || !fileData) {
        console.error(`❌ Failed to download file:`, storageError);
        return false;
      }

      // Convert blob to text
      const content = await fileData.text();

      // Write to local file system
      const fs = await import('fs');
      const path = await import('path');

      // Use original_path to preserve folder structure, fallback to filename if not available
      const relativePath = fileRecord.original_path || fileRecord.filename;
      const localPath = path.join(config.watchFolder, relativePath);

      // Create directory if it doesn't exist
      const dir = path.dirname(localPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(localPath, content, 'utf8');

      // Mark file as recently downloaded to prevent upload loop
      const { FileWatcher } = await import('./file-watcher');
      const fileWatcher = FileWatcher.getInstance();
      fileWatcher.markAsDownloaded(relativePath);

      console.log(`📥 Downloaded: ${fileRecord.filename}`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to download file:`, error);
      return false;
    }
  }

  async setupRealTimeSubscription(workspaceId: string, callback: (event: any) => void): Promise<void> {
    try {
      const channel = supabase
        .channel(`workspace-${workspaceId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'files',
          },
          (payload) => {
            // Filter by workspace client-side since RLS might be blocking
            const newRecord = payload.new as any;
            const oldRecord = payload.old as any;
            if (newRecord?.workspace_id === workspaceId || oldRecord?.workspace_id === workspaceId) {
              callback(payload);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('🔔 Team notifications active');
          } else if (status === 'CHANNEL_ERROR') {
            console.log('⚠️  Team notifications unavailable (files will still sync)');
          }
        });

    } catch (error) {
      console.log('⚠️  Real-time notifications disabled (files will still sync)');
    }
  }

  async getFileContent(filename: string, workspaceId: string): Promise<string | null> {
    try {
      // Get file record from database
      const { data: fileRecord, error: dbError } = await supabase
        .from('files')
        .select('storage_path, content')
        .eq('filename', filename)
        .eq('workspace_id', workspaceId)
        .single();

      if (dbError || !fileRecord) {
        return null; // File doesn't exist
      }

      // If content is stored in database, return it directly
      if (fileRecord.content) {
        return fileRecord.content;
      }

      // Otherwise, download from storage
      if (fileRecord.storage_path) {
        const { data: fileData, error: storageError } = await supabase.storage
          .from('team-doc-files')
          .download(fileRecord.storage_path);

        if (storageError || !fileData) {
          return null;
        }

        return await fileData.text();
      }

      return null;
    } catch (error) {
      console.error(`❌ Error getting file content for ${filename}:`, error);
      return null;
    }
  }

  async getWorkspaceFiles(workspaceId: string): Promise<any[] | null> {
    try {
      const { data: files, error } = await supabase
        .from('files')
        .select('id, filename, original_path, updated_at, uploaded_by, size')
        .eq('workspace_id', workspaceId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching workspace files:', error);
        return null;
      }

      return files || [];
    } catch (error) {
      console.error('❌ Error getting workspace files:', error);
      return null;
    }
  }
}