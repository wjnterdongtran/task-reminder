/**
 * Vocabulary Types
 * Types for the English vocabulary learning feature
 */

// Structured IPA pronunciation with UK and US variants
export interface IPA {
  uk: string;
  us: string;
}

// Structured meaning with part of speech and Vietnamese translation
export interface Meaning {
  partOfSpeech: string;
  vietnamese: string;
}

// Structured usage information
export interface Usage {
  examples: string[];
  collocations: string[];
  grammarPatterns: string[];
  commonMistakes: string;
}

// Structured cultural context
export interface CulturalContext {
  etymology: string;
  culturalSignificance: string;
  relatedExpressions: string[];
  nuancesForVietnameseLearners: string;
}

// Main vocabulary entry stored in database
// Note: ipa, meaning, usage, culturalContext are stored as JSON strings
export interface Vocabulary {
  id: string;
  word: string;
  ipa: string; // JSON string of IPA object or simple string for legacy
  meaning: string; // JSON string of Meaning object or simple string for legacy
  usage: string; // JSON string of Usage object or simple string for legacy
  culturalContext: string; // JSON string of CulturalContext object or simple string for legacy
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  reviewCount: number;
  lastReviewedAt: string | null;
}

// Parsed vocabulary with structured data for display
export interface ParsedVocabulary {
  id: string;
  word: string;
  ipa: IPA | string;
  meaning: Meaning | string;
  usage: Usage | string;
  culturalContext: CulturalContext | string;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  reviewCount: number;
  lastReviewedAt: string | null;
}

export interface VocabularyFormData {
  word: string;
  ipa?: string;
  meaning?: string;
  usage?: string;
  culturalContext?: string;
}

// AI response with structured data
export interface VocabularyAIResponse {
  word: string;
  ipa: IPA;
  meaning: Meaning;
  usage: Usage;
  culturalContext: CulturalContext;
}

// Legacy AI response format for backward compatibility
export interface VocabularyAIResponseLegacy {
  word: string;
  ipa: string;
  meaning: string;
  usage: string;
  culturalContext: string;
}

export interface VocabularySearchParams {
  query?: string;
  isFavorite?: boolean;
  sortBy?: 'word' | 'createdAt' | 'reviewCount';
  sortOrder?: 'asc' | 'desc';
}

// Helper to check if IPA is structured
export function isStructuredIPA(ipa: IPA | string): ipa is IPA {
  return typeof ipa === 'object' && ipa !== null && 'uk' in ipa && 'us' in ipa;
}

// Helper to check if Meaning is structured
export function isStructuredMeaning(meaning: Meaning | string): meaning is Meaning {
  return typeof meaning === 'object' && meaning !== null && 'partOfSpeech' in meaning && 'vietnamese' in meaning;
}

// Helper to check if Usage is structured
export function isStructuredUsage(usage: Usage | string): usage is Usage {
  return typeof usage === 'object' && usage !== null && 'examples' in usage;
}

// Helper to check if CulturalContext is structured
export function isStructuredCulturalContext(ctx: CulturalContext | string): ctx is CulturalContext {
  return typeof ctx === 'object' && ctx !== null && 'etymology' in ctx;
}

// Parse stored JSON strings to structured objects
export function parseVocabularyFields(vocab: Vocabulary): ParsedVocabulary {
  const tryParse = <T>(value: string): T | string => {
    if (!value) return value;
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object') return parsed as T;
      return value;
    } catch {
      return value;
    }
  };

  return {
    ...vocab,
    ipa: tryParse<IPA>(vocab.ipa),
    meaning: tryParse<Meaning>(vocab.meaning),
    usage: tryParse<Usage>(vocab.usage),
    culturalContext: tryParse<CulturalContext>(vocab.culturalContext),
  };
}
