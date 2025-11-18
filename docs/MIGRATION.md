# Migration Guide: localStorage to Supabase

This guide helps you migrate your existing tasks from localStorage to Supabase.

## Before You Start

1. Make sure you've completed the Supabase setup (see `SUPABASE_SETUP.md`)
2. Your Supabase project is running and the `tasks` table is created
3. Your `.env.local` file is configured with Supabase credentials

## Migration Methods

### Method 1: Automatic Browser Migration (Recommended)

We'll add a migration utility that runs automatically on the client side.

1. The app will detect existing localStorage tasks on first load
2. It will prompt you to migrate them to Supabase
3. After migration, localStorage data will be cleared (with backup)

**Status**: Implementation ready - see the migration component below

### Method 2: Manual Browser Console Migration

If you prefer manual control, you can run this script in your browser console:

```javascript
// 1. Get tasks from localStorage
const localTasks = JSON.parse(localStorage.getItem('task-reminder-tasks') || '[]');
console.log(`Found ${localTasks.length} tasks in localStorage`);

// 2. Show tasks
console.table(localTasks);

// 3. Confirm migration
if (confirm(`Migrate ${localTasks.length} tasks to Supabase?`)) {
  // The migration will be handled by the app's migration utility
  // Just reload the page and accept the migration prompt
  window.location.reload();
}
```

### Method 3: Export and Manual Import

1. **Export from localStorage**:
   ```javascript
   // In browser console
   const tasks = localStorage.getItem('task-reminder-tasks');
   const blob = new Blob([tasks], { type: 'application/json' });
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = 'tasks-backup.json';
   a.click();
   ```

2. **Import to Supabase** (via Supabase Dashboard):
   - Go to Table Editor > tasks
   - Click "Insert" > "Insert row"
   - Manually enter each task (tedious for many tasks)

## Migration Component

Add this component to your app for automatic migration:

**File**: `components/MigrationHelper.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Task } from '@/types/task';
import * as taskService from '@/lib/supabase/taskService';

const STORAGE_KEY = 'task-reminder-tasks';
const MIGRATED_KEY = 'task-reminder-migrated';

export function MigrationHelper() {
  const [showMigration, setShowMigration] = useState(false);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    // Check if migration already done
    const alreadyMigrated = localStorage.getItem(MIGRATED_KEY);
    if (alreadyMigrated) return;

    // Check for local tasks
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          setLocalTasks(parsed);
          setShowMigration(true);
        }
      } catch (error) {
        console.error('Error reading localStorage:', error);
      }
    }
  }, []);

  const handleMigrate = async () => {
    setMigrating(true);
    try {
      // Migrate each task
      for (const task of localTasks) {
        await taskService.createTask({
          name: task.name,
          description: task.description,
          url: task.url,
          reminderInterval: task.reminderInterval,
        });
      }

      // Backup old data
      localStorage.setItem(
        `${STORAGE_KEY}-backup`,
        JSON.stringify(localTasks)
      );

      // Clear old data
      localStorage.removeItem(STORAGE_KEY);

      // Mark as migrated
      localStorage.setItem(MIGRATED_KEY, 'true');

      alert(`Successfully migrated ${localTasks.length} tasks to Supabase!`);
      setShowMigration(false);
    } catch (error) {
      console.error('Migration failed:', error);
      alert('Migration failed. Please try again or contact support.');
    } finally {
      setMigrating(false);
    }
  };

  const handleSkip = () => {
    if (
      confirm(
        'Are you sure? Your local tasks will not be migrated to Supabase.'
      )
    ) {
      localStorage.setItem(MIGRATED_KEY, 'skipped');
      setShowMigration(false);
    }
  };

  if (!showMigration) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Migrate to Supabase</h2>
        <p className="mb-4">
          We found {localTasks.length} task{localTasks.length !== 1 ? 's' : ''}{' '}
          in your browser storage. Would you like to migrate them to Supabase?
        </p>
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded mb-4">
          <p className="text-sm">
            <strong>Benefits:</strong>
          </p>
          <ul className="text-sm list-disc list-inside mt-2">
            <li>Access your tasks from any device</li>
            <li>Real-time sync across browsers</li>
            <li>Automatic backups</li>
            <li>Better performance</li>
          </ul>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {migrating ? 'Migrating...' : 'Migrate Now'}
          </button>
          <button
            onClick={handleSkip}
            disabled={migrating}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded disabled:opacity-50"
          >
            Skip
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Your local data will be backed up before migration.
        </p>
      </div>
    </div>
  );
}
```

## Using the Migration Component

Add it to your main page:

```typescript
// app/page.tsx
import { MigrationHelper } from '@/components/MigrationHelper';

export default function Home() {
  return (
    <>
      <MigrationHelper />
      {/* Rest of your app */}
    </>
  );
}
```

## Rollback (If Needed)

If something goes wrong and you need to restore from localStorage:

```javascript
// In browser console
const backup = localStorage.getItem('task-reminder-tasks-backup');
if (backup) {
  localStorage.setItem('task-reminder-tasks', backup);
  localStorage.removeItem('task-reminder-migrated');
  location.reload();
}
```

## Verification

After migration:

1. Check Supabase Dashboard > Table Editor > tasks
2. You should see all your migrated tasks
3. Create a new task to verify the integration works
4. Try accessing from a different browser/device (same Supabase project)

## Troubleshooting

**Migration fails with network error:**
- Check your internet connection
- Verify Supabase credentials in `.env.local`
- Check Supabase project status

**Tasks duplicated:**
- This can happen if migration runs multiple times
- Check `localStorage.getItem('task-reminder-migrated')`
- If needed, manually delete duplicates in Supabase Dashboard

**Lost tasks:**
- Check the backup: `localStorage.getItem('task-reminder-tasks-backup')`
- You can restore from backup (see Rollback section above)

## Post-Migration

After successful migration:

1. Test all functionality (create, edit, delete, status change)
2. Verify real-time sync (open app in two tabs)
3. Check reminders still work
4. Consider setting up proper authentication for production
