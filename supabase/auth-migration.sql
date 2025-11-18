-- Authentication Migration
-- This script adds user authentication support to the tasks table

-- Step 1: Add user_id column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Update existing tasks (for development only - set to a default user or leave null)
-- In production, you may want to migrate existing tasks to specific users
-- UPDATE tasks SET user_id = 'some-default-user-id' WHERE user_id IS NULL;

-- Step 3: Create index on user_id for performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);

-- Step 4: Drop old public access policy
DROP POLICY IF EXISTS "Enable all access for all users" ON tasks;

-- Step 5: Create new RLS policies for authenticated users

-- Policy: Users can view only their own tasks
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own tasks
CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tasks
CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own tasks
CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Step 6: Make user_id NOT NULL for new records (optional, uncomment if desired)
-- This ensures all new tasks must have a user_id
-- ALTER TABLE tasks ALTER COLUMN user_id SET NOT NULL;

-- Step 7: Add a function to automatically set user_id on insert
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create trigger to automatically set user_id
DROP TRIGGER IF EXISTS set_user_id_trigger ON tasks;
CREATE TRIGGER set_user_id_trigger
  BEFORE INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

-- Verify the changes
COMMENT ON COLUMN tasks.user_id IS 'User ID from auth.users who created this task';
