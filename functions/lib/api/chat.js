"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithAI = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const generative_ai_1 = require("@google/generative-ai");
const db = admin.firestore();
// 1. Initialize Gemini
// In production, use functions.config().gemini.key
// For MVP, checking ENV or falling back to Regex
const API_KEY = process.env.GEMINI_API_KEY || "YOUR_API_KEY";
const genAI = new generative_ai_1.GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
// 2. Helper to search products (Simulated Tool for AI)
async function searchProducts(query) {
    // Basic fuzzy search simulation or actual FS query
    // In real app, vector search is better
    const snap = await db.collection('products').get(); // Costly in prod, acceptable for MVP demo
    const allProducts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // Simple filter
    const keywords = query.toLowerCase().split(' ');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = allProducts.filter((p) => {
        const text = (p.title + ' ' + (p.category || '')).toLowerCase();
        return keywords.some(k => text.includes(k));
    });
    return results.slice(0, 3);
}
exports.chatWithAI = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }
    const { message, history } = data;
    // --- FALLBACK (If no API Key) ---
    if (API_KEY === "YOUR_API_KEY") {
        return fallbackRegexChat(message);
    }
    try {
        // --- REAL AI (Gemini) ---
        // 1. Construct Prompt with context
        const systemPrompt = `You are PriceBuddy AI, a smart shopping assistant. 
        Your goal is to help users find the best deals and answer shopping questions.
        Be concise, helpful, and friendly.
        If the user asks for products, output a JSON block at the end like:
        JSON_START:[{"query": "search term"}]JSON_END
        `;
        const chat = model.startChat({
            history: history?.map((h) => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.parts }]
            })) || [],
            generationConfig: {
                maxOutputTokens: 500,
            }
        });
        const result = await chat.sendMessage(systemPrompt + "\nUser says: " + message);
        const responseText = result.response.text();
        // 2. Tool Calling (Manual Parsing for MVP)
        // Check if AI wants to search
        const jsonMatch = responseText.match(/JSON_START:([\s\S]*?)JSON_END/);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let products = [];
        let finalResponse = responseText.replace(/JSON_START:([\s\S]*?)JSON_END/, '').trim();
        if (jsonMatch) {
            try {
                const command = JSON.parse(jsonMatch[1]);
                if (command[0]?.query) {
                    products = await searchProducts(command[0].query);
                    if (products.length > 0) {
                        finalResponse += `\n\nI found some top deals for you:`;
                    }
                    else {
                        finalResponse += `\n\nI looked for that, but couldn't find exact matches yet.`;
                    }
                }
            }
            catch (e) {
                console.error("Failed to parse tool command", e);
            }
        }
        return {
            response: finalResponse,
            products: products
        };
    }
    catch (error) {
        functions.logger.error("Gemini Error", error);
        return fallbackRegexChat(message); // Fallback if AI fails (quota, error)
    }
});
// --- Legacy Regex Logic (Kept as safety net) ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fallbackRegexChat(message) {
    const lower = message.toLowerCase();
    // Intent: Search
    if (lower.includes('search') || lower.includes('find') || lower.includes('recommend')) {
        const query = lower.replace(/search|find|recommend|for/g, '').trim();
        const products = await searchProducts(query);
        return {
            response: `I searched for "${query}". Here are the top results I found:`,
            products: products
        };
    }
    // Intent: Greeting
    if (lower.includes('hello') || lower.includes('hi')) {
        return {
            response: "Hello! I'm PriceBuddy AI. I can help you find products, check prices, or track deals. What are you looking for today?",
            products: []
        };
    }
    // Default
    return {
        response: "I'm still learning (running in Fallback Mode). Try asking 'Find me headphones' or 'Search for laptop'.",
        products: []
    };
}
