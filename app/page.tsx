'use client';

import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import KanbanBoard from '@/components/KanbanBoard';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import TaskDetailModal from '@/components/TaskDetailModal';
import { MigrationHelper } from '@/components/MigrationHelper';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { TaskFormData, Task, TaskStatus } from '@/types/task';
import Link from 'next/link';

type ViewMode = 'board' | 'list';

export default function Home() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { tasks, isLoaded, addTask, updateTask, updateTaskStatus, deleteTask, resetTaskReminder, toggleTaskPin, setAllTasks } = useTasks();

  const handleAddTask = async (data: TaskFormData) => {
    try {
      await addTask(data);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to add task:', error);
      // Could add user-facing error handling here
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(false);
  };

  const handleUpdateTask = async (data: TaskFormData) => {
    if (editingTask) {
      try {
        await updateTask(editingTask.id, {
          name: data.name,
          description: data.description,
          url: data.url,
          reminderInterval: data.reminderInterval,
          color: data.color,
        });
        setEditingTask(null);
      } catch (error) {
        console.error('Failed to update task:', error);
        // Could add user-facing error handling here
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  const handleReorderTasks = (reorderedTasks: Task[]) => {
    // Update the tasks array with the new order
    setAllTasks(reorderedTasks);
  };

  const handleViewDetails = async (task: Task) => {
    // If task is WORKING or NEED_TAKING_CARE, reset it to WORKING and restart the timer
    if (task.status === TaskStatus.WORKING || task.status === TaskStatus.NEED_TAKING_CARE) {
      try {
        await resetTaskReminder(task.id);
      } catch (error) {
        console.error('Failed to reset task reminder:', error);
      }
    }
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
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

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <MigrationHelper />
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
              {/* User Info & Sign Out */}
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="text-sm">
                  <span className="text-slate-400">Signed in as:</span>{' '}
                  <span className="text-cyan-400">{user?.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-slate-400 hover:text-red-400 transition-colors text-sm"
                  title="Sign out"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Navigation Toggle */}
              <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1 border border-slate-700/50 backdrop-blur-sm">
                <div className="px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 text-white bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span className="hidden sm:inline">{t('header.tasks')}</span>
                </div>
                <Link
                  href="/vocabulary"
                  className="px-4 py-2 text-sm font-medium transition-all duration-300 rounded-md flex items-center gap-2 text-slate-400 hover:text-slate-200"
                  title={t('header.vocabulary')}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="hidden sm:inline">{t('header.vocabulary')}</span>
                </Link>
              </div>

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

        {/* Task Form (Create) */}
        {showForm && !editingTask && (
          <div className="mb-8">
            <TaskForm onSubmit={handleAddTask} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {/* Task Form (Edit) */}
        {editingTask && (
          <div className="mb-8">
            <TaskForm
              onSubmit={handleUpdateTask}
              onCancel={handleCancelEdit}
              initialValues={{
                name: editingTask.name,
                description: editingTask.description,
                url: editingTask.url,
                reminderInterval: editingTask.reminderInterval,
                color: editingTask.color,
              }}
              isEditMode={true}
            />
          </div>
        )}

        {/* View Content */}
        <div className="animate-fade-in">
          {viewMode === 'board' ? (
            <KanbanBoard
              tasks={tasks}
              onStatusChange={updateTaskStatus}
              onReorderTasks={handleReorderTasks}
              onDeleteTask={deleteTask}
              onEditTask={handleEditTask}
              onViewDetails={handleViewDetails}
              onTogglePin={toggleTaskPin}
            />
          ) : (
            <TaskList
              tasks={tasks}
              onStatusChange={updateTaskStatus}
              onDelete={deleteTask}
              onViewDetails={handleViewDetails}
              onTogglePin={toggleTaskPin}
            />
          )}
        </div>

        {/* Task Detail Modal */}
        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={handleCloseModal}
          onStatusChange={updateTaskStatus}
          onDelete={deleteTask}
        />
      </div>
    </div>
    </ProtectedRoute>
  );
}
