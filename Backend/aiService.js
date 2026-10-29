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

// Contextual fallback description when external AI services are unreachable or no key configured
const getFallbackDescription = (title) => {
    const cleanTitle = (title || "Task").trim();
    return `Plan, execute, and verify all required steps for "${cleanTitle}". Review progress and ensure all objectives are completed on schedule.`;
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
    const prompt = `Write a concise, practical, 2-3 sentence task description for a task titled "${trimmedTitle}". Do not include quotes, markdown headers, or labels like "Description:".`;

    // 1. Prioritize Google Gemini API (Free tier) if GEMINI_API_KEY is set
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey.trim()) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey.trim()}`;
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { maxOutputTokens: 150, temperature: 0.7 }
                })
            });

            if (response.ok) {
                const data = await response.json();
                const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                if (generatedText) {
                    return {
                        description: generatedText,
                        provider: "Google Gemini",
                        fallback: false
                    };
                }
            } else {
                console.warn(`[AI Service] Gemini returned HTTP ${response.status}`);
            }
        } catch (geminiErr) {
            console.warn("[AI Service] Gemini API call error:", geminiErr.message);
        }
    }

    // 2. Try OpenAI API if OPENAI_API_KEY is set
    const openAiKey = process.env.OPENAI_API_KEY;
    if (openAiKey && openAiKey.trim()) {
        try {
            const client = new OpenAI({ apiKey: openAiKey.trim() });
            const completion = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 150,
                temperature: 0.7
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

    // 3. Graceful Degradation: Both APIs unavailable / unconfigured
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

