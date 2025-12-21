'use client';

import { useState, useCallback } from 'react';
import { useVocabulary } from '@/hooks/useVocabulary';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { VocabularyThemeProvider, VocabThemeToggle, useVocabularyTheme } from '@/contexts/VocabularyThemeContext';
import VocabularyForm from '@/components/VocabularyForm';
import VocabularyTable from '@/components/VocabularyTable';
import VocabularyDetailModal from '@/components/VocabularyDetailModal';
import VocabularyManualModal from '@/components/VocabularyManualModal';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Vocabulary, VocabularyAIResponse, VocabularyFormData } from '@/types/vocabulary';
import Link from 'next/link';

type AddMode = 'none' | 'ai' | 'manual';

function VocabularyPageContent() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [addMode, setAddMode] = useState<AddMode>('none');
  const [selectedVocab, setSelectedVocab] = useState<Vocabulary | null>(null);

  const {
    vocabulary,
    loading,
    generating,
    generateContent,
    checkWordExists,
    addVocabulary,
    toggleFavorite,
    incrementReview,
    deleteVocabulary,
  } = useVocabulary();

  const handleCheckExists = useCallback(
    async (word: string): Promise<boolean> => {
      const existing = await checkWordExists(word);
      return existing !== null;
    },
    [checkWordExists]
  );

  const handleGenerate = useCallback(
    async (word: string): Promise<VocabularyAIResponse | null> => {
      return generateContent(word);
    },
    [generateContent]
  );

  const handleAdd = useCallback(
    async (data: VocabularyAIResponse): Promise<void> => {
      await addVocabulary(data);
    },
    [addVocabulary]
  );

  // Handle manual form data (strings)
  const handleAddManual = useCallback(
    async (data: VocabularyFormData): Promise<void> => {
      // Convert form data to a compatible format for the service
      await addVocabulary(data as unknown as VocabularyAIResponse);
    },
    [addVocabulary]
  );

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const { isDark } = useVocabularyTheme();

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-charcoal' : 'bg-[#fafaf8]'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-ink-dark border-t-transparent rounded-full animate-spin"></div>
          <div className="text-subtle font-serif-alt">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className={`vocab-theme min-h-screen transition-colors duration-300 ${isDark ? 'vocab-dark bg-[var(--vocab-bg)]' : 'bg-[var(--vocab-bg)]'}`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <header className="mb-8 animate-slide-up">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className={`text-4xl font-semibold font-serif tracking-tight mb-2 ${isDark ? 'text-cream' : 'text-ink'}`}>
                  {t('vocabulary.title')}
                </h1>
                <p className={`text-sm font-serif-alt ${isDark ? 'text-fog' : 'text-subtle'}`}>
                  Learn English vocabulary with AI-powered content
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* User Info & Sign Out */}
                <div className="flex items-center gap-3 px-4 py-2 bg-paper rounded-lg border border-stone">
                  <div className="text-sm font-serif-alt">
                    <span className="text-subtle">Signed in as:</span>{' '}
                    <span className="text-ink font-medium">{user?.email}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-subtle hover:text-ink transition-colors text-sm"
                    title="Sign out"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>

                {/* Language Switcher */}
                <LanguageSwitcher />

                {/* Theme Toggle */}
                <VocabThemeToggle />

                {/* Navigation Toggle */}
                <div className="flex items-center gap-2 bg-paper rounded-lg p-1 border border-stone">
                  <Link
                    href="/"
                    className="px-4 py-2 text-sm font-medium transition-all duration-300 rounded-md flex items-center gap-2 text-subtle hover:text-ink"
                    title={t('header.tasks')}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span className="hidden sm:inline">{t('header.tasks')}</span>
                  </Link>
                  <div className="px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 text-white bg-ink-dark">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="hidden sm:inline">{t('header.vocabulary')}</span>
                  </div>
                </div>

                {/* Add Word Buttons */}
                <div className="flex items-center gap-2">
                  {/* AI Generate Button */}
                  <button
                    onClick={() => setAddMode(addMode === 'ai' ? 'none' : 'ai')}
                    className={`
                      px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 border
                      ${
                        addMode === 'ai'
                          ? 'bg-paper text-muted border-stone'
                          : 'bg-ink-dark text-white border-ink-dark hover:bg-ink'
                      }
                    `}
                    title={t('vocabulary.aiGenerate')}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="hidden sm:inline">{t('vocabulary.aiGenerate')}</span>
                  </button>

                  {/* Manual Create Button */}
                  <button
                    onClick={() => setAddMode('manual')}
                    className="px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2
                             bg-muted text-white border border-muted hover:bg-ink-dark"
                    title={t('vocabulary.manualCreate')}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">{t('vocabulary.manualCreate')}</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* AI Vocabulary Form */}
          {addMode === 'ai' && (
            <VocabularyForm
              onGenerate={handleGenerate}
              onAdd={handleAdd}
              onCheckExists={handleCheckExists}
              generating={generating}
              onCancel={() => setAddMode('none')}
            />
          )}

          {/* Manual Create Modal */}
          <VocabularyManualModal
            isOpen={addMode === 'manual'}
            onClose={() => setAddMode('none')}
            onSave={handleAddManual}
            onCheckExists={handleCheckExists}
          />

          {/* Vocabulary Table */}
          <div className="animate-fade-in">
            <VocabularyTable
              vocabulary={vocabulary}
              onToggleFavorite={toggleFavorite}
              onDelete={deleteVocabulary}
              onViewDetails={(vocab) => setSelectedVocab(vocab)}
            />
          </div>

          {/* Detail Modal */}
          {selectedVocab && (
            <VocabularyDetailModal
              vocabulary={selectedVocab}
              onClose={() => setSelectedVocab(null)}
              onToggleFavorite={toggleFavorite}
              onIncrementReview={incrementReview}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Wrap with theme provider
export default function VocabularyPage() {
  return (
    <VocabularyThemeProvider>
      <VocabularyPageContent />
    </VocabularyThemeProvider>
  );
}
