import { supabase } from './client';
import { Task, TaskStatus, TaskFormData } from '@/types/task';

/**
 * Supabase Task Service
 * Handles all database operations for tasks
 */

// Convert database row to Task type
function dbRowToTask(row: any): Task {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    url: row.url || '',
    status: row.status as TaskStatus,
    reminderInterval: row.reminder_interval,
    createdAt: row.created_at,
    lastRemindedAt: row.last_reminded_at,
    updatedAt: row.updated_at,
  };
}

// Convert Task to database insert format
function taskToDbInsert(formData: TaskFormData) {
  return {
    name: formData.name,
    description: formData.description || '',
    url: formData.url || '',
    status: TaskStatus.INIT,
    reminder_interval: formData.reminderInterval,
  };
}

/**
 * Fetch all tasks from Supabase
 */
export async function getAllTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }

  return data.map(dbRowToTask);
}

/**
 * Fetch a single task by ID
 */
export async function getTaskById(id: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching task:', error);
    return null;
  }

  return data ? dbRowToTask(data) : null;
}

/**
 * Create a new task
 */
export async function createTask(formData: TaskFormData): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert(taskToDbInsert(formData))
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    throw new Error(`Failed to create task: ${error.message}`);
  }

  return dbRowToTask(data);
}

/**
 * Update an existing task
 */
export async function updateTask(
  id: string,
  updates: Partial<Task>
): Promise<Task> {
  // Convert camelCase to snake_case for database
  const dbUpdates: any = {};

  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.url !== undefined) dbUpdates.url = updates.url;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.reminderInterval !== undefined)
    dbUpdates.reminder_interval = updates.reminderInterval;
  if (updates.lastRemindedAt !== undefined)
    dbUpdates.last_reminded_at = updates.lastRemindedAt;

  const { data, error } = await supabase
    .from('tasks')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    throw new Error(`Failed to update task: ${error.message}`);
  }

  return dbRowToTask(data);
}

/**
 * Update task status
 */
export async function updateTaskStatus(
  id: string,
  status: TaskStatus
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating task status:', error);
    throw new Error(`Failed to update task status: ${error.message}`);
  }

  return dbRowToTask(data);
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);

  if (error) {
    console.error('Error deleting task:', error);
    throw new Error(`Failed to delete task: ${error.message}`);
  }
}

/**
 * Mark a task as reminded (updates status and lastRemindedAt)
 */
export async function markTaskAsReminded(id: string): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      status: TaskStatus.NEED_TAKING_CARE,
      last_reminded_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error marking task as reminded:', error);
    throw new Error(`Failed to mark task as reminded: ${error.message}`);
  }

  return dbRowToTask(data);
}

/**
 * Subscribe to task changes (real-time updates)
 */
export function subscribeToTasks(
  callback: (tasks: Task[]) => void
): () => void {
  const channel = supabase
    .channel('tasks-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
      },
      async () => {
        // Refetch all tasks when any change occurs
        const tasks = await getAllTasks();
        callback(tasks);
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
}
