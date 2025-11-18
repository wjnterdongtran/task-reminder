'use client';

import { useEffect } from 'react';
import { differenceInHours } from 'date-fns';
import { Task, TaskStatus } from '@/types/task';

interface UseTaskReminderProps {
  tasks: Task[];
  markAsReminded: (id: string) => void;
  isLoaded: boolean;
}

export function useTaskReminder({ tasks, markAsReminded, isLoaded }: UseTaskReminderProps) {
  useEffect(() => {
    if (!isLoaded) return;

    const checkReminders = () => {
      const now = new Date();

      tasks.forEach((task) => {
        // Only check tasks that are in WORKING state
        if (task.status !== TaskStatus.WORKING) {
          return;
        }

        const referenceTime = task.lastRemindedAt || task.createdAt;
        const hoursSinceLastReminder = differenceInHours(now, new Date(referenceTime));

        // If the reminder interval has passed, mark as needing care
        if (hoursSinceLastReminder >= task.reminderInterval) {
          markAsReminded(task.id);
        }
      });
    };

    // Check immediately on load
    checkReminders();

    // Set up interval to check every minute
    const intervalId = setInterval(checkReminders, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [tasks, markAsReminded, isLoaded]);
}
