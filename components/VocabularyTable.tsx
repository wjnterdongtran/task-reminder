"use client";

import { useState } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import {
    Vocabulary,
    parseVocabularyFields,
    isStructuredMeaning,
    isStructuredUsage,
    isStructuredCulturalContext,
} from "@/types/vocabulary";
import { format } from "date-fns";
import {
    IPADisplay,
    PartOfSpeechBadge,
    UsageSectionDisplay,
    CulturalContextSectionDisplay,
    formatMeaningWithLineBreaks,
} from "./vocabulary/VocabularyDisplayComponents";

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
    const [searchQuery, setSearchQuery] = useState("");
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
            : typeof parsed.meaning === "string"
            ? parsed.meaning
            : "";
        // Get searchable text from usage
        const usageText = isStructuredUsage(parsed.usage)
            ? parsed.usage.examples.join(" ") +
              " " +
              parsed.usage.commonMistakes
            : typeof parsed.usage === "string"
            ? parsed.usage
            : "";

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
        return <IPADisplay ipa={parsed.ipa} variant="compact" />;
    };

    // Render meaning summary in table row
    const renderMeaningSummary = (vocab: Vocabulary) => {
        const parsed = parseVocabularyFields(vocab);
        if (isStructuredMeaning(parsed.meaning)) {
            // Format the Vietnamese text to add line breaks between numbered meanings
            const formattedVietnamese = formatMeaningWithLineBreaks(
                parsed.meaning.vietnamese
            );
            return (
                <div className="flex flex-col items-start gap-2">
                    {parsed.meaning.partOfSpeech && (
                        <PartOfSpeechBadge
                            partOfSpeech={parsed.meaning.partOfSpeech}
                            variant="small"
                            className="shrink-0"
                        />
                    )}
                    <span className="whitespace-pre-wrap text-[var(--vocab-text-secondary)] font-serif-alt">
                        {formattedVietnamese}
                    </span>
                </div>
            );
        }
        return (
            <p className="text-[var(--vocab-text-secondary)] font-serif-alt">
                {typeof parsed.meaning === "string" ? parsed.meaning : ""}
            </p>
        );
    };

    // Render expanded content
    const renderExpandedContent = (vocab: Vocabulary) => {
        const parsed = parseVocabularyFields(vocab);

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
            <div className="px-4 pb-4 pt-2 border-t border-[var(--vocab-border)] space-y-4 animate-slideUp bg-[var(--vocab-card-alt)]/50">
                {/* Usage Section */}
                {hasUsage && <UsageSectionDisplay usage={parsed.usage} />}

                {/* Cultural Context Section */}
                {hasCulturalContext && (
                    <div className="pt-3 border-t border-[var(--vocab-border)]">
                        <CulturalContextSectionDisplay
                            culturalContext={parsed.culturalContext}
                        />
                    </div>
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
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--vocab-text-muted)]"
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
                        placeholder={t("vocabulary.searchPlaceholder")}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--vocab-card-alt)] border border-[var(--vocab-border)]
                     text-[var(--vocab-text)] placeholder-subtle focus:outline-none focus:ring-2
                     focus:ring-ink-dark/20 focus:border-ink-dark transition-all font-serif-alt"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowFavoritesOnly(false)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all font-serif-alt ${
                            !showFavoritesOnly
                                ? "bg-ink-dark text-white"
                                : "bg-[var(--vocab-card)] text-[var(--vocab-text-secondary)] border border-[var(--vocab-border)] hover:bg-[var(--vocab-card-alt)]"
                        }`}
                    >
                        {t("vocabulary.allWords")}
                    </button>
                    <button
                        onClick={() => setShowFavoritesOnly(true)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 font-serif-alt ${
                            showFavoritesOnly
                                ? "bg-ink-dark text-white"
                                : "bg-[var(--vocab-card)] text-[var(--vocab-text-secondary)] border border-[var(--vocab-border)] hover:bg-[var(--vocab-card-alt)]"
                        }`}
                    >
                        <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {t("vocabulary.favorites")}
                    </button>
                </div>
            </div>

            {/* Count */}
            <div className="text-[var(--vocab-text-muted)] text-sm font-serif-alt">
                {t("vocabulary.wordCount", {
                    count: filteredVocabulary.length,
                })}
            </div>

            {/* Table/Cards */}
            {filteredVocabulary.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📚</div>
                    <p className="text-[var(--vocab-text-secondary)] font-serif-alt">{t("vocabulary.noWords")}</p>
                    <p className="text-[var(--vocab-text-muted)] text-sm mt-1 font-serif-alt">
                        {t("vocabulary.noWordsHint")}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredVocabulary.map((vocab) => (
                        <div
                            key={vocab.id}
                            className="bg-[var(--vocab-card)] rounded-xl border border-[var(--vocab-border)]
                       overflow-hidden transition-all hover:border-ink-dark/30 hover:shadow-sm"
                        >
                            {/* Main Row */}
                            <div className="p-4">
                                {/* First Row: Favorite + Word + IPA + Actions */}
                                <div className="flex items-center gap-3">
                                    {/* Word + IPA */}
                                    <div className="flex-1 min-w-0 flex items-baseline gap-2 flex-wrap">
                                        <h4 className="text-lg font-semibold text-[var(--vocab-text)] font-serif">
                                            {vocab.word}
                                        </h4>
                                        {renderIPA(vocab)}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() =>
                                                setExpandedId(
                                                    expandedId === vocab.id
                                                        ? null
                                                        : vocab.id
                                                )
                                            }
                                            className="p-2 text-[var(--vocab-text-muted)] hover:text-[var(--vocab-text)] hover:bg-stone/30
                                 rounded-lg transition-all"
                                            title={
                                                expandedId === vocab.id
                                                    ? t("taskItem.collapse")
                                                    : t("taskItem.expand")
                                            }
                                        >
                                            <svg
                                                className={`w-5 h-5 transform transition-transform ${
                                                    expandedId === vocab.id
                                                        ? "rotate-180"
                                                        : ""
                                                }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </button>
                                        {/* Favorite Button */}
                                        <button
                                            onClick={() =>
                                                onToggleFavorite(
                                                    vocab.id,
                                                    !vocab.isFavorite
                                                )
                                            }
                                            className={`shrink-0 p-2 rounded-lg transition-all ${
                                                vocab.isFavorite
                                                    ? "text-[var(--vocab-text)] bg-stone/50"
                                                    : "text-[var(--vocab-text-muted)] hover:text-[var(--vocab-text)] hover:bg-stone/30"
                                            }`}
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                fill={
                                                    vocab.isFavorite
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
                                            onClick={() => onViewDetails(vocab)}
                                            className="p-2 text-[var(--vocab-text-muted)] hover:text-[var(--vocab-text)] hover:bg-stone/30
                                 rounded-lg transition-all"
                                            title={t("vocabulary.viewDetails")}
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(vocab.id)
                                            }
                                            className={`p-2 rounded-lg transition-all ${
                                                deleteConfirm === vocab.id
                                                    ? "text-red-600 bg-red-100"
                                                    : "text-[var(--vocab-text-muted)] hover:text-red-600 hover:bg-red-50"
                                            }`}
                                            title={
                                                deleteConfirm === vocab.id
                                                    ? t(
                                                          "vocabulary.confirmDelete"
                                                      )
                                                    : t("common.delete")
                                            }
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Second Row: Meaning Summary */}
                                <div className="mt-3">
                                    {renderMeaningSummary(vocab)}
                                </div>

                                {/* Third Row: Metadata */}
                                <div className="flex items-center gap-4 mt-2 text-xs text-[var(--vocab-text-muted)] font-serif-alt">
                                    <span>
                                        {t("vocabulary.reviews")}:{" "}
                                        {vocab.reviewCount}
                                    </span>
                                    {vocab.lastReviewedAt && (
                                        <span>
                                            {t("vocabulary.lastReviewed")}:{" "}
                                            {format(
                                                new Date(vocab.lastReviewedAt),
                                                "dd/MM/yyyy"
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedId === vocab.id &&
                                renderExpandedContent(vocab)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
