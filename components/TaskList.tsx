'use client';

import { useMemo, useState } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { useTranslation } from '@/contexts/LanguageContext';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

type FilterType = 'all' | TaskStatus;

export function TaskList({ tasks, onStatusChange, onDelete }: TaskListProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filterButtons = [
    { key: 'all', label: t('taskList.allTasks'), count: statusCounts.all },
    { key: TaskStatus.INIT, label: getStatusLabel(TaskStatus.INIT), count: statusCounts[TaskStatus.INIT] },
    { key: TaskStatus.WORKING, label: getStatusLabel(TaskStatus.WORKING), count: statusCounts[TaskStatus.WORKING] },
    { key: TaskStatus.NEED_TAKING_CARE, label: getStatusLabel(TaskStatus.NEED_TAKING_CARE), count: statusCounts[TaskStatus.NEED_TAKING_CARE] },
    { key: TaskStatus.DONE, label: getStatusLabel(TaskStatus.DONE), count: statusCounts[TaskStatus.DONE] },
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-700/50">
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('taskList.searchPlaceholder')}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg
                         text-white placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                         transition-all duration-200"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {filterButtons.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as FilterType)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  filter === key
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50'
                }
              `}
            >
              {label} <span className="opacity-75">({count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
          <div className="mb-4 text-6xl opacity-20">📋</div>
          <p className="text-slate-400 text-lg mb-2">
            {searchQuery
              ? t('taskList.noSearchResults')
              : filter === 'all'
              ? t('taskList.noTasks')
              : `${t('taskList.noTasks')} - ${getStatusLabel(filter as TaskStatus)}`}
          </p>
          {!searchQuery && filter === 'all' && (
            <p className="text-slate-500 text-sm">{t('taskList.noTasksHint')}</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
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
