# Supabase Setup Guide

Follow these steps to set up your Supabase backend for Cursor Share Sync.

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `cursor-share-sync`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your location
6. Click "Create new project"
7. Wait 2-3 minutes for project initialization

## Step 2: Get API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (something like `https://xyz.supabase.co`)
   - **anon public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - **Keep this secret!**

## Step 3: Configure Environment

1. In your project folder, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_KEY=your-service-key-here
   ```

## Step 4: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `database/schema.sql`
4. Click "Run" to create tables
5. Run `database/policies.sql` to set up security policies
6. Run `database/storage.sql` to set up file storage

## Step 5: Configure Authentication

1. Go to **Authentication** → **Settings**
2. In **Site URL**, add: `http://localhost:3000`
3. In **Redirect URLs**, add: `http://localhost:3000/auth/callback`
4. Enable email confirmations (optional for development)

## Step 6: Test Connection

Run this command to test your setup:
```bash
npm run dev
```

If successful, you should see "Cursor Share Sync - Starting..." without errors.

## Storage Bucket Verification

1. Go to **Storage** in Supabase dashboard
2. You should see a bucket called `cursor-files`
3. If not, run the `database/storage.sql` commands again

## Troubleshooting

### Common Issues:

**"Invalid API key"**
- Double-check your SUPABASE_URL and SUPABASE_ANON_KEY in `.env`
- Make sure there are no extra spaces or quotes

**"Table does not exist"**
- Run the SQL commands in order: schema.sql → policies.sql → storage.sql
- Check for any error messages in the SQL editor

**"RLS policy violation"**
- Make sure you've run the policies.sql file
- Check that authentication is working properly

### Getting Help:

1. Check the Supabase logs in your dashboard
2. Look at browser console for client-side errors
3. Verify your database schema in **Table Editor**

## Next Steps

Once Supabase is configured:
1. Test the connection with `npm run dev`
2. Create a test workspace and user
3. Try uploading a test file
4. Verify real-time subscriptions work

Your Supabase backend is now ready for the file watcher service!