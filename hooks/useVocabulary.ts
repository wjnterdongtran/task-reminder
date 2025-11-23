'use client';

import { useState, useEffect, useCallback } from 'react';
import { Vocabulary, VocabularyAIResponse, VocabularySearchParams } from '@/types/vocabulary';
import * as vocabularyService from '@/lib/supabase/vocabularyService';

export function useVocabulary() {
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Load vocabulary
  const loadVocabulary = useCallback(async (params?: VocabularySearchParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await vocabularyService.getAllVocabulary(params);
      setVocabulary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vocabulary');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadVocabulary();
  }, [loadVocabulary]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = vocabularyService.subscribeToVocabulary((data) => {
      setVocabulary(data);
    });

    return unsubscribe;
  }, []);

  // Generate vocabulary content using AI
  const generateContent = useCallback(async (word: string): Promise<VocabularyAIResponse | null> => {
    try {
      setGenerating(true);
      setError(null);

      const response = await fetch('/api/vocabulary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  // Check if word exists
  const checkWordExists = useCallback(async (word: string): Promise<Vocabulary | null> => {
    return vocabularyService.checkWordExists(word);
  }, []);

  // Add vocabulary
  const addVocabulary = useCallback(async (data: VocabularyAIResponse): Promise<Vocabulary | null> => {
    try {
      setError(null);
      const newVocab = await vocabularyService.createVocabulary(data);
      setVocabulary((prev) => [newVocab, ...prev]);
      return newVocab;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add vocabulary');
      return null;
    }
  }, []);

  // Update vocabulary
  const updateVocab = useCallback(async (id: string, updates: Partial<Vocabulary>): Promise<Vocabulary | null> => {
    try {
      setError(null);
      const updated = await vocabularyService.updateVocabulary(id, updates);
      setVocabulary((prev) => prev.map((v) => (v.id === id ? updated : v)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vocabulary');
      return null;
    }
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback(async (id: string, isFavorite: boolean): Promise<void> => {
    try {
      const updated = await vocabularyService.toggleVocabularyFavorite(id, isFavorite);
      setVocabulary((prev) => prev.map((v) => (v.id === id ? updated : v)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
    }
  }, []);

  // Increment review count
  const incrementReview = useCallback(async (id: string): Promise<void> => {
    try {
      const updated = await vocabularyService.incrementReviewCount(id);
      setVocabulary((prev) => prev.map((v) => (v.id === id ? updated : v)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to increment review');
    }
  }, []);

  // Delete vocabulary
  const deleteVocab = useCallback(async (id: string): Promise<void> => {
    try {
      await vocabularyService.deleteVocabulary(id);
      setVocabulary((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vocabulary');
    }
  }, []);

  return {
    vocabulary,
    loading,
    error,
    generating,
    loadVocabulary,
    generateContent,
    checkWordExists,
    addVocabulary,
    updateVocabulary: updateVocab,
    toggleFavorite,
    incrementReview,
    deleteVocabulary: deleteVocab,
  };
}
