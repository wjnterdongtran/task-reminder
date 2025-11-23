'use client';

import { useEffect, useCallback } from 'react';
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

interface VocabularyDetailModalProps {
  vocabulary: Vocabulary;
  onClose: () => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => Promise<void>;
  onIncrementReview: (id: string) => Promise<void>;
}

export default function VocabularyDetailModal({
  vocabulary,
  onClose,
  onToggleFavorite,
  onIncrementReview,
}: VocabularyDetailModalProps) {
  const { t } = useTranslation();

  // Parse the vocabulary fields to get structured data
  const parsed = parseVocabularyFields(vocabulary);

  // Increment review count when modal opens
  useEffect(() => {
    onIncrementReview(vocabulary.id);
  }, [vocabulary.id, onIncrementReview]);

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
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Render IPA section
  const renderIPA = () => {
    if (isStructuredIPA(parsed.ipa)) {
      return (
        <div className="flex items-center gap-4 flex-wrap">
          {parsed.ipa.uk && (
            <span className="text-slate-400">
              <span className="text-xs text-slate-500 uppercase mr-1">UK</span>
              {parsed.ipa.uk}
            </span>
          )}
          {parsed.ipa.us && (
            <span className="text-slate-400">
              <span className="text-xs text-slate-500 uppercase mr-1">US</span>
              {parsed.ipa.us}
            </span>
          )}
        </div>
      );
    }
    return parsed.ipa ? <span className="text-slate-400">{parsed.ipa}</span> : null;
  };

  // Render meaning section
  const renderMeaning = () => {
    if (isStructuredMeaning(parsed.meaning)) {
      return (
        <div className="space-y-2">
          {parsed.meaning.partOfSpeech && (
            <span className="inline-block px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full font-medium">
              {parsed.meaning.partOfSpeech}
            </span>
          )}
          <div className="text-white leading-relaxed">
            <MarkdownContent content={parsed.meaning.vietnamese} />
          </div>
        </div>
      );
    }
    return (
      <p className="text-white whitespace-pre-wrap leading-relaxed">
        {typeof parsed.meaning === 'string' ? parsed.meaning : ''}
      </p>
    );
  };

  // Render usage section
  const renderUsage = () => {
    if (isStructuredUsage(parsed.usage)) {
      return (
        <div className="space-y-4">
          {/* Examples */}
          {parsed.usage.examples && parsed.usage.examples.length > 0 && (
            <div>
              <h5 className="text-xs text-emerald-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {t('vocabulary.examples')}
              </h5>
              <MarkdownList items={parsed.usage.examples} className="pl-2" ordered />
            </div>
          )}

          {/* Collocations */}
          {parsed.usage.collocations && parsed.usage.collocations.length > 0 && (
            <div>
              <h5 className="text-xs text-emerald-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {t('vocabulary.collocations')}
              </h5>
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
              <h5 className="text-xs text-emerald-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                {t('vocabulary.grammarPatterns')}
              </h5>
              <MarkdownList items={parsed.usage.grammarPatterns} className="pl-2" />
            </div>
          )}

          {/* Common Mistakes */}
          {parsed.usage.commonMistakes && (
            <div>
              <h5 className="text-xs text-orange-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {t('vocabulary.commonMistakes')}
              </h5>
              <div className="pl-2 text-orange-200/80">
                <MarkdownContent content={parsed.usage.commonMistakes} />
              </div>
            </div>
          )}
        </div>
      );
    }
    return (
      <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
        {typeof parsed.usage === 'string' ? parsed.usage : ''}
      </p>
    );
  };

  // Render cultural context section
  const renderCulturalContext = () => {
    if (isStructuredCulturalContext(parsed.culturalContext)) {
      return (
        <div className="space-y-4">
          {/* Etymology */}
          {parsed.culturalContext.etymology && (
            <div>
              <h5 className="text-xs text-purple-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('vocabulary.etymology')}
              </h5>
              <div className="pl-2 text-slate-300">
                <MarkdownContent content={parsed.culturalContext.etymology} />
              </div>
            </div>
          )}

          {/* Cultural Significance */}
          {parsed.culturalContext.culturalSignificance && (
            <div>
              <h5 className="text-xs text-purple-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('vocabulary.culturalSignificance')}
              </h5>
              <div className="pl-2 text-slate-300">
                <MarkdownContent content={parsed.culturalContext.culturalSignificance} />
              </div>
            </div>
          )}

          {/* Related Expressions */}
          {parsed.culturalContext.relatedExpressions && parsed.culturalContext.relatedExpressions.length > 0 && (
            <div>
              <h5 className="text-xs text-purple-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {t('vocabulary.relatedExpressions')}
              </h5>
              <MarkdownList items={parsed.culturalContext.relatedExpressions} className="pl-2" />
            </div>
          )}

          {/* Nuances for Vietnamese Learners */}
          {parsed.culturalContext.nuancesForVietnameseLearners && (
            <div>
              <h5 className="text-xs text-purple-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {t('vocabulary.nuances')}
              </h5>
              <div className="pl-2 text-slate-300">
                <MarkdownContent content={parsed.culturalContext.nuancesForVietnameseLearners} />
              </div>
            </div>
          )}
        </div>
      );
    }
    return (
      <p className="text-slate-400 whitespace-pre-wrap leading-relaxed">
        {typeof parsed.culturalContext === 'string' ? parsed.culturalContext : ''}
      </p>
    );
  };

  const hasUsage = isStructuredUsage(parsed.usage)
    ? parsed.usage.examples.length > 0 || parsed.usage.collocations.length > 0 || parsed.usage.grammarPatterns.length > 0 || parsed.usage.commonMistakes
    : !!parsed.usage;

  const hasCulturalContext = isStructuredCulturalContext(parsed.culturalContext)
    ? parsed.culturalContext.etymology || parsed.culturalContext.culturalSignificance || parsed.culturalContext.relatedExpressions.length > 0 || parsed.culturalContext.nuancesForVietnameseLearners
    : !!parsed.culturalContext;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-baseline gap-3 flex-wrap mb-2">
              <h2 className="text-2xl font-bold text-cyan-400 font-mono">
                {vocabulary.word}
              </h2>
            </div>
            {/* IPA */}
            {renderIPA()}
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span>
                {t('taskItem.created')}: {format(new Date(vocabulary.createdAt), 'dd/MM/yyyy HH:mm')}
              </span>
              <span>{t('vocabulary.reviews')}: {vocabulary.reviewCount + 1}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(vocabulary.id, !vocabulary.isFavorite)}
              className={`p-2 rounded-lg transition-all ${
                vocabulary.isFavorite
                  ? 'text-yellow-400 bg-yellow-500/10'
                  : 'text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10'
              }`}
            >
              <svg className="w-6 h-6" fill={vocabulary.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50
                       rounded-lg transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Meaning */}
          <div>
            <label className="text-sm text-cyan-400 font-medium uppercase tracking-wide flex items-center gap-2 mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {t('vocabulary.meaning')}
            </label>
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
              {renderMeaning()}
            </div>
          </div>

          {/* Usage */}
          {hasUsage && (
            <div>
              <label className="text-sm text-emerald-400 font-medium uppercase tracking-wide flex items-center gap-2 mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {t('vocabulary.usage')}
              </label>
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
                {renderUsage()}
              </div>
            </div>
          )}

          {/* Cultural Context */}
          {hasCulturalContext && (
            <div>
              <label className="text-sm text-purple-400 font-medium uppercase tracking-wide flex items-center gap-2 mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('vocabulary.culturalContext')}
              </label>
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
                {renderCulturalContext()}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white
                     font-medium rounded-lg transition-all"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
