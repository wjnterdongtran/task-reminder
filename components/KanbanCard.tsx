'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskStatus } from '@/types/task';
import { useTranslation } from '@/contexts/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface KanbanCardProps {
  task: Task;
  onDeleteTask: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  onViewDetails?: (task: Task) => void;
  isDragging?: boolean;
}

export default function KanbanCard({ task, onDeleteTask, onEditTask, onViewDetails, isDragging = false }: KanbanCardProps) {
  const { t, locale } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDeleteTask(task.id);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  const needsAttention = task.status === TaskStatus.NEED_TAKING_CARE;

  if (isDragging || isSortableDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-lg p-4 opacity-40"
      >
        <div className="h-20"></div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        group bg-slate-800/80 backdrop-blur-sm border rounded-lg
        transition-all duration-200 cursor-grab active:cursor-grabbing
        hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5
        ${needsAttention
          ? 'border-rose-500/50 shadow-lg shadow-rose-500/20 ring-1 ring-rose-500/20'
          : 'border-slate-700/50 hover:border-slate-600'
        }
      `}
    >
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-semibold text-white leading-snug flex-1 min-w-0">
            {task.name}
          </h4>
          {needsAttention && (
            <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 bg-rose-500/20 text-rose-300 text-xs font-bold rounded-full border border-rose-500/30 animate-pulse">
              <span className="w-1.5 h-1.5 bg-rose-400 rounded-full"></span>
              !
            </span>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 text-xs text-slate-400 mb-3">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true, locale: locale === 'vi' ? undefined : undefined })}
          </span>
          {task.lastRemindedAt && (
            <span className="flex items-center gap-1 text-amber-400">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {formatDistanceToNow(new Date(task.lastRemindedAt), { addSuffix: true })}
            </span>
          )}
        </div>

        {/* Description Toggle */}
        {task.description && (
          <div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium mb-2 flex items-center gap-1 transition-colors"
            >
              <svg
                className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {isExpanded ? t('taskItem.collapse') : t('taskItem.expand')}
            </button>

            {isExpanded && (
              <div className="prose prose-sm prose-invert max-w-none mb-3 text-slate-300 bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                <ReactMarkdown>{task.description}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* URL Link */}
        {task.url && (
          <a
            href={task.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors mb-3 group/link"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="group-hover/link:underline truncate max-w-[200px]">
              {task.url.replace(/^https?:\/\//, '')}
            </span>
          </a>
        )}
      </div>

      {/* Card Footer */}
      <div className="border-t border-slate-700/50 px-4 py-2 flex items-center justify-between bg-slate-900/30">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{task.reminderInterval}h</span>
          </div>
          {onEditTask && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditTask(task);
              }}
              className="px-2 py-1 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded transition-all flex items-center gap-1"
              title={t('common.edit')}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onViewDetails && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(task);
              }}
              className="px-2 py-1 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded transition-all flex items-center gap-1"
              title="View full details"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className={`
            px-2 py-1 rounded text-xs font-medium transition-all
            ${
              showDeleteConfirm
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
            }
          `}
        >
          {showDeleteConfirm ? t('taskItem.confirmDelete') : t('common.delete')}
        </button>
      </div>
    </div>
  );
}
