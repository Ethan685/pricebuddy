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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeReviews = void 0;
const functions = __importStar(require("firebase-functions"));
const openai_1 = __importDefault(require("openai"));
// Initialize OpenAI with fallback
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY || 'sk-dummy-key-for-dev',
});
// Fallback Logic for when AI fails or Key is missing
const KEYWORDS = {
    'bass': { topic: 'Sound Quality', sentiment: 'positive' },
    'treble': { topic: 'Sound Quality', sentiment: 'positive' },
    'sound': { topic: 'Sound Quality', sentiment: 'positive' },
    'audio': { topic: 'Sound Quality', sentiment: 'positive' },
    'muffled': { topic: 'Sound Quality', sentiment: 'negative' },
    'tinny': { topic: 'Sound Quality', sentiment: 'negative' },
    'static': { topic: 'Sound Quality', sentiment: 'negative' },
    'battery': { topic: 'Battery Life', sentiment: 'positive' },
    'charge': { topic: 'Battery Life', sentiment: 'positive' },
    'drain': { topic: 'Battery Life', sentiment: 'negative' },
    'short': { topic: 'Battery Life', sentiment: 'negative' },
    'comfortable': { topic: 'Comfort', sentiment: 'positive' },
    'fit': { topic: 'Comfort', sentiment: 'positive' },
    'pain': { topic: 'Comfort', sentiment: 'negative' },
    'tight': { topic: 'Comfort', sentiment: 'negative' },
    'cheap': { topic: 'Value', sentiment: 'positive' },
    'worth': { topic: 'Value', sentiment: 'positive' },
    'expensive': { topic: 'Value', sentiment: 'negative' },
    'overpriced': { topic: 'Value', sentiment: 'negative' }
};
function analyzeHeuristically(reviews) {
    const clusters = {};
    let spamCount = 0;
    for (const text of reviews) {
        const lower = text.toLowerCase();
        if (text.length < 5 || text.includes("http")) {
            spamCount++;
            continue;
        }
        for (const [key, meta] of Object.entries(KEYWORDS)) {
            if (lower.includes(key)) {
                const isNegated = lower.includes(`not ${key}`) || lower.includes(`no ${key}`);
                const sentiment = isNegated
                    ? (meta.sentiment === 'positive' ? 'negative' : 'positive')
                    : meta.sentiment;
                if (!clusters[meta.topic])
                    clusters[meta.topic] = { pos: 0, neg: 0, count: 0 };
                if (sentiment === 'positive')
                    clusters[meta.topic].pos++;
                else
                    clusters[meta.topic].neg++;
                clusters[meta.topic].count++;
            }
        }
    }
    const clusterArray = Object.entries(clusters).map(([topic, stats]) => {
        const total = stats.pos + stats.neg;
        const ratio = total > 0 ? stats.pos / total : 0;
        let sentiment = 'neutral';
        if (ratio > 0.6)
            sentiment = 'positive';
        else if (ratio < 0.4)
            sentiment = 'negative';
        return {
            topic,
            sentiment,
            score: parseFloat(ratio.toFixed(2)),
            count: stats.count
        };
    }).sort((a, b) => b.count - a.count).slice(0, 5);
    const topCluster = clusterArray[0];
    let summary = "Users have mixed feelings.";
    if (topCluster) {
        if (topCluster.sentiment === 'positive')
            summary = `Most users praise the ${topCluster.topic}.`;
        else if (topCluster.sentiment === 'negative')
            summary = `Significant complaints about ${topCluster.topic}.`;
        else
            summary = `Users discuss ${topCluster.topic} frequently.`;
    }
    return {
        mode: 'heuristic_fallback',
        overallScore: 4.2,
        summary,
        clusters: clusterArray,
        spamCount
    };
}
exports.analyzeReviews = functions.https.onCall(async (data, context) => {
    // 1. Auth Check (Optional for demo, enforced in Prod)
    // if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required");
    functions.logger.info("Analyzing reviews (Auth check skipped for demo)");
    const reviews = data.reviews || [];
    if (reviews.length === 0) {
        return { summary: "No reviews to analyze.", clusters: [], overallScore: 0 };
    }
    // 2. Check for Dummy Key -> Fallback immediately
    if (openai.apiKey === 'sk-dummy-key-for-dev') {
        functions.logger.warn("Using Heuristic Fallback (Mock Key)");
        return analyzeHeuristically(reviews);
    }
    try {
        // 3. Call OpenAI for Real Summary
        // We limit to 50 reviews to save tokens/cost
        const sample = reviews.slice(0, 50).join("\n- ");
        const systemPrompt = `You are a shopping assistant. Analyze these product reviews.
        Output JSON: { "overallScore": number(0-5), "summary": "1-sentence summary", "clusters": [{ "topic": string, "sentiment": "positive"|"negative"|"neutral", "count": number }] }
        Focus on top 3 topics (e.g. Battery, Sound, Comfort).`;
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Cost-effective model
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Reviews:\n${sample}` }
            ],
            response_format: { type: "json_object" },
            temperature: 0.5,
        });
        const content = completion.choices[0].message.content;
        if (!content)
            throw new Error("Empty AI response");
        const result = JSON.parse(content);
        return {
            mode: 'openai_real',
            ...result,
            reviewsAnalyzed: sample.length
        };
    }
    catch (error) {
        functions.logger.error("OpenAI Analysis Failed", error);
        // Fallback to rules if API fails (e.g. rate limit, network)
        return analyzeHeuristically(reviews);
    }
});
