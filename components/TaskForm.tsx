'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { TaskFormData } from '@/types/task';
import 'easymde/dist/easymde.min.css';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), {
  ssr: false,
});

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void;
  onCancel?: () => void;
}

export function TaskForm({ onSubmit, onCancel }: TaskFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [reminderInterval, setReminderInterval] = useState(24);

  const editorOptions = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: 'Enter task description (supports Markdown)',
      status: false,
      toolbar: [
        'bold',
        'italic',
        'heading',
        '|',
        'quote',
        'unordered-list',
        'ordered-list',
        '|',
        'link',
        'image',
        '|',
        'preview',
        'side-by-side',
        'fullscreen',
        '|',
        'guide',
      ] as any,
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter a task name');
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      url: url.trim(),
      reminderInterval,
    });

    // Reset form
    setName('');
    setDescription('');
    setUrl('');
    setReminderInterval(24);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Task Name *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter task name"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description (Markdown)
        </label>
        <SimpleMDE
          value={description}
          onChange={setDescription}
          options={editorOptions}
        />
      </div>

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
          URL Link (e.g., Jira)
        </label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://jira.example.com/browse/TASK-123"
        />
      </div>

      <div>
        <label htmlFor="reminderInterval" className="block text-sm font-medium text-gray-700 mb-1">
          Reminder Interval (hours)
        </label>
        <input
          type="number"
          id="reminderInterval"
          value={reminderInterval}
          onChange={(e) => setReminderInterval(Math.max(1, parseInt(e.target.value) || 24))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="1"
          placeholder="24"
        />
        <p className="text-xs text-gray-500 mt-1">
          Task will be reminded every {reminderInterval} hours if not completed
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Task
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
