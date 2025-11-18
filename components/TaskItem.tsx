'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { Task, TaskStatus, TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '@/types/task';

interface TaskItemProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onStatusChange, onDelete }: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(task.id, parseInt(e.target.value) as TaskStatus);
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(task.id);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  const getTimeInfo = () => {
    const referenceTime = task.lastRemindedAt || task.createdAt;
    const timeAgo = formatDistanceToNow(new Date(referenceTime), { addSuffix: true });

    if (task.lastRemindedAt) {
      return `Last reminded ${timeAgo}`;
    }
    return `Created ${timeAgo}`;
  };

  return (
    <div className={`border rounded-lg p-4 shadow-sm transition-all ${
      task.status === TaskStatus.NEED_TAKING_CARE ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {task.name}
            </h3>
            {task.status === TaskStatus.NEED_TAKING_CARE && (
              <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full font-medium animate-pulse">
                Needs Attention!
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
            <span className={`px-2 py-1 rounded border text-xs font-medium ${TASK_STATUS_COLORS[task.status]}`}>
              {TASK_STATUS_LABELS[task.status]}
            </span>
            <span>{getTimeInfo()}</span>
            <span>Remind every {task.reminderInterval}h</span>
          </div>

          {task.url && (
            <a
              href={task.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open Link
            </a>
          )}

          {task.description && (
            <div className="mt-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-gray-700 hover:text-gray-900 font-medium"
              >
                {isExpanded ? '▼' : '▶'} {isExpanded ? 'Hide' : 'Show'} Description
              </button>
              {isExpanded && (
                <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200 prose prose-sm max-w-none">
                  <ReactMarkdown>{task.description}</ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 items-end">
          <select
            value={task.status}
            onChange={handleStatusChange}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={TaskStatus.INIT}>Init</option>
            <option value={TaskStatus.WORKING}>Working</option>
            <option value={TaskStatus.NEED_TAKING_CARE}>Need Care</option>
            <option value={TaskStatus.DONE}>Done</option>
          </select>

          <button
            onClick={handleDelete}
            className={`px-3 py-1 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
              showDeleteConfirm
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            {showDeleteConfirm ? 'Confirm?' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
