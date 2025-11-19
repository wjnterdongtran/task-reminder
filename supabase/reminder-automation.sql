-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Function to check and update tasks that need reminders
-- This function will be called periodically by pg_cron
-- Note: last_reminded_at tracks when user last VIEWED the task, not when status changed
CREATE OR REPLACE FUNCTION check_and_update_task_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update tasks that are in WORKING state and have exceeded their reminder interval
  -- We only change the status, NOT last_reminded_at (that's only updated when user views)
  UPDATE tasks
  SET
    status = 1, -- NEED_TAKING_CARE
    updated_at = NOW()
  WHERE
    status = 0 -- WORKING
    AND (
      -- Check if time since last_reminded_at exceeds reminder_interval
      (last_reminded_at IS NOT NULL AND
       EXTRACT(EPOCH FROM (NOW() - last_reminded_at)) / 3600 >= reminder_interval)
      OR
      -- If never viewed (last_reminded_at is NULL), check time since created_at
      (last_reminded_at IS NULL AND
       EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 >= reminder_interval)
    );
END;
$$;

-- Schedule the function to run at 12:00 AM Vietnam time (UTC+7)
-- Note: pg_cron jobs are scheduled in UTC timezone
-- 12:00 AM Vietnam (UTC+7) = 5:00 PM UTC (17:00)
SELECT cron.schedule(
  'check-task-reminders',        -- job name
  '0 17 * * *',                  -- cron expression: daily at 17:00 UTC (12:00 AM Vietnam)
  'SELECT check_and_update_task_reminders();'
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Optional: Create a function to manually trigger reminder check (for testing)
CREATE OR REPLACE FUNCTION manual_check_reminders()
RETURNS TABLE(updated_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  count_updated bigint;
BEGIN
  -- Perform the update and count affected rows
  -- Note: We only change status, NOT last_reminded_at (that tracks user views)
  WITH updated AS (
    UPDATE tasks
    SET
      status = 1, -- NEED_TAKING_CARE
      updated_at = NOW()
    WHERE
      status = 0 -- WORKING
      AND (
        (last_reminded_at IS NOT NULL AND
         EXTRACT(EPOCH FROM (NOW() - last_reminded_at)) / 3600 >= reminder_interval)
        OR
        (last_reminded_at IS NULL AND
         EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 >= reminder_interval)
      )
    RETURNING *
  )
  SELECT COUNT(*) INTO count_updated FROM updated;

  RETURN QUERY SELECT count_updated;
END;
$$;

-- To view scheduled cron jobs, use:
-- SELECT * FROM cron.job;

-- To unschedule the job (if needed), use:
-- SELECT cron.unschedule('check-task-reminders');
