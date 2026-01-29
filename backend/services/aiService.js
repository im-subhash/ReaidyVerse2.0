const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

// Initialize OpenAI
// Initialize Groq
const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});

// Fallback keywords for "Hybrid Mode"
// Includes Hate Speech, Spam, and Sensitive Content/Violence
const BANNED_KEYWORDS = [
    // Existing/Base
    // 'hate', 'kill', 'fuck', 'stupid', 'idiot', 'die', 'hack', 'sex', 'xxx',
    // // Hate Speech / Discrimination
    // 'go back to your country', 'you people never learn', 'those people ruin everything',
    // 'dirty people', 'backward mindset', 'low-class mentality', 'illegal people', 'inferior culture',
    // // Spam / Scam
    // 'click here', 'buy now', 'limited offer', '100% free', 'guaranteed income',
    // 'earn money fast', 'work from home', 'no risk', 'instant loan', 'free gift',
    // 'subscribe now', 'dm for details', 'join telegram', 'whatsapp me', 'offer expires today',
    // // Sensitive / Violence / Self-Harm
    // 'depressed', 'anxiety attack', 'suicidal thoughts', 'mentally unstable', 'panic attack',
    // 'kill yourself', 'beat him', 'attack them', 'shooting', 'bomb blast', 'murder',
    // // Adult / Drugs
    // 'adult content', 'nude pics', 'sexvideo', 'hookup', 'drugs', 'weed', 'ganja', 'cocaine',
    // 'overdose', 'drunk driving'
];

const moderateText = async (text) => {
    try {
        // 1. Keyword Check (Fast, Free, & Works if OpenAI is out of credits)
        const lowerText = text.toLowerCase();

        // Simple word match check matches strictly
        const foundKeyword = BANNED_KEYWORDS.find(word => lowerText.includes(word));

        if (foundKeyword) {
            console.log(`[Offline Filter] Keyword detected: ${foundKeyword}`);
            return {
                flagged: true,
                categories: ['keyword_match'],
                reason: `Contains banned word: "${foundKeyword}"`
            };
        }

        // 2. Groq Custom Chat Moderation
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('paste_your_groq_key')) {
            console.warn("Groq API Key missing or invalid. AI Moderation skipped.");
            return { flagged: false, categories: [], reason: null };
        }

        const completion = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile", // Updated supported model
            messages: [
                {
                    role: "system",
                    content: `You are a strict content moderator for a social media app. 
                    Analyze the user's comment for:
                    1. Hate Speech (racism, sexism, slurs)
                    2. Spam (irrelevant, repetitive, promotional)
                    3. Sexual content (explicit or suggestive like "sex", "bed", "fuck")
                    4. Harassment (bullying, threats, "I hate you")
                    5. Violence
                    
                    If ANY of these are detected, flag it.
                    Return ONLY a JSON object: { "flagged": boolean, "categories": string[], "reason": string }.`
                },
                {
                    role: "user",
                    content: text
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0,
        });

        const aiResponse = JSON.parse(completion.choices[0].message.content);
        console.log("AI Analysis:", aiResponse);

        if (aiResponse.flagged) {
            return {
                flagged: true,
                categories: aiResponse.categories || ['violation'],
                reason: aiResponse.reason || 'Flagged by AI'
            };
        }

        return { flagged: false, categories: [], reason: null };

    } catch (error) {
        // Log error but failing safely (letting it pass if keyword check didn't catch it)
        // or we could block it. For demo, we rely on keyword check being enough.
        console.error("Moderation API Error:", error.message);
        return { flagged: false, categories: [], reason: null };
    }
};



const moderateImage = async (imageUrl) => {
    try {
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('paste_your_groq_key')) {
            console.warn("Groq API Key missing. Image Moderation skipped.");
            return { flagged: false, categories: [], reason: null };
        }

        const completion = await openai.chat.completions.create({
            model: "llama-3.2-90b-vision-preview", // Updated to supported Groq Vision Model
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "You are a highly strict content moderator. Analyze this image for: 1. Nudity/Pornography (including partial, suggestive, or screenshots of porn sites). 2. Violence/Gore. 3. Hate Symbols. 4. Visual text containing 'porn', 'xxx', or sexual slurs. If ANY trace is found, set flagged to true. Return ONLY JSON: { \"flagged\": boolean, \"reason\": string }." },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageUrl,
                            },
                        },
                    ],
                },
            ],
            response_format: { type: "json_object" },
            temperature: 0,
        });

        const aiResponse = JSON.parse(completion.choices[0].message.content);
        console.log("AI Image Analysis:", aiResponse);

        if (aiResponse.flagged) {
            return {
                flagged: true,
                categories: ['image_violation'],
                reason: aiResponse.reason || 'Flagged by AI Vision'
            };
        }

        return { flagged: false, categories: [], reason: null };

    } catch (error) {
        console.error("Image Moderation Error:", error.message);
        // Fail open (allow) if AI fails, to not block users during outages
        return { flagged: false, categories: [], reason: null };
    }
};

module.exports = { moderateText, moderateImage };
