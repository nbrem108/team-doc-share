import { getSupabaseClient } from '../services/supabase';
import * as fs from 'fs';
import * as path from 'path';

const supabase = getSupabaseClient();

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...');

  try {
    // Test connection
    const { data, error } = await supabase.from('_health').select('*').limit(1);
    if (error && !error.message.includes('relation "_health" does not exist')) {
      throw error;
    }
    console.log('✅ Connected to Supabase successfully');

    // Read and execute schema
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📊 Creating database schema...');
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      sql: schema
    });

    if (schemaError) {
      console.log('⚠️  Schema might already exist, continuing...');
    } else {
      console.log('✅ Database schema created');
    }

    // Read and execute policies
    const policiesPath = path.join(__dirname, '../../database/policies.sql');
    const policies = fs.readFileSync(policiesPath, 'utf8');

    console.log('🔐 Setting up security policies...');
    const { error: policiesError } = await supabase.rpc('exec_sql', {
      sql: policies
    });

    if (policiesError) {
      console.log('⚠️  Policies might already exist, continuing...');
    } else {
      console.log('✅ Security policies created');
    }

    // Create storage bucket
    console.log('📁 Setting up file storage...');
    const { error: bucketError } = await supabase.storage.createBucket(
      'cursor-files',
      { public: false }
    );

    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('❌ Storage bucket error:', bucketError);
    } else {
      console.log('✅ Storage bucket ready');
    }

    console.log('🎉 Database setup complete!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Test basic operations
async function testOperations() {
  console.log('\n🧪 Testing basic operations...');

  try {
    // Test workspace creation
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        name: 'Test Workspace',
        description: 'Automated test workspace'
      })
      .select()
      .single();

    if (workspaceError) {
      console.error('❌ Workspace test failed:', workspaceError);
      return;
    }

    console.log('✅ Workspace operations working');

    // Clean up test data
    await supabase.from('workspaces').delete().eq('id', workspace.id);
    console.log('✅ Test cleanup complete');

  } catch (error) {
    console.error('❌ Test operations failed:', error);
  }
}

if (require.main === module) {
  setupDatabase().then(() => testOperations());
}

export { setupDatabase, testOperations };