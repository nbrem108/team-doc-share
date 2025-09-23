import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface UserIdentity {
  userId: string;
  displayName: string;
  email?: string;
  machineId: string;
  createdAt: string;
  accessKey: string; // Secret key for workspace access
}

export class UserIdentityManager {
  private identityFile: string;
  private identity: UserIdentity | null = null;

  constructor() {
    // Store identity in user's home directory
    this.identityFile = path.join(os.homedir(), '.cursor-share-identity.json');
  }

  async getOrCreateIdentity(workspaceAccessKey?: string): Promise<UserIdentity> {
    // Try to load existing identity
    if (fs.existsSync(this.identityFile)) {
      try {
        const data = fs.readFileSync(this.identityFile, 'utf8');
        this.identity = JSON.parse(data);
        console.log(`👤 Welcome back, ${this.identity!.displayName}!`);
        return this.identity!;
      } catch (error) {
        console.warn('⚠️  Could not load existing identity, creating new one...');
      }
    }

    // Create new identity
    console.log('🆔 Creating new user identity...');

    // Get user info
    const displayName = await this.promptForName();
    const email = await this.promptForEmail();

    // Verify workspace access
    if (workspaceAccessKey) {
      console.log('🔐 Verifying workspace access...');
      // TODO: Validate access key against workspace
    }

    this.identity = {
      userId: crypto.randomUUID(),
      displayName,
      email,
      machineId: this.getMachineId(),
      createdAt: new Date().toISOString(),
      accessKey: workspaceAccessKey || 'no-key-provided',
    };

    // Save identity
    fs.writeFileSync(this.identityFile, JSON.stringify(this.identity, null, 2));

    console.log(`✅ Identity created for ${displayName}`);
    console.log(`🆔 User ID: ${this.identity.userId}`);

    return this.identity;
  }

  private getMachineId(): string {
    // Create a machine fingerprint
    const hostname = os.hostname();
    const platform = os.platform();
    const arch = os.arch();
    const userInfo = os.userInfo();

    const fingerprint = `${hostname}-${platform}-${arch}-${userInfo.username}`;
    return crypto.createHash('sha256').update(fingerprint).digest('hex').substring(0, 16);
  }

  private async promptForName(): Promise<string> {
    // In a real app, you'd use readline or a GUI
    // For now, use environment or default
    const defaultName = os.userInfo().username || 'Unknown User';

    // Check if name is provided in environment
    if (process.env.USER_DISPLAY_NAME) {
      return process.env.USER_DISPLAY_NAME;
    }

    console.log(`📝 Using display name: ${defaultName}`);
    console.log('💡 Set USER_DISPLAY_NAME in .env to customize');
    return defaultName;
  }

  private async promptForEmail(): Promise<string | undefined> {
    // Check if email is provided in environment
    if (process.env.USER_EMAIL) {
      return process.env.USER_EMAIL;
    }

    console.log('💡 Set USER_EMAIL in .env to add email to profile');
    return undefined;
  }

  getCurrentIdentity(): UserIdentity | null {
    return this.identity;
  }

  getDisplayName(): string {
    return this.identity?.displayName || 'Anonymous';
  }

  getUserId(): string {
    return this.identity?.userId || 'anonymous';
  }
}

// Workspace access key validation
export class WorkspaceAccess {
  static generateAccessKey(workspaceId: string): string {
    // Generate a secure access key for the workspace
    const secret = crypto.randomBytes(32).toString('hex');
    const keyData = `${workspaceId}:${secret}`;
    return Buffer.from(keyData).toString('base64');
  }

  static validateAccessKey(accessKey: string, workspaceId: string): boolean {
    try {
      const decoded = Buffer.from(accessKey, 'base64').toString('utf8');
      const [keyWorkspaceId] = decoded.split(':');
      return keyWorkspaceId === workspaceId;
    } catch {
      return false;
    }
  }
}