'use client';

import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useTaskReminder } from '@/hooks/useTaskReminder';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { TaskFormData } from '@/types/task';

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const { tasks, isLoaded, addTask, updateTaskStatus, deleteTask, markAsReminded } = useTasks();

  // Set up automatic reminder checking
  useTaskReminder({ tasks, markAsReminded, isLoaded });

  const handleAddTask = (data: TaskFormData) => {
    addTask(data);
    setShowForm(false);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-900">Task Reminder Manager</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                showForm
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {showForm ? 'Cancel' : '+ New Task'}
            </button>
          </div>
          <p className="text-gray-600">
            Manage your tasks with automatic reminders every 24 hours (or custom interval)
          </p>
        </header>

        {showForm && (
          <div className="mb-8">
            <TaskForm onSubmit={handleAddTask} onCancel={() => setShowForm(false)} />
          </div>
        )}

        <TaskList
          tasks={tasks}
          onStatusChange={updateTaskStatus}
          onDelete={deleteTask}
        />
      </div>
    </div>
  );
}
