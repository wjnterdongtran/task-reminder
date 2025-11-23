-- Add jira_id column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS jira_id TEXT;

-- Add comment for documentation
COMMENT ON COLUMN tasks.jira_id IS 'Optional Jira ticket ID (e.g., PROJECT-123)';
