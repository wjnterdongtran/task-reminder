"use client";

import { useEffect, useCallback } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import {
    Vocabulary,
    parseVocabularyFields,
    isStructuredUsage,
    isStructuredCulturalContext,
} from "@/types/vocabulary";
import { format } from "date-fns";
import {
    IPADisplay,
    MeaningDisplay,
    UsageSectionDisplay,
    CulturalContextSectionDisplay,
} from "./vocabulary/VocabularyDisplayComponents";

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
            if (e.key === "Escape") {
                onClose();
            }
        },
        [onClose]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    const hasUsage = isStructuredUsage(parsed.usage)
        ? parsed.usage.examples.length > 0 ||
          parsed.usage.collocations.length > 0 ||
          parsed.usage.grammarPatterns.length > 0 ||
          parsed.usage.commonMistakes
        : !!parsed.usage;

    const hasCulturalContext = isStructuredCulturalContext(
        parsed.culturalContext
    )
        ? parsed.culturalContext.etymology ||
          parsed.culturalContext.culturalSignificance ||
          parsed.culturalContext.relatedExpressions.length > 0 ||
          parsed.culturalContext.nuancesForVietnameseLearners
        : !!parsed.culturalContext;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-2xl bg-[var(--vocab-card)] rounded-2xl border border-[var(--vocab-border)] shadow-xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
                {/* Header */}
                <div className="p-6 border-b border-[var(--vocab-border)] flex items-start justify-between bg-[var(--vocab-card-alt)]">
                    <div className="flex-1">
                        <div className="flex items-baseline gap-3 flex-wrap mb-2">
                            <h2 className="text-2xl font-semibold text-[var(--vocab-text)] font-serif">
                                {vocabulary.word}
                            </h2>
                        </div>
                        {/* IPA */}
                        <IPADisplay ipa={parsed.ipa} />
                        <div className="flex items-center gap-4 mt-2 text-xs text-[var(--vocab-text-muted)] font-serif-alt">
                            <span>
                                {t("taskItem.created")}:{" "}
                                {format(
                                    new Date(vocabulary.createdAt),
                                    "dd/MM/yyyy HH:mm"
                                )}
                            </span>
                            <span>
                                {t("vocabulary.reviews")}:{" "}
                                {vocabulary.reviewCount + 1}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() =>
                                onToggleFavorite(
                                    vocabulary.id,
                                    !vocabulary.isFavorite
                                )
                            }
                            className={`p-2 rounded-lg transition-all ${
                                vocabulary.isFavorite
                                    ? "text-[var(--vocab-text)] bg-stone/50"
                                    : "text-[var(--vocab-text-muted)] hover:text-[var(--vocab-text)] hover:bg-stone/30"
                            }`}
                        >
                            <svg
                                className="w-6 h-6"
                                fill={
                                    vocabulary.isFavorite
                                        ? "currentColor"
                                        : "none"
                                }
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                />
                            </svg>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-[var(--vocab-text-muted)] hover:text-[var(--vocab-text)] hover:bg-stone/30
                       rounded-lg transition-all"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Meaning */}
                    <div>
                        <label className="text-sm text-[var(--vocab-text-secondary)] font-medium uppercase tracking-wide flex items-center gap-2 mb-3 font-serif-alt">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                            </svg>
                            {t("vocabulary.meaning")}
                        </label>
                        <div className="p-4 bg-[var(--vocab-card-alt)] rounded-xl border border-[var(--vocab-border)]">
                            <MeaningDisplay meaning={parsed.meaning} />
                        </div>
                    </div>

                    {/* Usage */}
                    {hasUsage && (
                        <div>
                            <label className="text-sm text-[var(--vocab-text-secondary)] font-medium uppercase tracking-wide flex items-center gap-2 mb-3 font-serif-alt">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                </svg>
                                {t("vocabulary.usage")}
                            </label>
                            <div className="p-4 bg-[var(--vocab-card-alt)] rounded-xl border border-[var(--vocab-border)]">
                                <UsageSectionDisplay usage={parsed.usage} />
                            </div>
                        </div>
                    )}

                    {/* Cultural Context */}
                    {hasCulturalContext && (
                        <div>
                            <label className="text-sm text-[var(--vocab-text-secondary)] font-medium uppercase tracking-wide flex items-center gap-2 mb-3 font-serif-alt">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                {t("vocabulary.culturalContext")}
                            </label>
                            <div className="p-4 bg-[var(--vocab-card-alt)] rounded-xl border border-[var(--vocab-border)]">
                                <CulturalContextSectionDisplay
                                    culturalContext={parsed.culturalContext}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[var(--vocab-border)] flex justify-end bg-[var(--vocab-card-alt)]">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-muted hover:bg-ink-dark text-white
                     font-medium rounded-lg transition-all font-serif-alt"
                    >
                        {t("common.cancel")}
                    </button>
                </div>
            </div>
        </div>
    );
}
