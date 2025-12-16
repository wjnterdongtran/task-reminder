"use client";

import { useTranslation } from "@/contexts/LanguageContext";
import MarkdownContent, { MarkdownList } from "../MarkdownContent";
import {
    IPA,
    Meaning,
    Usage,
    CulturalContext,
    isStructuredIPA,
    isStructuredMeaning,
    isStructuredUsage,
    isStructuredCulturalContext,
} from "@/types/vocabulary";

// ============================================
// Common Icons
// ============================================

export const Icons = {
    examples: (
        <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
            />
        </svg>
    ),
    collocations: (
        <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
        </svg>
    ),
    grammarPatterns: (
        <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h7"
            />
        </svg>
    ),
    commonMistakes: (
        <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
        </svg>
    ),
    etymology: (
        <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    ),
    culturalSignificance: (
        <svg
            className="w-3 h-3"
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
    ),
    relatedExpressions: (
        <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
        </svg>
    ),
    nuances: (
        <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
        </svg>
    ),
};

// ============================================
// Section Header Component
// ============================================

type ColorTheme = "emerald" | "orange" | "purple";

interface SectionHeaderProps {
    labelKey: string;
    color: ColorTheme;
    icon?: React.ReactNode;
    className?: string;
}

const colorClasses: Record<ColorTheme, string> = {
    emerald: "text-emerald-400",
    orange: "text-orange-400",
    purple: "text-purple-400",
};

export function SectionHeader({
    labelKey,
    color,
    icon,
    className = "",
}: SectionHeaderProps) {
    const { t } = useTranslation();
    return (
        <h6
            className={`text-xs ${colorClasses[color]} uppercase tracking-wide font-medium flex items-center gap-1 mb-2 ${className}`}
        >
            {icon}
            {t(labelKey)}
        </h6>
    );
}

// ============================================
// IPA Display Component
// ============================================

interface IPADisplayProps {
    ipa: IPA | string;
    variant?: "default" | "compact" | "inline";
    className?: string;
}

export function IPADisplay({
    ipa,
    variant = "default",
    className = "",
}: IPADisplayProps) {
    if (!ipa) return null;

    if (isStructuredIPA(ipa)) {
        if (variant === "compact") {
            const parts = [];
            if (ipa.uk) parts.push(`UK: ${ipa.uk}`);
            if (ipa.us) parts.push(`US: ${ipa.us}`);
            return parts.length > 0 ? (
                <span className={`text-slate-400 text-sm ${className}`}>
                    {parts.join(" | ")}
                </span>
            ) : null;
        }

        return (
            <div className={`flex items-center gap-3 flex-wrap ${className}`}>
                {ipa.uk && (
                    <span className="text-slate-400 text-sm">
                        <span className="text-xs text-slate-500 uppercase mr-1">
                            UK
                        </span>
                        {ipa.uk}
                    </span>
                )}
                {ipa.us && (
                    <span className="text-slate-400 text-sm">
                        <span className="text-xs text-slate-500 uppercase mr-1">
                            US
                        </span>
                        {ipa.us}
                    </span>
                )}
            </div>
        );
    }

    return (
        <span className={`text-slate-400 text-sm ${className}`}>
            {String(ipa)}
        </span>
    );
}

// ============================================
// Part of Speech Badge Component
// ============================================

interface PartOfSpeechBadgeProps {
    partOfSpeech: string;
    variant?: "default" | "small";
    className?: string;
}

export function PartOfSpeechBadge({
    partOfSpeech,
    variant = "default",
    className = "",
}: PartOfSpeechBadgeProps) {
    if (!partOfSpeech) return null;

    const sizeClasses =
        variant === "small" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-xs";

    return (
        <span
            className={`inline-block ${sizeClasses} bg-cyan-500/20 text-cyan-300 rounded-full font-medium ${className}`}
        >
            {partOfSpeech}
        </span>
    );
}

// ============================================
// Meaning Display Component
// ============================================

/**
 * Formats meaning text by adding line breaks before numbered definitions
 * Example: "1. First meaning. 2. Second meaning." -> "1. First meaning.\n2. Second meaning."
 */
function formatMeaningWithLineBreaks(text: string): string {
    // Add line break before numbered items (e.g., "2. ", "3. ", etc.)
    // but not before the first one if it starts with "1. "
    return text.replace(/(\.\s*)(\d+\.\s)/g, (match, period, number) => {
        return period + '\n' + number;
    });
}

interface MeaningDisplayProps {
    meaning: Meaning | string;
    className?: string;
}

export function MeaningDisplay({
    meaning,
    className = "",
}: MeaningDisplayProps) {
    if (!meaning) return null;

    if (isStructuredMeaning(meaning)) {
        // Format the Vietnamese text to add line breaks between numbered meanings
        const formattedVietnamese = formatMeaningWithLineBreaks(meaning.vietnamese);

        return (
            <div className={`space-y-2 ${className}`}>
                {meaning.partOfSpeech && (
                    <PartOfSpeechBadge partOfSpeech={meaning.partOfSpeech} />
                )}
                <div className="text-white leading-relaxed">
                    <MarkdownContent content={formattedVietnamese} />
                </div>
            </div>
        );
    }

    // For simple string meanings, also apply formatting
    const formattedMeaning = formatMeaningWithLineBreaks(String(meaning));

    return (
        <p
            className={`text-white whitespace-pre-wrap leading-relaxed ${className}`}
        >
            {formattedMeaning}
        </p>
    );
}

// ============================================
// Collocations Display Component
// ============================================

interface CollocationsDisplayProps {
    collocations: string[];
    showHeader?: boolean;
    className?: string;
}

export function CollocationsDisplay({
    collocations,
    showHeader = true,
    className = "",
}: CollocationsDisplayProps) {
    if (!collocations || collocations.length === 0) return null;

    return (
        <div className={className}>
            {showHeader && (
                <SectionHeader
                    labelKey="vocabulary.collocations"
                    color="emerald"
                    icon={Icons.collocations}
                />
            )}
            <div className="flex flex-wrap gap-2">
                {collocations.map((col, index) => (
                    <span
                        key={index}
                        className="px-2 py-1 bg-slate-700/50 rounded text-sm text-slate-300"
                    >
                        <MarkdownContent content={col} />
                    </span>
                ))}
            </div>
        </div>
    );
}

// ============================================
// Examples Display Component
// ============================================

interface ExamplesDisplayProps {
    examples: string[];
    showHeader?: boolean;
    className?: string;
}

export function ExamplesDisplay({
    examples,
    showHeader = true,
    className = "",
}: ExamplesDisplayProps) {
    if (!examples || examples.length === 0) return null;

    return (
        <div className={className}>
            {showHeader && (
                <SectionHeader
                    labelKey="vocabulary.examples"
                    color="emerald"
                    icon={Icons.examples}
                />
            )}
            <MarkdownList items={examples} ordered />
        </div>
    );
}

// ============================================
// Grammar Patterns Display Component
// ============================================

interface GrammarPatternsDisplayProps {
    grammarPatterns: string[];
    showHeader?: boolean;
    className?: string;
}

export function GrammarPatternsDisplay({
    grammarPatterns,
    showHeader = true,
    className = "",
}: GrammarPatternsDisplayProps) {
    if (!grammarPatterns || grammarPatterns.length === 0) return null;

    return (
        <div className={className}>
            {showHeader && (
                <SectionHeader
                    labelKey="vocabulary.grammarPatterns"
                    color="emerald"
                    icon={Icons.grammarPatterns}
                />
            )}
            <MarkdownList items={grammarPatterns} />
        </div>
    );
}

// ============================================
// Common Mistakes Display Component
// ============================================

interface CommonMistakesDisplayProps {
    commonMistakes: string;
    showHeader?: boolean;
    className?: string;
}

export function CommonMistakesDisplay({
    commonMistakes,
    showHeader = true,
    className = "",
}: CommonMistakesDisplayProps) {
    if (!commonMistakes) return null;

    return (
        <div className={className}>
            {showHeader && (
                <SectionHeader
                    labelKey="vocabulary.commonMistakes"
                    color="orange"
                    icon={Icons.commonMistakes}
                />
            )}
            <div className="text-orange-200/80">
                <MarkdownContent content={commonMistakes} />
            </div>
        </div>
    );
}

// ============================================
// Etymology Display Component
// ============================================

interface EtymologyDisplayProps {
    etymology: string;
    showHeader?: boolean;
    className?: string;
}

export function EtymologyDisplay({
    etymology,
    showHeader = true,
    className = "",
}: EtymologyDisplayProps) {
    if (!etymology) return null;

    return (
        <div className={className}>
            {showHeader && (
                <SectionHeader
                    labelKey="vocabulary.etymology"
                    color="purple"
                    icon={Icons.etymology}
                />
            )}
            <div className="text-slate-300">
                <MarkdownContent content={etymology} />
            </div>
        </div>
    );
}

// ============================================
// Cultural Significance Display Component
// ============================================

interface CulturalSignificanceDisplayProps {
    culturalSignificance: string;
    showHeader?: boolean;
    className?: string;
}

export function CulturalSignificanceDisplay({
    culturalSignificance,
    showHeader = true,
    className = "",
}: CulturalSignificanceDisplayProps) {
    if (!culturalSignificance) return null;

    return (
        <div className={className}>
            {showHeader && (
                <SectionHeader
                    labelKey="vocabulary.culturalSignificance"
                    color="purple"
                    icon={Icons.culturalSignificance}
                />
            )}
            <div className="text-slate-300">
                <MarkdownContent content={culturalSignificance} />
            </div>
        </div>
    );
}

// ============================================
// Related Expressions Display Component
// ============================================

interface RelatedExpressionsDisplayProps {
    relatedExpressions: string[];
    showHeader?: boolean;
    className?: string;
}

export function RelatedExpressionsDisplay({
    relatedExpressions,
    showHeader = true,
    className = "",
}: RelatedExpressionsDisplayProps) {
    if (!relatedExpressions || relatedExpressions.length === 0) return null;

    return (
        <div className={className}>
            {showHeader && (
                <SectionHeader
                    labelKey="vocabulary.relatedExpressions"
                    color="purple"
                    icon={Icons.relatedExpressions}
                />
            )}
            <MarkdownList items={relatedExpressions} />
        </div>
    );
}

// ============================================
// Nuances Display Component
// ============================================

interface NuancesDisplayProps {
    nuances: string;
    showHeader?: boolean;
    className?: string;
}

export function NuancesDisplay({
    nuances,
    showHeader = true,
    className = "",
}: NuancesDisplayProps) {
    if (!nuances) return null;

    return (
        <div className={className}>
            {showHeader && (
                <SectionHeader
                    labelKey="vocabulary.nuances"
                    color="purple"
                    icon={Icons.nuances}
                />
            )}
            <div className="text-slate-300">
                <MarkdownContent content={nuances} />
            </div>
        </div>
    );
}

// ============================================
// Composite: Usage Section Display
// ============================================

interface UsageSectionDisplayProps {
    usage: Usage | string;
    className?: string;
}

export function UsageSectionDisplay({
    usage,
    className = "",
}: UsageSectionDisplayProps) {
    if (!usage) return null;

    if (isStructuredUsage(usage)) {
        return (
            <div className={`space-y-3 ${className}`}>
                <ExamplesDisplay examples={usage.examples} />
                <CollocationsDisplay collocations={usage.collocations} />
                <GrammarPatternsDisplay
                    grammarPatterns={usage.grammarPatterns}
                />
                <CommonMistakesDisplay commonMistakes={usage.commonMistakes} />
            </div>
        );
    }

    return (
        <p
            className={`text-slate-300 whitespace-pre-wrap leading-relaxed ${className}`}
        >
            {String(usage)}
        </p>
    );
}

// ============================================
// Composite: Cultural Context Section Display
// ============================================

interface CulturalContextSectionDisplayProps {
    culturalContext: CulturalContext | string;
    className?: string;
}

export function CulturalContextSectionDisplay({
    culturalContext,
    className = "",
}: CulturalContextSectionDisplayProps) {
    if (!culturalContext) return null;

    if (isStructuredCulturalContext(culturalContext)) {
        return (
            <div className={`space-y-3 ${className}`}>
                <EtymologyDisplay etymology={culturalContext.etymology} />
                <CulturalSignificanceDisplay
                    culturalSignificance={culturalContext.culturalSignificance}
                />
                <RelatedExpressionsDisplay
                    relatedExpressions={culturalContext.relatedExpressions}
                />
                <NuancesDisplay
                    nuances={culturalContext.nuancesForVietnameseLearners}
                />
            </div>
        );
    }

    return (
        <p
            className={`text-slate-400 whitespace-pre-wrap leading-relaxed ${className}`}
        >
            {String(culturalContext)}
        </p>
    );
}
