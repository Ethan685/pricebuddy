import * as functions from 'firebase-functions';

export interface MatchResult {
    source: 'Amazon' | 'Coupang' | 'Naver' | 'AliExpress';
    title: string;
    price: number;
    currency: string;
    url: string;
    similarityScore: number;
}

/**
 * Finds matching products across different platforms based on title similarity.
 * For MVP, this simulates finding matches by generating realistic variations.
 */
export const matchSKU = functions.https.onCall(async (data, context) => {
    const { title, currentPrice, currency } = data;

    if (!title) {
        throw new functions.https.HttpsError('invalid-argument', 'Product Title is required');
    }

    // ------------------------------------------
    // v2.0 REAL AI: Query Vector DB
    // ------------------------------------------

    // Import dynamically to avoid top-level async/deployment issues if configured wrong
    const { queryIndex } = await import('./vector');

    let matches = await queryIndex(title, 5);

    // If Vector DB is empty or down (returning empty), FALLBACK to v1.6 Mock Logic
    // This ensures smooth transition during dev
    if (!matches || matches.length === 0) {
        console.log("Vector DB returned no matches (or is down). Using v1.6 Mock Fallback.");
        matches = [];
        // [Existing Mock Logic...]
        matches.push({
            source: 'Amazon',
            title: `[US Import] ${title}`,
            price: Math.floor(currentPrice * (0.9 + Math.random() * 0.2)),
            currency: currency || 'KRW',
            url: 'https://amazon.com/dp/example',
            similarityScore: 0.95
        });
        matches.push({
            source: 'Coupang',
            title: `(Rocket) ${title} - Official Distributor`,
            price: Math.floor(currentPrice * (0.95 + Math.random() * 0.1)),
            currency: 'KRW',
            url: 'https://coupang.com/vp/products/example',
            similarityScore: 0.98
        });
        matches.push({
            source: 'Naver',
            title: `${title} / Lowest Price / Genuine`,
            price: Math.floor(currentPrice * 0.88),
            currency: 'KRW',
            url: 'https://smartstore.naver.com/example',
            similarityScore: 0.92
        });
        // Sort Mock
        matches.sort((a: any, b: any) => a.price - b.price);
    }

    // Safety for bestMatch logic
    const bestMatch = matches.length > 0 ? matches[0] : null;

    return {
        matches: matches,
        bestMatch: bestMatch
    };
});
