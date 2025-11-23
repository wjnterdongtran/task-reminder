'use client';

import { useState, useCallback } from 'react';
import { useVocabulary } from '@/hooks/useVocabulary';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import VocabularyForm from '@/components/VocabularyForm';
import VocabularyTable from '@/components/VocabularyTable';
import VocabularyDetailModal from '@/components/VocabularyDetailModal';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Vocabulary, VocabularyAIResponse } from '@/types/vocabulary';
import Link from 'next/link';

export default function VocabularyPage() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [showForm, setShowForm] = useState(false);
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

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-400 font-mono">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <header className="mb-8 animate-slide-up">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-5xl font-bold text-white font-mono tracking-tight mb-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  {t('vocabulary.title')}
                </h1>
                <p className="text-slate-400 text-sm">
                  Learn English vocabulary with AI-powered content
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
                  <Link
                    href="/"
                    className="px-4 py-2 text-sm font-medium transition-all duration-300 rounded-md flex items-center gap-2 text-slate-400 hover:text-slate-200"
                    title={t('header.tasks')}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span className="hidden sm:inline">{t('header.tasks')}</span>
                  </Link>
                  <div className="px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 text-white bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="hidden sm:inline">{t('header.vocabulary')}</span>
                  </div>
                </div>

                {/* Add Word Button */}
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
                      {t('vocabulary.addWord')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* Vocabulary Form */}
          {showForm && (
            <VocabularyForm
              onGenerate={handleGenerate}
              onAdd={handleAdd}
              onCheckExists={handleCheckExists}
              generating={generating}
              onCancel={() => setShowForm(false)}
            />
          )}

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
