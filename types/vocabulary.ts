/**
 * Vocabulary Types
 * Types for the English vocabulary learning feature
 */

export interface Vocabulary {
  id: string;
  word: string;
  ipa: string;
  meaning: string;
  usage: string;
  culturalContext: string;
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

export interface VocabularyAIResponse {
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
