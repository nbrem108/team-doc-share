import { getSupabaseClient } from '../services/supabase';
import { config } from '../config';
import { WorkspaceAccess } from './user-identity';
import * as crypto from 'crypto';

async function setupWorkspace() {
  console.log('🏗️  Setting up test workspace...');

  try {
    // Initialize supabase client (lazy loading to ensure config is loaded)
    const supabase = getSupabaseClient();
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

  } catch (error: any) {
    console.error('❌ Workspace setup failed:', error);

    if (error.message && error.message.includes('Invalid API key')) {
      console.log('\n💡 "Invalid API key" usually means the database isn\'t set up yet.');
      console.log('📋 Try this first:');
      console.log('   1. Run: npx cursor-share-sync sql');
      console.log('   2. Copy and paste the SQL into your Supabase SQL Editor');
      console.log('   3. Run the SQL to create tables');
      console.log('   4. Then try setup again');
    }

    throw error;
  }
}

if (require.main === module) {
  setupWorkspace();
}

export { setupWorkspace };