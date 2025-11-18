# Supabase Database Setup

This directory contains SQL migration files for setting up the Task Reminder application database.

## Migration Files

1. **schema.sql** - Initial database schema with tasks table
2. **auth-migration.sql** - User authentication and Row Level Security (RLS) policies
3. **reminder-automation.sql** - Automated task reminder system using pg_cron

## Setup Instructions

### 1. Initial Setup

Run the migrations in order:

```sql
-- 1. Create the tasks table
\i supabase/schema.sql

-- 2. Set up authentication and RLS
\i supabase/auth-migration.sql

-- 3. Set up automated reminders (requires pg_cron extension)
\i supabase/reminder-automation.sql
```

### 2. Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of each migration file in order
4. Execute each migration

### 3. Automated Reminder System

The `reminder-automation.sql` migration sets up:

- **pg_cron extension**: Enables scheduled jobs in PostgreSQL
- **check_and_update_task_reminders()**: Database function that checks for WORKING tasks that have exceeded their `reminder_interval` and automatically updates them to NEED_TAKING_CARE status
- **Cron job**: Runs every minute to check for tasks needing reminders
- **manual_check_reminders()**: Optional function for manually triggering reminder checks (useful for testing)

#### How It Works

1. Tasks in `WORKING` state are monitored by the database
2. Every minute, pg_cron runs `check_and_update_task_reminders()`
3. The function calculates time elapsed since `last_reminded_at` (or `created_at` if never reminded)
4. If elapsed time ≥ `reminder_interval` hours, the task is updated to `NEED_TAKING_CARE` status
5. When users view task details, the client resets the task to `WORKING` and updates `last_reminded_at`

#### Testing the Reminder System

To manually trigger a reminder check:

```sql
SELECT * FROM manual_check_reminders();
```

This returns the number of tasks that were updated.

#### Viewing Scheduled Jobs

To see all pg_cron jobs:

```sql
SELECT * FROM cron.job;
```

#### Disabling the Reminder Job

If you need to temporarily disable automatic reminders:

```sql
SELECT cron.unschedule('check-task-reminders');
```

To re-enable, run the schedule command from `reminder-automation.sql` again.

## Important Notes

- **pg_cron**: This extension may not be available on all Supabase plans. It's typically available on Pro plans and above. Check your Supabase plan documentation.
- **Alternative**: If pg_cron is not available, you can use Supabase Edge Functions or external cron services (like GitHub Actions, Vercel Cron, etc.) to call a Supabase RPC function periodically.
- **Timezone**: pg_cron jobs run in UTC timezone by default
- **Performance**: The cron job only updates tasks that meet the criteria, so it's efficient even with many tasks

## Troubleshooting

### pg_cron extension not available

If you get an error about pg_cron not being available:

1. Check if your Supabase plan supports pg_cron
2. Consider using Supabase Edge Functions as an alternative
3. Or use external cron services to call the `check_and_update_task_reminders()` function via RPC

### Reminder not working

1. Check if the cron job is scheduled:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'check-task-reminders';
   ```

2. Manually run the function to test:
   ```sql
   SELECT check_and_update_task_reminders();
   ```

3. Check task data to ensure `reminder_interval` is set correctly and tasks are in `WORKING` state
