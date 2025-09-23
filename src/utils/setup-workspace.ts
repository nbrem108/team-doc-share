import { getSupabaseClient } from '../services/supabase';
import { config } from '../config';
import { WorkspaceAccess } from './user-identity';
import * as crypto from 'crypto';

const supabase = getSupabaseClient();

async function setupWorkspace() {
  console.log('🏗️  Setting up test workspace...');

  try {
    // Generate unique IDs
    const workspaceId = crypto.randomUUID();
    const userId = crypto.randomUUID(); // Generate a proper UUID

    // Create workspace (without owner_id foreign key constraint)
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        id: workspaceId,
        name: 'Cursor Share Test Workspace',
        description: 'Test workspace for file sharing',
        owner_id: null, // Set to null to avoid foreign key constraint
      })
      .select()
      .single();

    if (workspaceError) {
      throw workspaceError;
    }

    // Generate secure access key
    const accessKey = WorkspaceAccess.generateAccessKey(workspaceId);

    console.log('✅ Test workspace created successfully!');
    console.log('\n📋 Configuration:');
    console.log(`Workspace ID: ${workspaceId}`);
    console.log(`Access Key: ${accessKey}`);
    console.log('\n🔧 Update your .env file with these values:');
    console.log(`WORKSPACE_ID=${workspaceId}`);
    console.log(`WORKSPACE_ACCESS_KEY=${accessKey}`);
    console.log('\n🔐 Security Notes:');
    console.log('- Share the Access Key with team members to join this workspace');
    console.log('- Keep the Access Key secret - anyone with it can join the workspace');
    console.log('- Each team member needs the same WORKSPACE_ID and WORKSPACE_ACCESS_KEY');
    console.log('\nThen restart the application to use the new workspace.');

    return { workspaceId, accessKey };

  } catch (error) {
    console.error('❌ Workspace setup failed:', error);
    throw error;
  }
}

if (require.main === module) {
  setupWorkspace();
}

export { setupWorkspace };