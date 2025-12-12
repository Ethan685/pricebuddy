import Sentiment from 'sentiment';

const sentiment = new Sentiment();

export interface ReviewAnalysisResult {
    score: number; // Aggregate score
    averageScore: number;
    comparative: number;
    positiveKeywords: string[];
    negativeKeywords: string[];
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

export function analyzeReviews(texts: string[]): ReviewAnalysisResult {
    if (!texts || texts.length === 0) {
        return {
            score: 0,
            averageScore: 0,
            comparative: 0,
            positiveKeywords: [],
            negativeKeywords: [],
            sentiment: 'NEUTRAL'
        };
    }

    let totalScore = 0;
    let totalComparative = 0;
    const allPositive: Set<string> = new Set();
    const allNegative: Set<string> = new Set();

    texts.forEach(text => {
        const result = sentiment.analyze(text);
        totalScore += result.score;
        totalComparative += result.comparative;

        result.positive.forEach(w => allPositive.add(w));
        result.negative.forEach(w => allNegative.add(w));
    });

    const averageScore = totalScore / texts.length;

    let label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' = 'NEUTRAL';
    if (averageScore > 1) label = 'POSITIVE';
    else if (averageScore < -1) label = 'NEGATIVE';

    return {
        score: totalScore,
        averageScore,
        comparative: totalComparative / texts.length,
        positiveKeywords: Array.from(allPositive).slice(0, 10), // Top 10
        negativeKeywords: Array.from(allNegative).slice(0, 10),
        sentiment: label
    };
}
