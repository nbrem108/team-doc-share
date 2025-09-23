import { getSupabaseClient } from '../services/supabase';
import { validateConfig } from '../config';

async function testConnection() {
  console.log('🔧 Testing Supabase connection...');

  // Validate configuration
  if (!validateConfig()) {
    console.error('❌ Configuration validation failed');
    process.exit(1);
  }

  try {
    // Initialize supabase client (lazy loading)
    const supabase = getSupabaseClient();
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
      if (testError.message.includes('relation "workspaces" does not exist') ||
          testError.message.includes('Invalid API key')) {
        console.log('⚠️  Database not set up yet - need to run SQL setup');
        console.log('📋 Next steps:');
        console.log('   1. Run: npx cursor-share-sync sql');
        console.log('   2. Copy the displayed SQL');
        console.log('   3. Paste into your Supabase SQL Editor and run it');
        console.log('   4. Then try setup again');
        console.log('');
        console.log('💡 "Invalid API key" often means tables don\'t exist, not bad credentials');
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