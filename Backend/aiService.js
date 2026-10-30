const OpenAI = require("openai");

// In-memory per-client rate limit tracker (max 1 AI request per 5 seconds per client)
const rateLimitMap = new Map();

const isRateLimited = (clientId) => {
    const now = Date.now();
    const lastRequest = rateLimitMap.get(clientId);
    const COOLDOWN_MS = 5000; // 5-second cooldown

    if (lastRequest && (now - lastRequest) < COOLDOWN_MS) {
        return true;
    }
    rateLimitMap.set(clientId, now);
    return false;
};

// Contextual fallback description when external AI services are unreachable or unconfigured
const getFallbackDescription = (title) => {
    const cleanTitle = (title || "Task").trim();
    return `Define the scope and requirements for "${cleanTitle}". Break down into actionable milestones, execute implementation steps, and verify quality standards before completion.`;
};

/**
 * Generates an automated task description using Gemini or OpenAI, with graceful degradation.
 * @param {string} title - Task title provided by the user
 * @param {string} clientId - User ID or IP for rate limiting
 * @returns {Promise<{description: string, fallback: boolean, provider?: string, message?: string, rateLimited?: boolean}>}
 */
async function generateTaskDescription(title, clientId = "default") {
    if (!title || !title.trim()) {
        throw new Error("Task title is required to generate description");
    }

    // Supplementary feature: Rate limiting
    if (isRateLimited(clientId)) {
        return {
            description: "",
            fallback: true,
            rateLimited: true,
            message: "Rate limit reached. Please wait a few seconds before requesting AI suggestions again."
        };
    }

    const trimmedTitle = title.trim();
    const prompt = `You are an expert project manager and productivity assistant.
Create an actionable, practical task description for a task titled: "${trimmedTitle}".

Guidelines:
- Outline 2-3 clear, actionable steps or concrete deliverables to successfully complete this task.
- Be direct, professional, and practical.
- Do NOT use conversational filler (e.g. "Sure, here is..."), markdown headers, or quotation marks.`;

    // 1. Try Google Gemini API if GEMINI_API_KEY is configured
    // Prioritize low-latency models (gemini-3.1-flash-lite, gemini-3.5-flash) for ~1.5s responses
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey.trim()) {
        const models = [
            "gemini-3.1-flash-lite",
            "gemini-3.5-flash",
            "gemini-3.8-flash",
            "gemini-flash-latest"
        ];
        for (const model of models) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey.trim()}`;
                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    signal: AbortSignal.timeout(15000), // 15-second safety timeout
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            maxOutputTokens: 150,
                            temperature: 0.3,
                            thinkingConfig: {
                                thinkingBudget: 0
                            }
                        }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                    if (generatedText) {
                        return {
                            description: generatedText,
                            provider: `Google Gemini (${model})`,
                            fallback: false
                        };
                    }
                } else {
                    const errData = await response.json().catch(() => ({}));
                    console.warn(`[AI Service] Gemini (${model}) returned HTTP ${response.status}:`, errData?.error?.message || response.statusText);
                    if (response.status === 401) {
                        break;
                    }
                }
            } catch (geminiErr) {
                console.warn(`[AI Service] Gemini (${model}) network error:`, geminiErr.message);
            }
        }
    }

    // 2. Try OpenAI API if OPENAI_API_KEY is configured
    const openAiKey = process.env.OPENAI_API_KEY;
    if (openAiKey && openAiKey.trim()) {
        try {
            const client = new OpenAI({ apiKey: openAiKey.trim(), timeout: 15000 });
            const completion = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 150,
                temperature: 0.3
            });

            const generatedText = completion?.choices?.[0]?.message?.content?.trim();
            if (generatedText) {
                return {
                    description: generatedText,
                    provider: "OpenAI",
                    fallback: false
                };
            }
        } catch (openaiErr) {
            console.warn("[AI Service] OpenAI API call error:", openaiErr.message);
        }
    }

    // 3. Graceful Degradation: When external APIs fail or are unconfigured
    console.warn("[AI Service] External AI APIs unavailable. Using graceful degradation fallback.");
    return {
        description: getFallbackDescription(trimmedTitle),
        fallback: true,
        message: "External AI service unavailable. A contextual suggestion has been provided as fallback."
    };
}

module.exports = {
    generateTaskDescription,
    getFallbackDescription,
    isRateLimited
};
