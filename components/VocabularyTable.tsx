'use client';

import { useState } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { Vocabulary } from '@/types/vocabulary';
import { format } from 'date-fns';

interface VocabularyTableProps {
  vocabulary: Vocabulary[];
  onToggleFavorite: (id: string, isFavorite: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onViewDetails: (vocab: Vocabulary) => void;
}

export default function VocabularyTable({
  vocabulary,
  onToggleFavorite,
  onDelete,
  onViewDetails,
}: VocabularyTableProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter vocabulary
  const filteredVocabulary = vocabulary.filter((vocab) => {
    const matchesSearch =
      !searchQuery ||
      vocab.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vocab.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vocab.usage.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFavorite = !showFavoritesOnly || vocab.isFavorite;

    return matchesSearch && matchesFavorite;
  });

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      await onDelete(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('vocabulary.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50
                     text-white placeholder-slate-400 focus:outline-none focus:ring-2
                     focus:ring-cyan-500/50 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFavoritesOnly(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              !showFavoritesOnly
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white'
            }`}
          >
            {t('vocabulary.allWords')}
          </button>
          <button
            onClick={() => setShowFavoritesOnly(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              showFavoritesOnly
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {t('vocabulary.favorites')}
          </button>
        </div>
      </div>

      {/* Count */}
      <div className="text-slate-400 text-sm">
        {t('vocabulary.wordCount', { count: filteredVocabulary.length })}
      </div>

      {/* Table/Cards */}
      {filteredVocabulary.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-slate-400">{t('vocabulary.noWords')}</p>
          <p className="text-slate-500 text-sm mt-1">{t('vocabulary.noWordsHint')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVocabulary.map((vocab) => (
            <div
              key={vocab.id}
              className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50
                       overflow-hidden transition-all hover:border-slate-600/50"
            >
              {/* Main Row */}
              <div className="p-4 flex items-start gap-4">
                {/* Favorite Button */}
                <button
                  onClick={() => onToggleFavorite(vocab.id, !vocab.isFavorite)}
                  className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                    vocab.isFavorite
                      ? 'text-yellow-400 bg-yellow-500/10'
                      : 'text-slate-500 hover:text-yellow-400 hover:bg-yellow-500/10'
                  }`}
                >
                  <svg className="w-5 h-5" fill={vocab.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h4 className="text-lg font-bold text-cyan-400 font-mono">
                      {vocab.word}
                    </h4>
                    {vocab.ipa && (
                      <span className="text-slate-400 text-sm">{vocab.ipa}</span>
                    )}
                  </div>
                  <p className="text-slate-300 mt-1 line-clamp-2">{vocab.meaning}</p>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>{t('vocabulary.reviews')}: {vocab.reviewCount}</span>
                    {vocab.lastReviewedAt && (
                      <span>
                        {t('vocabulary.lastReviewed')}: {format(new Date(vocab.lastReviewedAt), 'dd/MM/yyyy')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setExpandedId(expandedId === vocab.id ? null : vocab.id)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50
                             rounded-lg transition-all"
                    title={expandedId === vocab.id ? t('taskItem.collapse') : t('taskItem.expand')}
                  >
                    <svg
                      className={`w-5 h-5 transform transition-transform ${
                        expandedId === vocab.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onViewDetails(vocab)}
                    className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10
                             rounded-lg transition-all"
                    title={t('vocabulary.viewDetails')}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(vocab.id)}
                    className={`p-2 rounded-lg transition-all ${
                      deleteConfirm === vocab.id
                        ? 'text-red-400 bg-red-500/20'
                        : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
                    }`}
                    title={deleteConfirm === vocab.id ? t('vocabulary.confirmDelete') : t('common.delete')}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === vocab.id && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-700/50 space-y-3 animate-slideUp">
                  {vocab.usage && (
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wide">
                        {t('vocabulary.usage')}
                      </label>
                      <p className="text-slate-300 mt-1 whitespace-pre-wrap">{vocab.usage}</p>
                    </div>
                  )}
                  {vocab.culturalContext && (
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wide">
                        {t('vocabulary.culturalContext')}
                      </label>
                      <p className="text-slate-400 mt-1 whitespace-pre-wrap">{vocab.culturalContext}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
