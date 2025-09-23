import { getSupabaseClient } from '../services/supabase';
import { validateConfig } from '../config';

const supabase = getSupabaseClient();

async function testConnection() {
  console.log('🔧 Testing Supabase connection...');

  // Validate configuration
  if (!validateConfig()) {
    console.error('❌ Configuration validation failed');
    process.exit(1);
  }

  try {
    // Test authentication status
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('✅ Supabase client initialized');

    // Test storage bucket access
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

    if (bucketError) {
      console.error('❌ Storage access failed:', bucketError.message);
    } else {
      console.log('✅ Storage access working');
      console.log('📁 Available buckets:', buckets?.map(b => b.name).join(', ') || 'none');
    }

    // Test if we can create a simple query (this will fail if tables don't exist, which is expected)
    const { data: testData, error: testError } = await supabase
      .from('workspaces')
      .select('count')
      .limit(1);

    if (testError) {
      if (testError.message.includes('relation "workspaces" does not exist')) {
        console.log('⚠️  Database tables not created yet - run the SQL scripts in Supabase dashboard');
        console.log('📋 Next steps:');
        console.log('   1. Go to your Supabase dashboard');
        console.log('   2. Navigate to SQL Editor');
        console.log('   3. Run database/schema.sql');
        console.log('   4. Run database/policies.sql');
        console.log('   5. Run database/storage.sql');
      } else {
        console.error('❌ Database query failed:', testError.message);
      }
    } else {
      console.log('✅ Database tables exist and accessible');
    }

    console.log('\n🎉 Basic connection test complete!');

  } catch (error) {
    console.error('❌ Connection test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  testConnection();
}

export { testConnection };