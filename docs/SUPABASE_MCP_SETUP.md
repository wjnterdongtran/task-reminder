# Using Supabase MCP to Create Database Tables

This guide explains how to use the Supabase Model Context Protocol (MCP) server to create the necessary database tables for the Task Reminder application.

## What is Supabase MCP?

Supabase MCP is a tool that allows AI assistants (like Claude) to interact directly with your Supabase database. It provides capabilities to:
- Execute SQL queries
- Create and manage tables
- Query data
- Manage database schema

## Prerequisites

1. **Supabase Project**: You need an active Supabase project
   - Sign up at https://supabase.com
   - Create a new project
   - Note your project URL and service role key

2. **Supabase MCP Server**: You need the MCP server installed
   - Installation instructions: https://github.com/supabase-community/supabase-mcp

## Installing Supabase MCP

### Option 1: Via npx (Recommended)

The MCP server can be run directly via npx without installation:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase",
        "<your-project-url>",
        "<your-service-role-key>"
      ]
    }
  }
}
```

### Option 2: Global Installation

```bash
npm install -g @supabase/mcp-server-supabase
```

Then configure in your Claude Desktop config:

**Location**:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/claude/claude_desktop_config.json`

**Configuration**:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "supabase-mcp",
      "args": [
        "<your-project-url>",
        "<your-service-role-key>"
      ]
    }
  }
}
```

**Important**:
- Replace `<your-project-url>` with your Supabase project URL (e.g., `https://abcdefgh.supabase.co`)
- Replace `<your-service-role-key>` with your service role key from Supabase Dashboard > Settings > API

## Getting Your Service Role Key

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **API**
3. Under "Project API keys", find the **service_role** key
4. **Warning**: The service role key has admin privileges. Keep it secret and never commit it to version control!

## Creating the Tables with MCP

Once Supabase MCP is configured, you can ask Claude to create the tables:

### Method 1: Direct SQL Execution

Ask Claude to execute the schema file:

```
"Using Supabase MCP, please execute the SQL in supabase/schema.sql to create the tasks table"
```

### Method 2: Manual Copy-Paste

1. Copy the contents of `supabase/schema.sql`
2. Ask Claude: "Using Supabase MCP, please execute this SQL: [paste SQL here]"

## Verifying the Setup

After creating the tables, verify with Claude:

```
"Using Supabase MCP, can you show me the structure of the tasks table?"
```

Or check manually in Supabase Dashboard:
1. Go to **Table Editor**
2. You should see the `tasks` table
3. Click on it to see the columns and structure

## Common Issues

### "MCP server not found"
- Make sure you've restarted Claude Desktop after adding the configuration
- Verify the path in `claude_desktop_config.json` is correct
- Check that the MCP server is installed

### "Authentication failed"
- Double-check your service role key is correct
- Make sure you're using the service_role key, not the anon key
- Verify your Supabase project is active (not paused)

### "Permission denied"
- Ensure you're using the **service_role** key (has admin rights)
- The anon key won't work for creating tables

## What the Schema Creates

The `supabase/schema.sql` file creates:

1. **Tasks Table** with columns:
   - `id`: UUID primary key
   - `name`: Task name (required)
   - `description`: Markdown description
   - `url`: Optional link
   - `status`: Integer (0-3) representing task status
   - `reminder_interval`: Hours between reminders
   - `created_at`: Creation timestamp
   - `last_reminded_at`: Last reminder timestamp
   - `updated_at`: Last update timestamp

2. **Indexes** for performance:
   - On `status` (for filtering)
   - On `created_at` (for sorting)

3. **Row Level Security (RLS)** policies:
   - Currently allows public access (for development)
   - Can be updated for production

4. **Triggers**:
   - Auto-update `updated_at` on row changes

## Alternative: Manual Table Creation

If you prefer not to use MCP, you can:

1. Go to Supabase Dashboard > **SQL Editor**
2. Click **New query**
3. Paste the contents of `supabase/schema.sql`
4. Click **Run**

## Next Steps

After creating the tables:

1. Set up your environment variables (`.env.local`)
2. Run the application with `pnpm dev`
3. The app will automatically use Supabase for persistence
4. If you have existing localStorage data, the MigrationHelper will offer to migrate it

## Security Considerations

**For Production**:

1. **Never expose service_role key** in client code
2. **Enable RLS (Row Level Security)** properly
3. **Add authentication** (Supabase Auth)
4. **Update policies** to restrict access by user
5. **Use environment variables** for all secrets

**Example Secure Setup**:
```sql
-- Add user_id column
ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update policy for authenticated users only
DROP POLICY "Enable all access for all users" ON tasks;

CREATE POLICY "Users can manage their own tasks" ON tasks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## Useful MCP Commands

Ask Claude to:
- `"List all tables in the database"`
- `"Show me the first 10 tasks in the tasks table"`
- `"What indexes exist on the tasks table?"`
- `"Show me the RLS policies for the tasks table"`

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase MCP GitHub](https://github.com/supabase-community/supabase-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Claude Desktop Configuration](https://docs.anthropic.com/claude/docs)
