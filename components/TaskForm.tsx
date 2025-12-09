'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { TaskFormData, TASK_PRESET_COLORS } from '@/types/task';
import { useTranslation } from '@/contexts/LanguageContext';
import 'easymde/dist/easymde.min.css';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), {
  ssr: false,
});

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void;
  onCancel?: () => void;
  initialValues?: TaskFormData;
  isEditMode?: boolean;
}

export function TaskForm({ onSubmit, onCancel, initialValues, isEditMode = false }: TaskFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialValues?.name || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [url, setUrl] = useState(initialValues?.url || '');
  const [jiraId, setJiraId] = useState(initialValues?.jiraId || '');
  const [reminderInterval, setReminderInterval] = useState(initialValues?.reminderInterval || 24);
  const [color, setColor] = useState(initialValues?.color || '');

  const editorOptions = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: t('taskForm.descriptionPlaceholder'),
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
  }, [t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert(t('taskForm.taskNamePlaceholder'));
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      url: url.trim(),
      jiraId: jiraId.trim() || undefined,
      reminderInterval,
      color: color || undefined,
    });

    // Reset form only if not in edit mode
    if (!isEditMode) {
      setName('');
      setDescription('');
      setUrl('');
      setJiraId('');
      setReminderInterval(24);
      setColor('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-slate-800/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-slate-700/50 animate-slide-up"
    >
      {/* Form Title */}
      <div className="border-b border-slate-700/50 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-white font-mono tracking-tight">
          {isEditMode ? t('taskForm.editTitle') : t('taskForm.title')}
        </h2>
      </div>

      {/* Task Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-slate-200 mb-2">
          {t('taskForm.taskName')} <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg
                     text-white placeholder-slate-500
                     focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                     transition-all duration-200"
          placeholder={t('taskForm.taskNamePlaceholder')}
          required
        />
      </div>

      {/* Jira ID */}
      <div>
        <label htmlFor="jiraId" className="block text-sm font-semibold text-slate-200 mb-2">
          Jira ID
        </label>
        <input
          type="text"
          id="jiraId"
          value={jiraId}
          onChange={(e) => setJiraId(e.target.value)}
          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg
                     text-white placeholder-slate-500
                     focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                     transition-all duration-200"
          placeholder="e.g., PROJECT-123"
        />
        <p className="text-xs text-slate-400 mt-2">
          Optional Jira ticket ID for reference
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-slate-200 mb-2">
          {t('taskForm.description')}
        </label>
        <div className="rounded-lg overflow-hidden border border-slate-600">
          <SimpleMDE
            value={description}
            onChange={setDescription}
            options={editorOptions}
          />
        </div>
      </div>

      {/* URL */}
      <div>
        <label htmlFor="url" className="block text-sm font-semibold text-slate-200 mb-2">
          {t('taskForm.url')}
        </label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg
                     text-white placeholder-slate-500
                     focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                     transition-all duration-200"
          placeholder={t('taskForm.urlPlaceholder')}
        />
      </div>

      {/* Color Picker */}
      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-2">
          Priority Color
        </label>
        <div className="flex gap-3 items-center">
          {TASK_PRESET_COLORS.map((presetColor) => (
            <button
              key={presetColor.value}
              type="button"
              onClick={() => setColor(color === presetColor.value ? '' : presetColor.value)}
              className={`w-10 h-10 rounded-lg transition-all duration-200 ${
                color === presetColor.value
                  ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-white scale-110'
                  : 'hover:scale-105'
              }`}
              style={{ backgroundColor: presetColor.value }}
              title={presetColor.name}
            />
          ))}
          {color && (
            <button
              type="button"
              onClick={() => setColor('')}
              className="text-slate-400 hover:text-slate-200 text-sm underline ml-2"
            >
              Clear
            </button>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Select a color to highlight task priority
        </p>
      </div>

      {/* Reminder Interval */}
      <div>
        <label htmlFor="reminderInterval" className="block text-sm font-semibold text-slate-200 mb-2">
          {t('taskForm.reminderInterval')}
        </label>
        <input
          type="number"
          id="reminderInterval"
          value={reminderInterval}
          onChange={(e) => setReminderInterval(Math.max(1, parseInt(e.target.value) || 24))}
          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg
                     text-white placeholder-slate-500
                     focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                     transition-all duration-200"
          min="1"
          placeholder="24"
        />
        <p className="text-xs text-slate-400 mt-2">
          {t('taskForm.reminderIntervalHint')}
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg
                     hover:from-cyan-600 hover:to-blue-700
                     focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800
                     transition-all duration-200 shadow-lg shadow-cyan-500/25
                     hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-[1.02]"
        >
          {isEditMode ? t('taskForm.updateTask') : t('taskForm.createTask')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-slate-700 text-slate-200 font-semibold rounded-lg
                       hover:bg-slate-600
                       focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800
                       transition-all duration-200"
          >
            {t('taskForm.cancel')}
          </button>
        )}
      </div>
    </form>
  );
}
