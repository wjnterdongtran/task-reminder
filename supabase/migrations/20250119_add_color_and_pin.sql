-- Add color and pin features to tasks table

-- Add color column (nullable, stores hex color code)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS color TEXT;

-- Add is_pinned column (boolean, default false)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false;

-- Add pinned_at column (timestamp for sorting pinned tasks)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ;

-- Create index on is_pinned for faster filtering
CREATE INDEX IF NOT EXISTS idx_tasks_is_pinned ON tasks(is_pinned);

-- Create index on pinned_at for sorting pinned tasks
CREATE INDEX IF NOT EXISTS idx_tasks_pinned_at ON tasks(pinned_at DESC NULLS LAST);

-- Add comments to new columns
COMMENT ON COLUMN tasks.color IS 'Optional color for task title (hex color code)';
COMMENT ON COLUMN tasks.is_pinned IS 'Whether task is pinned to stay at top';
COMMENT ON COLUMN tasks.pinned_at IS 'Timestamp when task was pinned (for sorting)';
