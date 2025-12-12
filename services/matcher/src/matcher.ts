import { getEmbedding } from './embedding';

export interface MatchCandidate {
    id: string;
    title: string;
    brand?: string;
}

export interface MatchResult {
    candidateId: string;
    score: number; // 0 to 1
    reason?: string;
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    // Assumes vectors are normalized, so magnitudes are 1.
    // If embedding() logic guarantees normalization, we can skip magnitude calc.
    // getEmbedding uses normalize: true.
    return dotProduct;
}

export async function findBestMatch(targetTitle: string, candidates: MatchCandidate[]): Promise<MatchResult | null> {
    const targetVector = await getEmbedding(targetTitle);

    let bestMatch: MatchResult | null = null;
    let maxScore = -1;

    for (const candidate of candidates) {
        const candidateVector = await getEmbedding(candidate.title);
        let score = cosineSimilarity(targetVector, candidateVector);

        // Simple Heuristics Boosting
        // 1. Exact brand match (if provided) might already be captured by embedding, but explicit rule helps.
        // We skip implementing explicit logic for now to keep it embedding-focused, 
        // as embedding handles semantic similarity very well.

        // Console logging for debug visibility
        // console.log(`Comparing "${targetTitle}" vs "${candidate.title}": ${score}`);

        if (score > maxScore) {
            maxScore = score;
            bestMatch = { candidateId: candidate.id, score: maxScore };
        }
    }

    return bestMatch;
}
