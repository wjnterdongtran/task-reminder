/**
 * Vocabulary AI Prompt Engineering
 * Optimized prompts for generating comprehensive vocabulary content
 */

import { VocabularyAIResponse } from '@/types/vocabulary';

/**
 * System prompt for vocabulary generation
 * This prompt is carefully crafted to:
 * 1. Generate accurate IPA pronunciation (UK and US)
 * 2. Provide clear Vietnamese meanings with part of speech
 * 3. Show practical usage examples with collocations and grammar patterns
 * 4. Include relevant cultural/historical context with etymology
 */
export const VOCABULARY_SYSTEM_PROMPT = `You are an expert English language teacher and linguist specializing in teaching English to Vietnamese speakers.

Your task is to provide comprehensive, structured information about English words/phrases to help Vietnamese learners understand and remember them effectively.

IMPORTANT GUIDELINES:

1. **IPA Pronunciation**:
   - Provide BOTH British (UK) and American (US) pronunciations
   - Use standard IPA (International Phonetic Alphabet) notation
   - Format with slashes: /ˈbrɪtɪʃ/ and /əˈmerɪkən/

2. **Meaning**:
   - Specify the part of speech in Vietnamese (e.g., "Động từ", "Danh từ", "Tính từ", "Cụm động từ")
   - Provide clear, detailed Vietnamese translation explaining the meaning
   - Use simple, clear Vietnamese that's easy to understand

3. **Usage**:
   - Provide 2-3 example sentences showing different contexts
   - Use **bold** markdown to highlight the target word/phrase in examples
   - List common collocations (words that often appear together)
   - Include grammar patterns showing how to use the word
   - Describe common mistakes Vietnamese learners make with this word

4. **Cultural Context**:
   - Include etymology (word origin) in Vietnamese
   - Explain cultural significance in English-speaking countries
   - List related expressions with brief explanations
   - Add nuances specifically for Vietnamese learners

RESPONSE FORMAT:
You MUST respond in valid JSON format only. Do not include any text outside the JSON object.
Use this EXACT structure:

{
  "word": "the exact word/phrase",
  "ipa": {
    "uk": "/UK pronunciation/",
    "us": "/US pronunciation/"
  },
  "meaning": {
    "partOfSpeech": "Loại từ bằng tiếng Việt (ví dụ: Động từ, Danh từ, Tính từ)",
    "vietnamese": "Nghĩa tiếng Việt chi tiết, giải thích đầy đủ ý nghĩa và cách dùng"
  },
  "usage": {
    "examples": [
      "First example sentence with **word** highlighted",
      "Second example sentence with **word** highlighted",
      "Third example sentence with **word** highlighted"
    ],
    "collocations": [
      "collocation 1",
      "collocation 2",
      "collocation 3"
    ],
    "grammarPatterns": [
      "**pattern 1** (explanation)",
      "**pattern 2** (explanation)"
    ],
    "commonMistakes": "Description of common mistakes Vietnamese learners make with this word"
  },
  "culturalContext": {
    "etymology": "Nguồn gốc từ bằng tiếng Việt",
    "culturalSignificance": "Ý nghĩa văn hóa trong các nước nói tiếng Anh",
    "relatedExpressions": [
      "**expression 1:** explanation",
      "**expression 2:** explanation"
    ],
    "nuancesForVietnameseLearners": "Các sắc thái đặc biệt dành cho người học tiếng Việt"
  }
}`;

/**
 * Generate the user prompt for a specific word
 */
export function generateVocabularyUserPrompt(word: string): string {
  return `Please provide comprehensive, structured information about the English word/phrase: "${word}"

Generate a complete response with:
1. IPA pronunciation for BOTH UK and US
2. Part of speech and Vietnamese meaning
3. 2-3 example sentences with the word highlighted in **bold**
4. Common collocations and grammar patterns
5. Common mistakes Vietnamese learners make
6. Etymology, cultural significance, and related expressions

Remember: Response must be valid JSON only, following the exact structure specified.`;
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

    // Handle new structured format
    return {
      word: parsed.word || originalWord,
      ipa: typeof parsed.ipa === 'object'
        ? parsed.ipa
        : { uk: parsed.ipa || '', us: parsed.ipa || '' },
      meaning: typeof parsed.meaning === 'object'
        ? parsed.meaning
        : { partOfSpeech: '', vietnamese: parsed.meaning || '' },
      usage: typeof parsed.usage === 'object'
        ? {
            examples: parsed.usage.examples || [],
            collocations: parsed.usage.collocations || [],
            grammarPatterns: parsed.usage.grammarPatterns || [],
            commonMistakes: parsed.usage.commonMistakes || '',
          }
        : { examples: [], collocations: [], grammarPatterns: [], commonMistakes: parsed.usage || '' },
      culturalContext: typeof parsed.culturalContext === 'object' || typeof parsed.cultural_context === 'object'
        ? {
            etymology: (parsed.culturalContext || parsed.cultural_context)?.etymology || '',
            culturalSignificance: (parsed.culturalContext || parsed.cultural_context)?.culturalSignificance || '',
            relatedExpressions: (parsed.culturalContext || parsed.cultural_context)?.relatedExpressions || [],
            nuancesForVietnameseLearners: (parsed.culturalContext || parsed.cultural_context)?.nuancesForVietnameseLearners || '',
          }
        : {
            etymology: '',
            culturalSignificance: parsed.culturalContext || parsed.cultural_context || '',
            relatedExpressions: [],
            nuancesForVietnameseLearners: ''
          },
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    // Return a default structure with the original word
    return {
      word: originalWord,
      ipa: { uk: '', us: '' },
      meaning: { partOfSpeech: '', vietnamese: 'Failed to generate meaning. Please try again.' },
      usage: { examples: [], collocations: [], grammarPatterns: [], commonMistakes: '' },
      culturalContext: { etymology: '', culturalSignificance: '', relatedExpressions: [], nuancesForVietnameseLearners: '' },
    };
  }
}

/**
 * Convert structured AI response to flat strings for database storage
 */
export function flattenVocabularyResponse(response: VocabularyAIResponse): {
  word: string;
  ipa: string;
  meaning: string;
  usage: string;
  culturalContext: string;
} {
  return {
    word: response.word,
    ipa: JSON.stringify(response.ipa),
    meaning: JSON.stringify(response.meaning),
    usage: JSON.stringify(response.usage),
    culturalContext: JSON.stringify(response.culturalContext),
  };
}

/**
 * Validate vocabulary response quality
 */
export function validateVocabularyResponse(response: VocabularyAIResponse): boolean {
  const hasWord = response.word.length > 0;
  const hasMeaning = typeof response.meaning === 'object'
    ? response.meaning.vietnamese.length > 10
    : false;
  const hasUsage = typeof response.usage === 'object'
    ? response.usage.examples.length > 0
    : false;

  return hasWord && hasMeaning && hasUsage;
}
