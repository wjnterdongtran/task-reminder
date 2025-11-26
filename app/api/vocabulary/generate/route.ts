/**
 * API Route: Generate Vocabulary Content using AI
 * POST /api/vocabulary/generate
 */

import { NextRequest, NextResponse } from "next/server";
import {
    VOCABULARY_SYSTEM_PROMPT,
    generateVocabularyUserPrompt,
    parseVocabularyResponse,
} from "@/lib/ai/vocabularyPrompt";

type AIProvider = "gemini" | "openai" | "anthropic";

interface GenerateRequest {
    word: string;
}

/**
 * Call Google Gemini API
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
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
                    },
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                    responseMimeType: "application/json",
                },
            }),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/**
 * Call OpenAI API
 */
async function callOpenAI(
    systemPrompt: string,
    userPrompt: string,
    apiKey: string,
    model: string
): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 2048,
            response_format: { type: "json_object" },
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
}

/**
 * Call Anthropic API
 */
async function callAnthropic(
    systemPrompt: string,
    userPrompt: string,
    apiKey: string,
    model: string
): Promise<string> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model,
            max_tokens: 2048,
            system: systemPrompt,
            messages: [{ role: "user", content: userPrompt }],
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Anthropic API error: ${error}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || "";
}

export async function POST(request: NextRequest) {
    try {
        const body: GenerateRequest = await request.json();
        const { word } = body;

        if (!word || word.trim().length === 0) {
            return NextResponse.json(
                { error: "Word is required" },
                { status: 400 }
            );
        }

        const provider = (process.env.AI_PROVIDER || "gemini") as AIProvider;
        const userPrompt = generateVocabularyUserPrompt(word.trim());

        let rawResponse: string;

        switch (provider) {
            case "gemini": {
                const apiKey = process.env.GEMINI_API_KEY;
                if (!apiKey) {
                    return NextResponse.json(
                        { error: "Gemini API key not configured" },
                        { status: 500 }
                    );
                }
                const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
                rawResponse = await callGemini(
                    VOCABULARY_SYSTEM_PROMPT,
                    userPrompt,
                    apiKey,
                    model
                );
                break;
            }
            case "openai": {
                const apiKey = process.env.OPENAI_API_KEY;
                if (!apiKey) {
                    return NextResponse.json(
                        { error: "OpenAI API key not configured" },
                        { status: 500 }
                    );
                }
                const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
                rawResponse = await callOpenAI(
                    VOCABULARY_SYSTEM_PROMPT,
                    userPrompt,
                    apiKey,
                    model
                );
                break;
            }
            case "anthropic": {
                const apiKey = process.env.ANTHROPIC_API_KEY;
                if (!apiKey) {
                    return NextResponse.json(
                        { error: "Anthropic API key not configured" },
                        { status: 500 }
                    );
                }
                const model =
                    process.env.ANTHROPIC_MODEL || "claude-3-haiku-20240307";
                rawResponse = await callAnthropic(
                    VOCABULARY_SYSTEM_PROMPT,
                    userPrompt,
                    apiKey,
                    model
                );
                break;
            }
            default:
                return NextResponse.json(
                    { error: `Unsupported AI provider: ${provider}` },
                    { status: 500 }
                );
        }

        console.log("rawResponse", rawResponse);

        const vocabularyData = parseVocabularyResponse(
            rawResponse,
            word.trim()
        );

        return NextResponse.json(vocabularyData);
    } catch (error) {
        console.error("Error generating vocabulary:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to generate vocabulary content",
            },
            { status: 500 }
        );
    }
}
