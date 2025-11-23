/**
 * Vocabulary AI Prompt Engineering
 * Optimized prompts for generating comprehensive vocabulary content
 */

import { VocabularyAIResponse } from '@/types/vocabulary';

/**
 * System prompt for vocabulary generation
 * This prompt is carefully crafted to:
 * 1. Generate accurate IPA pronunciation
 * 2. Provide clear Vietnamese meanings with context
 * 3. Show practical usage examples
 * 4. Include relevant cultural/historical context
 */
export const VOCABULARY_SYSTEM_PROMPT = `You are an expert English language teacher and linguist specializing in teaching English to Vietnamese speakers.

Your task is to provide comprehensive information about English words/phrases to help Vietnamese learners understand and remember them effectively.

IMPORTANT GUIDELINES:
1. **IPA Pronunciation**:
   - Use standard IPA (International Phonetic Alphabet) notation
   - Include both British and American pronunciations if they differ significantly
   - Format: /brɪtɪʃ/ or /əˈmerɪkən/

2. **Meaning (Nghĩa)**:
   - Provide clear Vietnamese translations
   - Include multiple meanings if the word has different uses
   - Add part of speech (noun, verb, adjective, etc.)
   - Use simple, clear Vietnamese that's easy to understand

3. **Usage (Cách sử dụng)**:
   - Provide 2-3 example sentences showing different contexts
   - Include common collocations and phrases
   - Note any grammar patterns or prepositions commonly used with the word
   - Highlight any common mistakes Vietnamese learners make

4. **Cultural Context (Văn hoá liên quan)**:
   - Include etymology (word origin) if interesting/memorable
   - Mention any cultural significance in English-speaking countries
   - Note any idioms or expressions that use this word
   - Include historical events or famous quotes if relevant
   - Explain any cultural nuances that might confuse Vietnamese learners

RESPONSE FORMAT:
You MUST respond in valid JSON format only. Do not include any text outside the JSON object.
{
  "word": "the exact word/phrase",
  "ipa": "IPA pronunciation",
  "meaning": "Vietnamese meaning with part of speech",
  "usage": "Usage examples and patterns",
  "culturalContext": "Cultural and historical context"
}`;

/**
 * Generate the user prompt for a specific word
 */
export function generateVocabularyUserPrompt(word: string): string {
  return `Please provide comprehensive information about the English word/phrase: "${word}"

Focus on:
1. Accurate IPA pronunciation (include both UK/US if different)
2. Clear Vietnamese meanings with parts of speech
3. Practical usage examples (2-3 sentences)
4. Interesting cultural context, etymology, or related expressions

Remember: Response must be valid JSON only.`;
}

/**
 * Parse AI response to VocabularyAIResponse
 * Handles various response formats and edge cases
 */
export function parseVocabularyResponse(response: string, originalWord: string): VocabularyAIResponse {
  try {
    // Try to extract JSON from the response
    let jsonStr = response.trim();

    // Handle markdown code blocks
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    // Try to find JSON object in the response
    const jsonObjectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      jsonStr = jsonObjectMatch[0];
    }

    const parsed = JSON.parse(jsonStr);

    return {
      word: parsed.word || originalWord,
      ipa: parsed.ipa || '',
      meaning: parsed.meaning || '',
      usage: parsed.usage || '',
      culturalContext: parsed.culturalContext || parsed.cultural_context || '',
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    // Return a default structure with the original word
    return {
      word: originalWord,
      ipa: '',
      meaning: 'Failed to generate meaning. Please try again.',
      usage: '',
      culturalContext: '',
    };
  }
}

/**
 * Validate vocabulary response quality
 */
export function validateVocabularyResponse(response: VocabularyAIResponse): boolean {
  return (
    response.word.length > 0 &&
    response.meaning.length > 10 &&
    response.usage.length > 10
  );
}
