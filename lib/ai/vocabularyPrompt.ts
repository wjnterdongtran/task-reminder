/**
 * Vocabulary AI Prompt Engineering
 * Optimized prompts for generating comprehensive vocabulary content
 */

import { VocabularyAIResponse } from "@/types/vocabulary";

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

CRITICAL: You MUST output ONLY a valid JSON object. No markdown, no code blocks, no explanations, no text before or after the JSON. Start your response with { and end with }.

CONTENT GUIDELINES:

1. **IPA Pronunciation**: Provide BOTH British (UK) and American (US) pronunciations using standard IPA notation with slashes: /ˈbrɪtɪʃ/

2. **Meaning**: Specify part of speech in Vietnamese (e.g., "Động từ", "Danh từ", "Tính từ") and provide clear Vietnamese translation

3. **Usage**: Include 2-3 example sentences with **bold** markdown highlighting the target word, common collocations, grammar patterns, and common mistakes

4. **Cultural Context**: Include etymology, cultural significance, related expressions, and nuances for Vietnamese learners

OUTPUT FORMAT - Return this EXACT JSON structure (no additional text):
{
  "word": "the exact word/phrase",
  "ipa": {
    "uk": "/UK pronunciation/",
    "us": "/US pronunciation/"
  },
  "meaning": {
    "partOfSpeech": "Loại từ bằng tiếng Việt",
    "vietnamese": "Nghĩa tiếng Việt chi tiết"
  },
  "usage": {
    "examples": ["Example 1 with **word**", "Example 2 with **word**", "Example 3 with **word**"],
    "collocations": ["collocation 1", "collocation 2", "collocation 3"],
    "grammarPatterns": ["**pattern 1** (explanation)", "**pattern 2** (explanation)"],
    "commonMistakes": "Description of common mistakes"
  },
  "culturalContext": {
    "etymology": "Nguồn gốc từ bằng tiếng Việt",
    "culturalSignificance": "Ý nghĩa văn hóa",
    "relatedExpressions": ["**expression 1:** explanation", "**expression 2:** explanation"],
    "nuancesForVietnameseLearners": "Các sắc thái đặc biệt cho người Việt"
  }
}`;

/**
 * Generate the user prompt for a specific word
 */
export function generateVocabularyUserPrompt(word: string): string {
    return `Generate vocabulary information for: "${word}"

IMPORTANT: Output ONLY the JSON object. No markdown code blocks, no explanations. Start with { and end with }.`;
}

/**
 * Parse AI response to VocabularyAIResponse
 * With JSON mode enabled on providers, response should be clean JSON
 */
export function parseVocabularyResponse(
    response: string,
    originalWord: string
): VocabularyAIResponse {
    try {
        // Trim and clean the response
        let jsonStr = response.trim();

        // Fallback: Handle markdown code blocks if provider still wraps in them
        const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            console.warn(
                "[parseVocabularyResponse] Response contained markdown code block - extracting JSON"
            );
            jsonStr = jsonMatch[1].trim();
        }

        // Fallback: Try to find JSON object if there's extra text
        if (!jsonStr.startsWith("{")) {
            const jsonObjectMatch = jsonStr.match(/\{[\s\S]*\}/);
            if (jsonObjectMatch) {
                console.warn(
                    "[parseVocabularyResponse] Response had prefix text - extracting JSON object"
                );
                jsonStr = jsonObjectMatch[0];
            }
        }

        // Additional safety: Remove any trailing text after the last }
        const lastBraceIndex = jsonStr.lastIndexOf("}");
        if (lastBraceIndex !== -1 && lastBraceIndex < jsonStr.length - 1) {
            console.warn(
                "[parseVocabularyResponse] Removing trailing text after JSON"
            );
            jsonStr = jsonStr.substring(0, lastBraceIndex + 1);
        }

        // Safety check: Ensure we have valid JSON structure
        if (!jsonStr.startsWith("{") || !jsonStr.endsWith("}")) {
            throw new Error(
                `Invalid JSON structure - must start with { and end with }. Got: ${jsonStr.substring(
                    0,
                    100
                )}...`
            );
        }

        // Parse the JSON
        const parsed = JSON.parse(jsonStr);

        // Validate required fields exist
        if (!parsed.word && !parsed.ipa && !parsed.meaning) {
            console.error(
                "[parseVocabularyResponse] Parsed JSON missing required fields:",
                Object.keys(parsed)
            );
            throw new Error(
                "Invalid response structure - missing required fields"
            );
        }

        // Build response with proper type handling
        const result: VocabularyAIResponse = {
            word: parsed.word || originalWord,
            ipa:
                typeof parsed.ipa === "object"
                    ? { uk: parsed.ipa.uk || "", us: parsed.ipa.us || "" }
                    : {
                          uk: String(parsed.ipa || ""),
                          us: String(parsed.ipa || ""),
                      },
            meaning:
                typeof parsed.meaning === "object"
                    ? {
                          partOfSpeech: parsed.meaning.partOfSpeech || "",
                          vietnamese: parsed.meaning.vietnamese || "",
                      }
                    : {
                          partOfSpeech: "",
                          vietnamese: String(parsed.meaning || ""),
                      },
            usage:
                typeof parsed.usage === "object"
                    ? {
                          examples: Array.isArray(parsed.usage.examples)
                              ? parsed.usage.examples
                              : [],
                          collocations: Array.isArray(parsed.usage.collocations)
                              ? parsed.usage.collocations
                              : [],
                          grammarPatterns: Array.isArray(
                              parsed.usage.grammarPatterns
                          )
                              ? parsed.usage.grammarPatterns
                              : [],
                          commonMistakes: String(
                              parsed.usage.commonMistakes || ""
                          ),
                      }
                    : {
                          examples: [],
                          collocations: [],
                          grammarPatterns: [],
                          commonMistakes: "",
                      },
            culturalContext: (() => {
                const ctx = parsed.culturalContext || parsed.cultural_context;
                if (typeof ctx === "object" && ctx !== null) {
                    return {
                        etymology: String(ctx.etymology || ""),
                        culturalSignificance: String(
                            ctx.culturalSignificance || ""
                        ),
                        relatedExpressions: Array.isArray(
                            ctx.relatedExpressions
                        )
                            ? ctx.relatedExpressions
                            : [],
                        nuancesForVietnameseLearners: String(
                            ctx.nuancesForVietnameseLearners || ""
                        ),
                    };
                }
                return {
                    etymology: "",
                    culturalSignificance: "",
                    relatedExpressions: [],
                    nuancesForVietnameseLearners: "",
                };
            })(),
        };

        return result;
    } catch (error) {
        // Log detailed error information for debugging
        console.error("[parseVocabularyResponse] Failed to parse AI response:");
        console.error(
            "[parseVocabularyResponse] Error:",
            error instanceof Error ? error.message : error
        );
        console.error(
            "[parseVocabularyResponse] Raw response (first 1000 chars):",
            response
        );
        console.error(
            "[parseVocabularyResponse] Response length:",
            response.length
        );

        // Log character codes around potential problem areas
        if (error instanceof SyntaxError) {
            console.error(
                "[parseVocabularyResponse] SyntaxError detected - checking for special characters"
            );
            // Find unterminated strings by looking for unescaped quotes
            const quotePositions = [];
            for (let i = 0; i < Math.min(response.length, 1000); i++) {
                if (
                    response[i] === '"' &&
                    (i === 0 || response[i - 1] !== "\\")
                ) {
                    quotePositions.push(i);
                }
            }
            console.error(
                "[parseVocabularyResponse] Found",
                quotePositions.length,
                "unescaped quotes in first 1000 chars"
            );
        }

        // Return a default structure with error message
        return {
            word: originalWord,
            ipa: { uk: "", us: "" },
            meaning: {
                partOfSpeech: "",
                vietnamese: "Failed to parse AI response. Please try again.",
            },
            usage: {
                examples: [],
                collocations: [],
                grammarPatterns: [],
                commonMistakes: "",
            },
            culturalContext: {
                etymology: "",
                culturalSignificance: "",
                relatedExpressions: [],
                nuancesForVietnameseLearners: "",
            },
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
export function validateVocabularyResponse(
    response: VocabularyAIResponse
): boolean {
    const hasWord = response.word.length > 0;
    const hasMeaning =
        typeof response.meaning === "object"
            ? response.meaning.vietnamese.length > 10
            : false;
    const hasUsage =
        typeof response.usage === "object"
            ? response.usage.examples.length > 0
            : false;

    return hasWord && hasMeaning && hasUsage;
}
