export interface FileMetadata {
  id: string;
  filename: string;
  filepath: string;
  content: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  updatedAt: Date;
  uploadedBy: string;
  workspaceId: string;
  tags?: string[];
  sprintFolder?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  workspaceId: string;
  role: 'admin' | 'member' | 'viewer';
  createdAt: Date;
  lastActive: Date;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  ownerId: string;
  members: User[];
}

export interface FileEvent {
  type: 'created' | 'updated' | 'deleted';
  file: FileMetadata;
  timestamp: Date;
  userId: string;
}

export interface WatcherStatus {
  isRunning: boolean;
  lastSync: Date | null;
  errorCount: number;
  filesWatched: number;
}