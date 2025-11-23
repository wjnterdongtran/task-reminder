'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { VocabularyAIResponse } from '@/types/vocabulary';

interface VocabularyManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: VocabularyAIResponse) => Promise<void>;
  onCheckExists: (word: string) => Promise<boolean>;
}

export default function VocabularyManualModal({
  isOpen,
  onClose,
  onSave,
  onCheckExists,
}: VocabularyManualModalProps) {
  const { t } = useTranslation();
  const [word, setWord] = useState('');
  const [ipa, setIpa] = useState('');
  const [meaning, setMeaning] = useState('');
  const [usage, setUsage] = useState('');
  const [culturalContext, setCulturalContext] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setWord('');
      setIpa('');
      setMeaning('');
      setUsage('');
      setCulturalContext('');
      setError(null);
    }
  }, [isOpen]);

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!word.trim()) {
      setError(t('vocabulary.wordRequired'));
      return;
    }

    if (!meaning.trim()) {
      setError(t('vocabulary.meaningRequired'));
      return;
    }

    setError(null);
    setSaving(true);

    try {
      // Check if word exists
      const exists = await onCheckExists(word.trim());
      if (exists) {
        setError(t('vocabulary.wordExists'));
        setSaving(false);
        return;
      }

      await onSave({
        word: word.trim(),
        ipa: ipa.trim(),
        meaning: meaning.trim(),
        usage: usage.trim(),
        culturalContext: culturalContext.trim(),
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white font-mono">
            {t('vocabulary.manualCreate')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Word */}
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2">
              {t('vocabulary.word')} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder={t('vocabulary.wordPlaceholder')}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-600/50
                       text-white placeholder-slate-400 focus:outline-none focus:ring-2
                       focus:ring-cyan-500/50 focus:border-transparent transition-all"
              autoFocus
            />
          </div>

          {/* IPA */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              {t('vocabulary.ipa')}
            </label>
            <input
              type="text"
              value={ipa}
              onChange={(e) => setIpa(e.target.value)}
              placeholder="/ˈeksəmpəl/"
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-600/50
                       text-white placeholder-slate-400 focus:outline-none focus:ring-2
                       focus:ring-cyan-500/50 focus:border-transparent transition-all"
            />
          </div>

          {/* Meaning */}
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2">
              {t('vocabulary.meaning')} <span className="text-red-400">*</span>
            </label>
            <textarea
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder={t('vocabulary.meaningPlaceholder')}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-600/50
                       text-white placeholder-slate-400 focus:outline-none focus:ring-2
                       focus:ring-cyan-500/50 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Usage */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              {t('vocabulary.usage')}
            </label>
            <textarea
              value={usage}
              onChange={(e) => setUsage(e.target.value)}
              placeholder={t('vocabulary.usagePlaceholder')}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-600/50
                       text-white placeholder-slate-400 focus:outline-none focus:ring-2
                       focus:ring-cyan-500/50 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Cultural Context */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              {t('vocabulary.culturalContext')}
            </label>
            <textarea
              value={culturalContext}
              onChange={(e) => setCulturalContext(e.target.value)}
              placeholder={t('vocabulary.culturalContextPlaceholder')}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-600/50
                       text-white placeholder-slate-400 focus:outline-none focus:ring-2
                       focus:ring-cyan-500/50 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white
                     font-medium rounded-lg transition-all"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !word.trim() || !meaning.trim()}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500
                     hover:from-cyan-400 hover:to-blue-400 text-white font-medium
                     rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('common.saving')}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {t('common.save')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
