-- Task Reminder Database Schema for Supabase

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  url TEXT DEFAULT '',
  status INTEGER NOT NULL DEFAULT 0,
  reminder_interval INTEGER NOT NULL DEFAULT 24,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reminded_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Add constraints
  CONSTRAINT valid_status CHECK (status IN (0, 1, 2)),
  CONSTRAINT valid_reminder_interval CHECK (reminder_interval > 0)
);

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (you can customize this later)
-- For authenticated users only:
-- CREATE POLICY "Enable all access for authenticated users" ON tasks
--   FOR ALL
--   TO authenticated
--   USING (true)
--   WITH CHECK (true);

-- For public access (development/testing):
CREATE POLICY "Enable all access for all users" ON tasks
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE tasks IS 'Stores task items with reminder functionality';

-- Add comments to columns
COMMENT ON COLUMN tasks.id IS 'Unique identifier for the task';
COMMENT ON COLUMN tasks.name IS 'Task name/title';
COMMENT ON COLUMN tasks.description IS 'Task description in markdown format';
COMMENT ON COLUMN tasks.url IS 'Optional URL (e.g., Jira link)';
COMMENT ON COLUMN tasks.status IS 'Task status: 0=WORKING, 1=NEED_TAKING_CARE, 2=DONE';
COMMENT ON COLUMN tasks.reminder_interval IS 'Reminder interval in hours';
COMMENT ON COLUMN tasks.created_at IS 'Timestamp when task was created';
COMMENT ON COLUMN tasks.last_reminded_at IS 'Timestamp of last reminder trigger';
COMMENT ON COLUMN tasks.updated_at IS 'Timestamp of last update';
