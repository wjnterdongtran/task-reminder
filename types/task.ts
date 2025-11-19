export enum TaskStatus {
  WORKING = 0,
  NEED_TAKING_CARE = 1,
  DONE = 2,
}

export interface Task {
  id: string;
  name: string;
  description: string; // Markdown content
  url: string; // Jira link or other URL
  status: TaskStatus;
  reminderInterval: number; // In hours (default 24)
  createdAt: string;
  lastRemindedAt: string | null;
  updatedAt: string;
  color?: string; // Hex color code for task title
  isPinned: boolean; // Whether task is pinned
  pinnedAt: string | null; // Timestamp when task was pinned
}

export interface TaskFormData {
  name: string;
  description: string;
  url: string;
  reminderInterval: number;
  color?: string;
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.WORKING]: 'Working',
  [TaskStatus.NEED_TAKING_CARE]: 'Need Taking Care',
  [TaskStatus.DONE]: 'Done',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.WORKING]: 'bg-blue-100 text-blue-800 border-blue-300',
  [TaskStatus.NEED_TAKING_CARE]: 'bg-red-100 text-red-800 border-red-300',
  [TaskStatus.DONE]: 'bg-green-100 text-green-800 border-green-300',
};

// Preset colors for task titles
export const TASK_PRESET_COLORS = [
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Green', value: '#10B981' },
  { name: 'Blue', value: '#3B82F6' },
];
