import { findBestMatch, MatchCandidate } from './matcher';

async function test() {
    console.log('Loading embedding model... (This may take a moment on first run)');

    const targetTitle = "Apple iPhone 15 Pro 128GB Blue Titanium";

    const candidates: MatchCandidate[] = [
        { id: '1', title: "Samsung Galaxy S24 Ultra" },
        { id: '2', title: "Apple iPhone 14 Pro Max" },
        { id: '3', title: "iPhone 15 Pro 128GB Blue Titanium (Unlocked)" }, // Should be very close
        { id: '4', title: "Apple iPhone 15 Pro Case Blue" }, // Semantic difference (Case vs Phone)
        { id: '5', title: "Sony WH-1000XM5 Headphones" }
    ];

    console.log(`Target: "${targetTitle}"`);
    console.log('Candidates:', candidates.map(c => c.title));

    const result = await findBestMatch(targetTitle, candidates);

    console.log('\nBest Match Result:', result);

    if (result && result.candidateId === '3') {
        console.log('[PASS] Correctly matched ID 3');
        if (result.score > 0.9) {
            console.log('[PASS] High similarity score verified (> 0.9)');
        }
    } else {
        console.error('[FAIL] Incorrect match or low score');
    }
}

test().catch(console.error);
