'use client';

import { useMemo, useState } from 'react';
import { Task, TaskStatus, TASK_STATUS_LABELS } from '@/types/task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

type FilterType = 'all' | TaskStatus;

export function TaskList({ tasks, onStatusChange, onDelete }: TaskListProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Filter by status
    if (filter !== 'all') {
      result = result.filter((task) => task.status === filter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.name.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.url.toLowerCase().includes(query)
      );
    }

    // Sort: Need Taking Care first, then by updatedAt
    return result.sort((a, b) => {
      if (a.status === TaskStatus.NEED_TAKING_CARE && b.status !== TaskStatus.NEED_TAKING_CARE) {
        return -1;
      }
      if (b.status === TaskStatus.NEED_TAKING_CARE && a.status !== TaskStatus.NEED_TAKING_CARE) {
        return 1;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [tasks, filter, searchQuery]);

  const statusCounts = useMemo(() => {
    return {
      all: tasks.length,
      [TaskStatus.INIT]: tasks.filter((t) => t.status === TaskStatus.INIT).length,
      [TaskStatus.WORKING]: tasks.filter((t) => t.status === TaskStatus.WORKING).length,
      [TaskStatus.NEED_TAKING_CARE]: tasks.filter((t) => t.status === TaskStatus.NEED_TAKING_CARE).length,
      [TaskStatus.DONE]: tasks.filter((t) => t.status === TaskStatus.DONE).length,
    };
  }, [tasks]);

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({statusCounts.all})
          </button>
          {([TaskStatus.INIT, TaskStatus.WORKING, TaskStatus.NEED_TAKING_CARE, TaskStatus.DONE] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {TASK_STATUS_LABELS[status]} ({statusCounts[status]})
              </button>
            )
          )}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg">
            {searchQuery
              ? 'No tasks found matching your search'
              : filter === 'all'
              ? 'No tasks yet. Add your first task above!'
              : `No tasks with status "${TASK_STATUS_LABELS[filter as TaskStatus]}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
