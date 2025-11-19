'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { Task, TaskStatus } from '@/types/task';
import { useTranslation } from '@/contexts/LanguageContext';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

export default function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onStatusChange,
  onDelete,
}: TaskDetailModalProps) {
  const { t } = useTranslation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const getStatusLabel = (status: TaskStatus): string => {
    switch (status) {
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

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(task.id, parseInt(e.target.value) as TaskStatus);
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(task.id);
      onClose();
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  const needsAttention = task.status === TaskStatus.NEED_TAKING_CARE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className={`
          px-8 py-6 border-b border-slate-700
          ${needsAttention ? 'bg-rose-500/5 border-rose-500/30' : ''}
        `}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-3xl font-bold text-white font-mono">
                  {task.name}
                </h2>
                {needsAttention && (
                  <span className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-rose-500/20 text-rose-300 text-sm font-bold rounded-full border border-rose-500/30 animate-pulse">
                    <span className="w-2 h-2 bg-rose-400 rounded-full"></span>
                    {t('taskItem.needsAttention')}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <span className={`px-4 py-2 rounded-full border text-sm font-semibold ${getStatusColor(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
                <span className="text-slate-400 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {task.lastRemindedAt
                    ? `${t('taskItem.lastReminded')} ${formatDistanceToNow(new Date(task.lastRemindedAt), { addSuffix: true })}`
                    : `${t('taskItem.created')} ${formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}`}
                </span>
                <span className="text-amber-400 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {task.reminderInterval}h intervals
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Close (Esc)"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 overflow-y-auto max-h-[calc(90vh-250px)]">
          {/* URL Section */}
          {task.url && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Related Link
              </h3>
              <a
                href={task.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 hover:underline text-lg group"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="break-all">{task.url}</span>
              </a>
            </div>
          )}

          {/* Description Section */}
          {task.description ? (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Description
              </h3>
              <div className="prose prose-lg prose-invert max-w-none bg-slate-900/50 rounded-lg p-6 border border-slate-700/50">
                <ReactMarkdown>{task.description}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="mb-6 text-slate-500 italic">
              No description provided
            </div>
          )}

          {/* Metadata Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-slate-900/30 rounded-lg border border-slate-700/50">
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Created</h4>
              <p className="text-white font-mono text-sm">
                {new Date(task.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Last Updated</h4>
              <p className="text-white font-mono text-sm">
                {new Date(task.updatedAt).toLocaleString()}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Last Reminded</h4>
              <p className="text-white font-mono text-sm">
                {task.lastRemindedAt ? new Date(task.lastRemindedAt).toLocaleString() : 'Never'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 border-t border-slate-700 bg-slate-900/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label htmlFor="status-select" className="text-sm font-semibold text-slate-300">
              Status:
            </label>
            <select
              id="status-select"
              value={task.status}
              onChange={handleStatusChange}
              className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm font-medium
                         focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                         transition-all duration-200 cursor-pointer hover:bg-slate-700"
            >
              <option value={TaskStatus.WORKING}>{getStatusLabel(TaskStatus.WORKING)}</option>
              <option value={TaskStatus.NEED_TAKING_CARE}>{getStatusLabel(TaskStatus.NEED_TAKING_CARE)}</option>
              <option value={TaskStatus.DONE}>{getStatusLabel(TaskStatus.DONE)}</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              className={`
                px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-800
                ${
                  showDeleteConfirm
                    ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/25'
                    : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
                }
              `}
            >
              {showDeleteConfirm ? '⚠️ ' + t('taskItem.confirmDelete') : t('common.delete')}
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-700 text-white font-semibold rounded-lg
                         hover:bg-slate-600 transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
