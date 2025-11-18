# Supabase Integration Setup Guide

This guide will help you set up Supabase for your Task Reminder application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and pnpm installed

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in your project details:
   - **Name**: task-reminder (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to your users
4. Click "Create new project" and wait for it to initialize

## Step 2: Get Your Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (the `anon` `public` key under "Project API keys")

## Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Create the Database Table

### Option A: Using Supabase MCP (Recommended if you have it installed)

If you have Supabase MCP installed, you can use it to execute the schema:

1. The schema file is located at `supabase/schema.sql`
2. Use the MCP tool to execute the SQL schema against your Supabase project

### Option B: Using Supabase Dashboard

1. In your Supabase project, go to **SQL Editor**
2. Click "New query"
3. Copy the contents of `supabase/schema.sql` and paste it into the editor
4. Click "Run" to execute the SQL

### Option C: Using Supabase CLI

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Push the migration:
   ```bash
   supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```
   Or execute the schema directly:
   ```bash
   psql -h db.[YOUR-PROJECT-REF].supabase.co -U postgres -d postgres -f supabase/schema.sql
   ```

## Step 5: Verify the Setup

1. In Supabase Dashboard, go to **Table Editor**
2. You should see a `tasks` table with the following columns:
   - `id` (uuid, primary key)
   - `name` (text)
   - `description` (text)
   - `url` (text)
   - `status` (integer)
   - `reminder_interval` (integer)
   - `created_at` (timestamptz)
   - `last_reminded_at` (timestamptz)
   - `updated_at` (timestamptz)

## Step 6: Run the Application

```bash
pnpm dev
```

The application will now use Supabase for data persistence instead of localStorage!

## Migration from localStorage (Optional)

If you have existing tasks in localStorage and want to migrate them to Supabase:

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Run the migration script (see `docs/MIGRATION.md` for details)

## Features Enabled by Supabase

- ✅ **Real-time Sync**: Changes are instantly reflected across all devices
- ✅ **Persistent Storage**: Data is stored in PostgreSQL, not browser storage
- ✅ **Multi-device Access**: Access your tasks from any device
- ✅ **Automatic Backups**: Supabase handles database backups
- ✅ **Scalability**: Built on PostgreSQL, ready to scale

## Row Level Security (RLS)

The current setup allows public access for development. For production, you should:

1. Enable authentication (Supabase Auth)
2. Update the RLS policies in `supabase/schema.sql` to use `authenticated` users
3. Add user authentication to your Next.js app

Example secure policy:
```sql
CREATE POLICY "Users can manage their own tasks" ON tasks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## Troubleshooting

### "Missing Supabase environment variables" error

- Make sure `.env.local` exists and contains both variables
- Restart your development server after adding environment variables

### Table not found error

- Verify the `tasks` table exists in Supabase Dashboard > Table Editor
- Re-run the schema.sql file

### Connection errors

- Check your Supabase project is active (not paused)
- Verify the URL and anon key are correct
- Check your internet connection

## Next Steps

- Add user authentication with Supabase Auth
- Set up database backups
- Configure production environment variables
- Add more advanced features like task sharing, categories, etc.

## Support

- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
