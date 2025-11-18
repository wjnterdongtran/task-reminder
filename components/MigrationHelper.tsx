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
        } else {
          // No tasks to migrate, mark as done
          localStorage.setItem(MIGRATED_KEY, 'true');
        }
      } catch (error) {
        console.error('Error reading localStorage:', error);
      }
    } else {
      // No localStorage data, mark as done
      localStorage.setItem(MIGRATED_KEY, 'true');
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
      window.location.reload(); // Reload to fetch from Supabase
    } catch (error) {
      console.error('Migration failed:', error);
      alert(
        'Migration failed. Please check your Supabase configuration and try again.'
      );
    } finally {
      setMigrating(false);
    }
  };

  const handleSkip = () => {
    if (
      confirm(
        'Are you sure? Your local tasks will not be migrated to Supabase. They will remain in localStorage until you clear your browser data.'
      )
    ) {
      localStorage.setItem(MIGRATED_KEY, 'skipped');
      setShowMigration(false);
    }
  };

  if (!showMigration) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Migrate to Supabase
        </h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          We found {localTasks.length} task{localTasks.length !== 1 ? 's' : ''}{' '}
          in your browser storage. Would you like to migrate them to Supabase
          for better persistence and multi-device access?
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 p-4 rounded mb-4">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Benefits:
          </p>
          <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside space-y-1">
            <li>Access your tasks from any device</li>
            <li>Real-time sync across browsers</li>
            <li>Automatic backups</li>
            <li>Better reliability</li>
          </ul>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium px-4 py-2 rounded transition-colors disabled:cursor-not-allowed"
          >
            {migrating ? 'Migrating...' : 'Migrate Now'}
          </button>
          <button
            onClick={handleSkip}
            disabled={migrating}
            className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 font-medium px-4 py-2 rounded transition-colors disabled:cursor-not-allowed"
          >
            Skip
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          Your local data will be backed up before migration.
        </p>
      </div>
    </div>
  );
}
