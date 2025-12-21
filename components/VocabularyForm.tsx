"use client";

import { useState } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import { useVocabularyTheme } from "@/contexts/VocabularyThemeContext";
import { VocabularyAIResponse } from "@/types/vocabulary";
import MarkdownContent from "./MarkdownContent";
import {
    IPADisplay,
    PartOfSpeechBadge,
    UsageSectionDisplay,
    CulturalContextSectionDisplay,
} from "./vocabulary/VocabularyDisplayComponents";

interface VocabularyFormProps {
    onGenerate: (word: string) => Promise<VocabularyAIResponse | null>;
    onAdd: (data: VocabularyAIResponse) => Promise<void>;
    onCheckExists: (word: string) => Promise<boolean>;
    generating: boolean;
    onCancel: () => void;
}

export default function VocabularyForm({
    onGenerate,
    onAdd,
    onCheckExists,
    generating,
    onCancel,
}: VocabularyFormProps) {
    const { t } = useTranslation();
    const { isDark } = useVocabularyTheme();
    const [word, setWord] = useState("");
    const [generatedData, setGeneratedData] =
        useState<VocabularyAIResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [wordExists, setWordExists] = useState(false);

    const handleGenerate = async () => {
        if (!word.trim()) return;

        setError(null);
        setWordExists(false);

        // Check if word already exists
        const exists = await onCheckExists(word.trim());
        if (exists) {
            setWordExists(true);
            return;
        }

        const data = await onGenerate(word.trim());
        if (data) {
            setGeneratedData(data);
        }
    };

    const handleAdd = async () => {
        if (!generatedData) return;

        await onAdd(generatedData);
        setWord("");
        setGeneratedData(null);
        onCancel();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !generating && word.trim()) {
            e.preventDefault();
            handleGenerate();
        }
    };

    // Get markdown variant based on theme
    const markdownVariant = isDark ? "eink-dark" : "eink";

    // Render meaning preview
    const renderMeaningPreview = () => {
        if (!generatedData?.meaning) return null;
        const meaning = generatedData.meaning;

        if (typeof meaning === "object" && "vietnamese" in meaning) {
            return (
                <div className="space-y-2">
                    {meaning.partOfSpeech && (
                        <PartOfSpeechBadge
                            partOfSpeech={meaning.partOfSpeech}
                            variant="small"
                        />
                    )}
                    <div className="text-[var(--vocab-text)] font-serif-alt">
                        <MarkdownContent content={meaning.vietnamese} variant={markdownVariant} />
                    </div>
                </div>
            );
        }
        return (
            <p className="text-[var(--vocab-text)] whitespace-pre-wrap font-serif-alt">{String(meaning)}</p>
        );
    };

    return (
        <div className="bg-[var(--vocab-card)] rounded-2xl border border-[var(--vocab-border)] p-6 mb-6 animate-slideUp">
            <h3 className="text-lg font-semibold text-[var(--vocab-text)] mb-4 font-serif">
                {t("vocabulary.addWord")}
            </h3>

            {/* Input Section */}
            <div className="flex gap-3 mb-4">
                <input
                    type="text"
                    value={word}
                    onChange={(e) => {
                        setWord(e.target.value);
                        setWordExists(false);
                        setError(null);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={t("vocabulary.wordPlaceholder")}
                    className="flex-1 px-4 py-3 rounded-xl bg-[var(--vocab-card-alt)] border border-[var(--vocab-border)]
                   text-[var(--vocab-text)] placeholder-subtle focus:outline-none focus:ring-2
                   focus:ring-ink-dark/20 focus:border-ink-dark transition-all font-serif-alt"
                    disabled={generating}
                />
                <button
                    onClick={handleGenerate}
                    disabled={generating || !word.trim()}
                    className="px-6 py-3 bg-ink-dark hover:bg-ink
                   text-white font-medium rounded-xl transition-all 
                   disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-serif-alt"
                >
                    {generating ? (
                        <>
                            <svg
                                className="animate-spin h-4 w-4"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            {t("common.generating")}
                        </>
                    ) : (
                        <>
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
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                            {t("vocabulary.generateContent")}
                        </>
                    )}
                </button>
            </div>

            {/* Error/Warning Messages */}
            {wordExists && (
                <p className="text-amber-700 text-sm mb-4 font-serif-alt">
                    {t("vocabulary.wordExists")}
                </p>
            )}
            {error && <p className="text-red-600 text-sm mb-4 font-serif-alt">{error}</p>}

            {/* Generated Content Preview */}
            {generatedData && (
                <div className="bg-[var(--vocab-card-alt)] rounded-xl p-4 mb-4 border border-[var(--vocab-border)] max-h-[60vh] overflow-y-auto">
                    <div className="space-y-4">
                        {/* Word and IPA */}
                        <div>
                            <div className="flex items-baseline gap-3 flex-wrap">
                                <h4 className="text-xl font-semibold text-[var(--vocab-text)] font-serif">
                                    {generatedData.word}
                                </h4>
                            </div>
                            <IPADisplay ipa={generatedData.ipa} />
                        </div>

                        {/* Meaning */}
                        <div>
                            <label className="text-xs text-[var(--vocab-text-secondary)] uppercase tracking-wide font-medium font-serif-alt">
                                {t("vocabulary.meaning")}
                            </label>
                            <div className="mt-1 p-3 bg-[var(--vocab-card)] rounded-lg border border-[var(--vocab-border)]">
                                {renderMeaningPreview()}
                            </div>
                        </div>

                        {/* Usage */}
                        {generatedData.usage && (
                            <div>
                                <label className="text-xs text-[var(--vocab-text-secondary)] uppercase tracking-wide font-medium font-serif-alt">
                                    {t("vocabulary.usage")}
                                </label>
                                <div className="mt-1 p-3 bg-[var(--vocab-card)] rounded-lg border border-[var(--vocab-border)]">
                                    <UsageSectionDisplay
                                        usage={generatedData.usage}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Cultural Context */}
                        {generatedData.culturalContext && (
                            <div>
                                <label className="text-xs text-[var(--vocab-text-secondary)] uppercase tracking-wide font-medium font-serif-alt">
                                    {t("vocabulary.culturalContext")}
                                </label>
                                <div className="mt-1 p-3 bg-[var(--vocab-card)] rounded-lg border border-[var(--vocab-border)]">
                                    <CulturalContextSectionDisplay
                                        culturalContext={
                                            generatedData.culturalContext
                                        }
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4 pt-4 border-t border-[var(--vocab-border)]">
                        <button
                            onClick={handleAdd}
                            className="flex-1 px-4 py-2 bg-ink-dark hover:bg-ink
                       text-white font-medium rounded-lg transition-all 
                       flex items-center justify-center gap-2 font-serif-alt"
                        >
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
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                            {t("vocabulary.addToList")}
                        </button>
                        <button
                            onClick={() => {
                                setGeneratedData(null);
                                setWord("");
                            }}
                            className="px-4 py-2 bg-[var(--vocab-card)] hover:bg-[var(--vocab-card-alt)] text-[var(--vocab-text-secondary)]
                       font-medium rounded-lg transition-all border border-[var(--vocab-border)] font-serif-alt"
                        >
                            {t("common.cancel")}
                        </button>
                    </div>
                </div>
            )}

            {/* Cancel Button */}
            {!generatedData && (
                <button
                    onClick={onCancel}
                    className="text-[var(--vocab-text-muted)] hover:text-[var(--vocab-text)] text-sm transition-colors font-serif-alt"
                >
                    {t("common.cancel")}
                </button>
            )}
        </div>
    );
}
