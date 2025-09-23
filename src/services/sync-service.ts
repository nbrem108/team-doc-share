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
      console.log(`☁️  Uploading file: ${metadata.filename}`);

      // 1. Upload file content to Supabase storage
      const storageKey = await this.uploadToStorage(metadata);
      if (!storageKey) {
        throw new Error('Failed to upload to storage');
      }

      // 2. Save metadata to database
      const fileRecord = await this.saveToDatabase(metadata, storageKey);
      if (!fileRecord) {
        throw new Error('Failed to save to database');
      }

      // 3. Create file event for activity tracking
      await this.createFileEvent(fileRecord.id, 'created');

      console.log(`✅ Successfully uploaded: ${metadata.filename}`);
      return fileRecord.id;

    } catch (error) {
      console.error(`❌ Upload failed for ${metadata.filename}:`, error);
      return null;
    }
  }

  async updateFile(metadata: FileMetadata): Promise<boolean> {
    try {
      console.log(`☁️  Updating file: ${metadata.filename}`);

      // 1. Find existing file record
      const { data: existingFile, error: findError } = await supabase
        .from('files')
        .select('id, storage_path')
        .eq('filename', metadata.filename)
        .eq('workspace_id', metadata.workspaceId)
        .single();

      if (findError || !existingFile) {
        console.log(`📄 File not found in database, creating new record`);
        return (await this.uploadFile(metadata)) !== null;
      }

      // 2. Update file in storage
      const storageKey = await this.uploadToStorage(metadata, existingFile.storage_path);
      if (!storageKey) {
        throw new Error('Failed to update storage');
      }

      // 3. Update metadata in database
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

      // 4. Create file event
      await this.createFileEvent(existingFile.id, 'updated');

      console.log(`✅ Successfully updated: ${metadata.filename}`);
      return true;

    } catch (error) {
      console.error(`❌ Update failed for ${metadata.filename}:`, error);
      return false;
    }
  }

  async deleteFile(filename: string, workspaceId: string): Promise<boolean> {
    try {
      console.log(`☁️  Deleting file: ${filename}`);

      // 1. Find existing file record
      const { data: existingFile, error: findError } = await supabase
        .from('files')
        .select('id, storage_path')
        .eq('filename', filename)
        .eq('workspace_id', workspaceId)
        .single();

      if (findError || !existingFile) {
        console.log(`⚠️  File not found in database: ${filename}`);
        return true; // Already deleted
      }

      // 2. Delete from storage
      if (existingFile.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('cursor-files')
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
        .from('cursor-files')
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

  async setupRealTimeSubscription(workspaceId: string, callback: (event: any) => void): Promise<void> {
    try {
      supabase
        .channel('file-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'files',
            filter: `workspace_id=eq.${workspaceId}`,
          },
          callback
        )
        .subscribe();

      console.log('🔔 Real-time subscription active for workspace:', workspaceId);

    } catch (error) {
      console.error('❌ Real-time subscription error:', error);
    }
  }
}