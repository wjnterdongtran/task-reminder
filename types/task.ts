export enum TaskStatus {
  INIT = 0,
  WORKING = 1,
  NEED_TAKING_CARE = 2,
  DONE = 3,
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
}

export interface TaskFormData {
  name: string;
  description: string;
  url: string;
  reminderInterval: number;
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.INIT]: 'Init',
  [TaskStatus.WORKING]: 'Working',
  [TaskStatus.NEED_TAKING_CARE]: 'Need Taking Care',
  [TaskStatus.DONE]: 'Done',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.INIT]: 'bg-gray-100 text-gray-800 border-gray-300',
  [TaskStatus.WORKING]: 'bg-blue-100 text-blue-800 border-blue-300',
  [TaskStatus.NEED_TAKING_CARE]: 'bg-red-100 text-red-800 border-red-300',
  [TaskStatus.DONE]: 'bg-green-100 text-green-800 border-green-300',
};
