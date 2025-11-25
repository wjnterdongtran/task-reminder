"use client";

import { useState } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
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
                    <div className="text-white">
                        <MarkdownContent content={meaning.vietnamese} />
                    </div>
                </div>
            );
        }
        return (
            <p className="text-white whitespace-pre-wrap">{String(meaning)}</p>
        );
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 mb-6 animate-slideUp">
            <h3 className="text-lg font-semibold text-white mb-4 font-mono">
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
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50
                   text-white placeholder-slate-400 focus:outline-none focus:ring-2
                   focus:ring-cyan-500/50 focus:border-transparent transition-all"
                    disabled={generating}
                />
                <button
                    onClick={handleGenerate}
                    disabled={generating || !word.trim()}
                    className="px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-500
                   hover:from-cyan-400 hover:to-blue-400 text-white font-medium
                   rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center gap-2"
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
                <p className="text-yellow-400 text-sm mb-4">
                    {t("vocabulary.wordExists")}
                </p>
            )}
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            {/* Generated Content Preview */}
            {generatedData && (
                <div className="bg-slate-900/50 rounded-xl p-4 mb-4 border border-slate-600/30 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-4">
                        {/* Word and IPA */}
                        <div>
                            <div className="flex items-baseline gap-3 flex-wrap">
                                <h4 className="text-xl font-bold text-cyan-400 font-mono">
                                    {generatedData.word}
                                </h4>
                            </div>
                            <IPADisplay ipa={generatedData.ipa} />
                        </div>

                        {/* Meaning */}
                        <div>
                            <label className="text-xs text-cyan-400 uppercase tracking-wide font-medium">
                                {t("vocabulary.meaning")}
                            </label>
                            <div className="mt-1 p-3 bg-slate-800/50 rounded-lg">
                                {renderMeaningPreview()}
                            </div>
                        </div>

                        {/* Usage */}
                        {generatedData.usage && (
                            <div>
                                <label className="text-xs text-emerald-400 uppercase tracking-wide font-medium">
                                    {t("vocabulary.usage")}
                                </label>
                                <div className="mt-1 p-3 bg-slate-800/50 rounded-lg">
                                    <UsageSectionDisplay
                                        usage={generatedData.usage}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Cultural Context */}
                        {generatedData.culturalContext && (
                            <div>
                                <label className="text-xs text-purple-400 uppercase tracking-wide font-medium">
                                    {t("vocabulary.culturalContext")}
                                </label>
                                <div className="mt-1 p-3 bg-slate-800/50 rounded-lg">
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
                    <div className="flex gap-3 mt-4 pt-4 border-t border-slate-700/50">
                        <button
                            onClick={handleAdd}
                            className="flex-1 px-4 py-2 bg-linear-to-r from-emerald-500 to-green-500
                       hover:from-emerald-400 hover:to-green-400 text-white font-medium
                       rounded-lg transition-all flex items-center justify-center gap-2"
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
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white
                       font-medium rounded-lg transition-all"
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
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                    {t("common.cancel")}
                </button>
            )}
        </div>
    );
}
