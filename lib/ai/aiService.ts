/**
 * AI Service with Provider Abstraction
 * Supports: Google Gemini, OpenAI, Anthropic
 * Can be easily switched between providers via environment variable
 */

import { VocabularyAIResponse } from '@/types/vocabulary';
import {
  VOCABULARY_SYSTEM_PROMPT,
  generateVocabularyUserPrompt,
  parseVocabularyResponse,
} from './vocabularyPrompt';

export type AIProvider = 'gemini' | 'openai' | 'anthropic';

interface AIServiceConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

/**
 * Get the current AI provider configuration
 */
export function getAIConfig(): AIServiceConfig {
  const provider = (process.env.NEXT_PUBLIC_AI_PROVIDER || 'gemini') as AIProvider;

  const configs: Record<AIProvider, AIServiceConfig> = {
    gemini: {
      provider: 'gemini',
      apiKey: process.env.GEMINI_API_KEY || '',
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    },
    openai: {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    },
    anthropic: {
      provider: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
    },
  };

  return configs[provider];
}

/**
 * Call Google Gemini API with JSON mode enabled
 */
async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  model: string
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\n${userPrompt}` }
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          // Force JSON output format
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/**
 * Call OpenAI API with JSON mode enabled
 */
async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  model: string
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
      // Force JSON output format
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Call Anthropic API with JSON prefill to force JSON output
 */
async function callAnthropic(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  model: string
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt },
        // Prefill technique: start assistant response with { to force JSON output
        { role: 'assistant', content: '{' },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  // Prepend the { that was used as prefill since the response continues from there
  return '{' + text;
}

/**
 * Generate vocabulary content using configured AI provider
 */
export async function generateVocabularyContent(
  word: string,
  config?: AIServiceConfig
): Promise<VocabularyAIResponse> {
  const aiConfig = config || getAIConfig();
  const userPrompt = generateVocabularyUserPrompt(word);

  let rawResponse: string;

  switch (aiConfig.provider) {
    case 'gemini':
      rawResponse = await callGemini(
        VOCABULARY_SYSTEM_PROMPT,
        userPrompt,
        aiConfig.apiKey,
        aiConfig.model || 'gemini-1.5-flash'
      );
      break;
    case 'openai':
      rawResponse = await callOpenAI(
        VOCABULARY_SYSTEM_PROMPT,
        userPrompt,
        aiConfig.apiKey,
        aiConfig.model || 'gpt-4o-mini'
      );
      break;
    case 'anthropic':
      rawResponse = await callAnthropic(
        VOCABULARY_SYSTEM_PROMPT,
        userPrompt,
        aiConfig.apiKey,
        aiConfig.model || 'claude-3-haiku-20240307'
      );
      break;
    default:
      throw new Error(`Unsupported AI provider: ${aiConfig.provider}`);
  }

  return parseVocabularyResponse(rawResponse, word);
}
