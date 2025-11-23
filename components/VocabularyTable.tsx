'use client';

import { useState } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import {
  Vocabulary,
  parseVocabularyFields,
  isStructuredIPA,
  isStructuredMeaning,
  isStructuredUsage,
  isStructuredCulturalContext,
} from '@/types/vocabulary';
import { format } from 'date-fns';
import MarkdownContent, { MarkdownList } from './MarkdownContent';

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
    // Parse the vocabulary to get structured data for search
    const parsed = parseVocabularyFields(vocab);

    // Get searchable text from meaning
    const meaningText = isStructuredMeaning(parsed.meaning)
      ? parsed.meaning.vietnamese
      : typeof parsed.meaning === 'string'
      ? parsed.meaning
      : '';

    // Get searchable text from usage
    const usageText = isStructuredUsage(parsed.usage)
      ? parsed.usage.examples.join(' ') + ' ' + parsed.usage.commonMistakes
      : typeof parsed.usage === 'string'
      ? parsed.usage
      : '';

    const matchesSearch =
      !searchQuery ||
      vocab.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meaningText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      usageText.toLowerCase().includes(searchQuery.toLowerCase());

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

  // Render IPA in table row
  const renderIPA = (vocab: Vocabulary) => {
    const parsed = parseVocabularyFields(vocab);
    if (isStructuredIPA(parsed.ipa)) {
      const parts = [];
      if (parsed.ipa.uk) parts.push(`UK: ${parsed.ipa.uk}`);
      if (parsed.ipa.us) parts.push(`US: ${parsed.ipa.us}`);
      return parts.length > 0 ? (
        <span className="text-slate-400 text-sm">{parts.join(' | ')}</span>
      ) : null;
    }
    return parsed.ipa ? (
      <span className="text-slate-400 text-sm">{parsed.ipa}</span>
    ) : null;
  };

  // Render meaning summary in table row
  const renderMeaningSummary = (vocab: Vocabulary) => {
    const parsed = parseVocabularyFields(vocab);
    if (isStructuredMeaning(parsed.meaning)) {
      return (
        <div className="flex items-start gap-2">
          {parsed.meaning.partOfSpeech && (
            <span className="flex-shrink-0 px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 text-xs rounded">
              {parsed.meaning.partOfSpeech}
            </span>
          )}
          <span className="text-slate-300 line-clamp-2">{parsed.meaning.vietnamese}</span>
        </div>
      );
    }
    return (
      <p className="text-slate-300 line-clamp-2">
        {typeof parsed.meaning === 'string' ? parsed.meaning : ''}
      </p>
    );
  };

  // Render expanded content
  const renderExpandedContent = (vocab: Vocabulary) => {
    const parsed = parseVocabularyFields(vocab);

    return (
      <div className="px-4 pb-4 pt-2 border-t border-slate-700/50 space-y-4 animate-slideUp">
        {/* Usage Section */}
        {isStructuredUsage(parsed.usage) ? (
          <div className="space-y-3">
            {/* Examples */}
            {parsed.usage.examples && parsed.usage.examples.length > 0 && (
              <div>
                <label className="text-xs text-emerald-400 uppercase tracking-wide font-medium flex items-center gap-1 mb-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {t('vocabulary.examples')}
                </label>
                <MarkdownList items={parsed.usage.examples} ordered />
              </div>
            )}

            {/* Collocations */}
            {parsed.usage.collocations && parsed.usage.collocations.length > 0 && (
              <div>
                <label className="text-xs text-emerald-400 uppercase tracking-wide font-medium flex items-center gap-1 mb-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {t('vocabulary.collocations')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {parsed.usage.collocations.map((col, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-700/50 rounded text-sm text-slate-300"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Grammar Patterns */}
            {parsed.usage.grammarPatterns && parsed.usage.grammarPatterns.length > 0 && (
              <div>
                <label className="text-xs text-emerald-400 uppercase tracking-wide font-medium flex items-center gap-1 mb-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  {t('vocabulary.grammarPatterns')}
                </label>
                <MarkdownList items={parsed.usage.grammarPatterns} />
              </div>
            )}

            {/* Common Mistakes */}
            {parsed.usage.commonMistakes && (
              <div>
                <label className="text-xs text-orange-400 uppercase tracking-wide font-medium flex items-center gap-1 mb-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {t('vocabulary.commonMistakes')}
                </label>
                <div className="text-orange-200/80">
                  <MarkdownContent content={parsed.usage.commonMistakes} />
                </div>
              </div>
            )}
          </div>
        ) : (
          parsed.usage && (
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide">
                {t('vocabulary.usage')}
              </label>
              <p className="text-slate-300 mt-1 whitespace-pre-wrap">
                {typeof parsed.usage === 'string' ? parsed.usage : ''}
              </p>
            </div>
          )
        )}

        {/* Cultural Context Section */}
        {isStructuredCulturalContext(parsed.culturalContext) ? (
          <div className="space-y-3 pt-3 border-t border-slate-700/30">
            {/* Etymology */}
            {parsed.culturalContext.etymology && (
              <div>
                <label className="text-xs text-purple-400 uppercase tracking-wide font-medium flex items-center gap-1 mb-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('vocabulary.etymology')}
                </label>
                <div className="text-slate-300">
                  <MarkdownContent content={parsed.culturalContext.etymology} />
                </div>
              </div>
            )}

            {/* Related Expressions */}
            {parsed.culturalContext.relatedExpressions && parsed.culturalContext.relatedExpressions.length > 0 && (
              <div>
                <label className="text-xs text-purple-400 uppercase tracking-wide font-medium flex items-center gap-1 mb-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {t('vocabulary.relatedExpressions')}
                </label>
                <MarkdownList items={parsed.culturalContext.relatedExpressions} />
              </div>
            )}

            {/* Nuances */}
            {parsed.culturalContext.nuancesForVietnameseLearners && (
              <div>
                <label className="text-xs text-purple-400 uppercase tracking-wide font-medium flex items-center gap-1 mb-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  {t('vocabulary.nuances')}
                </label>
                <div className="text-slate-300">
                  <MarkdownContent content={parsed.culturalContext.nuancesForVietnameseLearners} />
                </div>
              </div>
            )}
          </div>
        ) : (
          parsed.culturalContext && (
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide">
                {t('vocabulary.culturalContext')}
              </label>
              <p className="text-slate-400 mt-1 whitespace-pre-wrap">
                {typeof parsed.culturalContext === 'string' ? parsed.culturalContext : ''}
              </p>
            </div>
          )
        )}
      </div>
    );
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
                    {renderIPA(vocab)}
                  </div>
                  <div className="mt-1">{renderMeaningSummary(vocab)}</div>

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
              {expandedId === vocab.id && renderExpandedContent(vocab)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
