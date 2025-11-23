import { supabase } from './client';
import { Vocabulary, VocabularyFormData, VocabularySearchParams, VocabularyAIResponse } from '@/types/vocabulary';

/**
 * Supabase Vocabulary Service
 * Handles all database operations for vocabulary
 */

// Convert database row to Vocabulary type
function dbRowToVocabulary(row: any): Vocabulary {
  return {
    id: row.id,
    word: row.word,
    ipa: row.ipa || '',
    meaning: row.meaning || '',
    usage: row.usage || '',
    culturalContext: row.cultural_context || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isFavorite: row.is_favorite || false,
    reviewCount: row.review_count || 0,
    lastReviewedAt: row.last_reviewed_at,
  };
}

// Convert form data to database insert format
function vocabularyToDbInsert(formData: VocabularyFormData | VocabularyAIResponse) {
  return {
    word: formData.word,
    ipa: formData.ipa || '',
    meaning: formData.meaning || '',
    usage: formData.usage || '',
    cultural_context: formData.culturalContext || '',
    is_favorite: false,
    review_count: 0,
    last_reviewed_at: null,
  };
}

/**
 * Fetch all vocabulary items
 */
export async function getAllVocabulary(params?: VocabularySearchParams): Promise<Vocabulary[]> {
  let query = supabase.from('vocabulary').select('*');

  // Apply filters
  if (params?.query) {
    query = query.or(
      `word.ilike.%${params.query}%,meaning.ilike.%${params.query}%,usage.ilike.%${params.query}%`
    );
  }

  if (params?.isFavorite !== undefined) {
    query = query.eq('is_favorite', params.isFavorite);
  }

  // Apply sorting
  const sortBy = params?.sortBy || 'createdAt';
  const sortOrder = params?.sortOrder || 'desc';
  const dbColumn = sortBy === 'createdAt' ? 'created_at' : sortBy === 'reviewCount' ? 'review_count' : sortBy;

  query = query.order(dbColumn, { ascending: sortOrder === 'asc' });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching vocabulary:', error);
    throw new Error(`Failed to fetch vocabulary: ${error.message}`);
  }

  return data.map(dbRowToVocabulary);
}

/**
 * Get vocabulary by ID
 */
export async function getVocabularyById(id: string): Promise<Vocabulary | null> {
  const { data, error } = await supabase
    .from('vocabulary')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching vocabulary:', error);
    return null;
  }

  return data ? dbRowToVocabulary(data) : null;
}

/**
 * Check if a word already exists
 */
export async function checkWordExists(word: string): Promise<Vocabulary | null> {
  const { data, error } = await supabase
    .from('vocabulary')
    .select('*')
    .ilike('word', word.trim())
    .maybeSingle();

  if (error) {
    console.error('Error checking word:', error);
    return null;
  }

  return data ? dbRowToVocabulary(data) : null;
}

/**
 * Create a new vocabulary entry
 */
export async function createVocabulary(
  formData: VocabularyFormData | VocabularyAIResponse
): Promise<Vocabulary> {
  const { data, error } = await supabase
    .from('vocabulary')
    .insert(vocabularyToDbInsert(formData))
    .select()
    .single();

  if (error) {
    console.error('Error creating vocabulary:', error);
    throw new Error(`Failed to create vocabulary: ${error.message}`);
  }

  return dbRowToVocabulary(data);
}

/**
 * Update vocabulary entry
 */
export async function updateVocabulary(
  id: string,
  updates: Partial<Vocabulary>
): Promise<Vocabulary> {
  const dbUpdates: any = {};

  if (updates.word !== undefined) dbUpdates.word = updates.word;
  if (updates.ipa !== undefined) dbUpdates.ipa = updates.ipa;
  if (updates.meaning !== undefined) dbUpdates.meaning = updates.meaning;
  if (updates.usage !== undefined) dbUpdates.usage = updates.usage;
  if (updates.culturalContext !== undefined) dbUpdates.cultural_context = updates.culturalContext;
  if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite;
  if (updates.reviewCount !== undefined) dbUpdates.review_count = updates.reviewCount;
  if (updates.lastReviewedAt !== undefined) dbUpdates.last_reviewed_at = updates.lastReviewedAt;

  const { data, error } = await supabase
    .from('vocabulary')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating vocabulary:', error);
    throw new Error(`Failed to update vocabulary: ${error.message}`);
  }

  return dbRowToVocabulary(data);
}

/**
 * Toggle favorite status
 */
export async function toggleVocabularyFavorite(id: string, isFavorite: boolean): Promise<Vocabulary> {
  const { data, error } = await supabase
    .from('vocabulary')
    .update({ is_favorite: isFavorite })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error toggling favorite:', error);
    throw new Error(`Failed to toggle favorite: ${error.message}`);
  }

  return dbRowToVocabulary(data);
}

/**
 * Increment review count
 */
export async function incrementReviewCount(id: string): Promise<Vocabulary> {
  // First get current count
  const current = await getVocabularyById(id);
  if (!current) {
    throw new Error('Vocabulary not found');
  }

  const { data, error } = await supabase
    .from('vocabulary')
    .update({
      review_count: current.reviewCount + 1,
      last_reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error incrementing review count:', error);
    throw new Error(`Failed to increment review count: ${error.message}`);
  }

  return dbRowToVocabulary(data);
}

/**
 * Delete vocabulary entry
 */
export async function deleteVocabulary(id: string): Promise<void> {
  const { error } = await supabase.from('vocabulary').delete().eq('id', id);

  if (error) {
    console.error('Error deleting vocabulary:', error);
    throw new Error(`Failed to delete vocabulary: ${error.message}`);
  }
}

/**
 * Subscribe to vocabulary changes (real-time updates)
 */
export function subscribeToVocabulary(
  callback: (vocabulary: Vocabulary[]) => void
): () => void {
  const channel = supabase
    .channel('vocabulary-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'vocabulary',
      },
      async () => {
        const vocabulary = await getAllVocabulary();
        callback(vocabulary);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
