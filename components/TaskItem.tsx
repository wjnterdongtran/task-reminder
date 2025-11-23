'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { Task, TaskStatus } from '@/types/task';
import { useTranslation } from '@/contexts/LanguageContext';

interface TaskItemProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onViewDetails?: (task: Task) => void;
  onTogglePin?: (taskId: string, isPinned: boolean) => void;
}

// Preprocess markdown to ensure numbered lists are properly formatted
// Markdown requires a blank line before lists for proper parsing
function preprocessMarkdown(text: string): string {
  // Add blank line before numbered lists if not already present
  // Match lines that start with a number followed by period and space
  return text.replace(/([^\n])(\n)(\d+\.\s)/g, '$1\n\n$3');
}

export function TaskItem({ task, onStatusChange, onDelete, onViewDetails, onTogglePin }: TaskItemProps) {
  const { t } = useTranslation();
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

  const getStatusLabel = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.INIT:
        return t('taskStatus.init');
      case TaskStatus.WORKING:
        return t('taskStatus.working');
      case TaskStatus.NEED_TAKING_CARE:
        return t('taskStatus.needCare');
      case TaskStatus.DONE:
        return t('taskStatus.done');
      default:
        return '';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.INIT:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case TaskStatus.WORKING:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case TaskStatus.NEED_TAKING_CARE:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case TaskStatus.DONE:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const needsAttention = task.status === TaskStatus.NEED_TAKING_CARE;

  return (
    <div
      className={`
        border rounded-xl p-6 shadow-lg transition-all duration-200 backdrop-blur-sm
        hover:shadow-xl hover:scale-[1.01]
        ${
          needsAttention
            ? 'border-rose-500/50 bg-rose-500/5 ring-1 ring-rose-500/20'
            : 'border-slate-700/50 bg-slate-800/80 hover:border-slate-600'
        }
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Task Header */}
          <div className="flex items-center gap-2 mb-3">
            {task.isPinned && (
              <span className="flex-shrink-0 text-amber-400" title="Pinned">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16,9V4H17V2H7V4H8V9C8,10.66 6.66,12 5,12V14H11V22H13V14H19V12C17.34,12 16,10.66 16,9Z" />
                </svg>
              </span>
            )}
            <h3
              className="text-xl font-bold truncate"
              style={{ color: task.color || 'white' }}
            >
              {task.name}
            </h3>
            {needsAttention && (
              <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 bg-rose-500/20 text-rose-300 text-xs font-bold rounded-full border border-rose-500/30 animate-pulse">
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full"></span>
                {t('taskItem.needsAttention')}
              </span>
            )}
          </div>

          {/* Task Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 mb-3">
            <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(task.status)}`}>
              {getStatusLabel(task.status)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {task.lastRemindedAt
                ? `${t('taskItem.lastReminded')} ${formatDistanceToNow(new Date(task.lastRemindedAt), { addSuffix: true })}`
                : `${t('taskItem.created')} ${formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}`}
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {task.reminderInterval}h
            </span>
          </div>

          {/* URL Link */}
          {task.url && (
            <a
              href={task.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 hover:underline mb-3 group"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="truncate max-w-xs">{task.url.replace(/^https?:\/\//, '')}</span>
            </a>
          )}

          {/* Description Toggle */}
          {task.description && (
            <div className="mt-3">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {isExpanded ? t('taskItem.collapse') : t('taskItem.expand')}
              </button>
              {isExpanded && (
                <div className="mt-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{preprocessMarkdown(task.description)}</ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions Column */}
        <div className="flex flex-col gap-3 items-end flex-shrink-0">
          {/* Pin Button */}
          {onTogglePin && (
            <button
              onClick={() => onTogglePin(task.id, !task.isPinned)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                         flex items-center gap-2
                         ${task.isPinned
                           ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30'
                           : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 border border-slate-600'
                         }`}
              title={task.isPinned ? 'Unpin task' : 'Pin task to top'}
            >
              <svg className="w-4 h-4" fill={task.isPinned ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                {task.isPinned ? (
                  <path d="M16,9V4H17V2H7V4H8V9C8,10.66 6.66,12 5,12V14H11V22H13V14H19V12C17.34,12 16,10.66 16,9Z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                )}
              </svg>
              <span className="hidden sm:inline">{task.isPinned ? 'Unpin' : 'Pin'}</span>
            </button>
          )}

          {/* Status Selector */}
          <select
            value={task.status}
            onChange={handleStatusChange}
            className="px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm font-medium
                       focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                       transition-all duration-200 cursor-pointer hover:bg-slate-900/70"
          >
            <option value={TaskStatus.INIT}>{getStatusLabel(TaskStatus.INIT)}</option>
            <option value={TaskStatus.WORKING}>{getStatusLabel(TaskStatus.WORKING)}</option>
            <option value={TaskStatus.NEED_TAKING_CARE}>{getStatusLabel(TaskStatus.NEED_TAKING_CARE)}</option>
            <option value={TaskStatus.DONE}>{getStatusLabel(TaskStatus.DONE)}</option>
          </select>

          {/* View Details Button */}
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(task)}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                         bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30
                         focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800
                         flex items-center gap-2 group"
              title="View full details"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="hidden sm:inline">View Details</span>
            </button>
          )}

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-800
              ${
                showDeleteConfirm
                  ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/25'
                  : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
              }
            `}
          >
            {showDeleteConfirm ? t('taskItem.confirmDelete') : t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
