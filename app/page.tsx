'use client';

import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useTaskReminder } from '@/hooks/useTaskReminder';
import { useTranslation } from '@/contexts/LanguageContext';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import KanbanBoard from '@/components/KanbanBoard';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { TaskFormData } from '@/types/task';

type ViewMode = 'board' | 'list';

export default function Home() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const { tasks, isLoaded, addTask, updateTaskStatus, deleteTask, markAsReminded } = useTasks();

  // Set up automatic reminder checking
  useTaskReminder({ tasks, markAsReminded, isLoaded });

  const handleAddTask = (data: TaskFormData) => {
    addTask(data);
    setShowForm(false);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-400 font-mono">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 animate-slide-up">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-5xl font-bold text-white font-mono tracking-tight mb-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                {t('common.appTitle')}
              </h1>
              <p className="text-slate-400 text-sm">
                {t('kanban.dragHint')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1 border border-slate-700/50 backdrop-blur-sm">
                <button
                  onClick={() => setViewMode('board')}
                  className={`
                    px-4 py-2 text-sm font-medium transition-all duration-300 rounded-md flex items-center gap-2
                    ${
                      viewMode === 'board'
                        ? 'text-white bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25'
                        : 'text-slate-400 hover:text-slate-200'
                    }
                  `}
                  title={t('header.boardView')}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  <span className="hidden sm:inline">{t('header.boardView')}</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`
                    px-4 py-2 text-sm font-medium transition-all duration-300 rounded-md flex items-center gap-2
                    ${
                      viewMode === 'list'
                        ? 'text-white bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25'
                        : 'text-slate-400 hover:text-slate-200'
                    }
                  `}
                  title={t('header.listView')}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="hidden sm:inline">{t('header.listView')}</span>
                </button>
              </div>

              {/* New Task Button */}
              <button
                onClick={() => setShowForm(!showForm)}
                className={`
                  px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2
                  ${
                    showForm
                      ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-105'
                  }
                `}
              >
                {showForm ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {t('common.cancel')}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('header.newTask')}
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Task Form */}
        {showForm && (
          <div className="mb-8">
            <TaskForm onSubmit={handleAddTask} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {/* View Content */}
        <div className="animate-fade-in">
          {viewMode === 'board' ? (
            <KanbanBoard
              tasks={tasks}
              onStatusChange={updateTaskStatus}
              onDeleteTask={deleteTask}
            />
          ) : (
            <TaskList
              tasks={tasks}
              onStatusChange={updateTaskStatus}
              onDelete={deleteTask}
            />
          )}
        </div>
      </div>
    </div>
  );
}
