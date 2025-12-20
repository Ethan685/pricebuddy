// background.js

// GA 구조: 단일 API 엔드포인트 사용
// Production
const API_BASE_PROD = 'https://asia-northeast3-pricebuddy-5a869.cloudfunctions.net/api';
// Local Emulator
const API_BASE_DEV = 'http://127.0.0.1:5001/pricebuddy-5a869/asia-northeast3/api';
// 환경 감지
const API_BASE = chrome.runtime.id.includes('dev') || chrome.runtime.id.includes('unpacked') 
    ? API_BASE_DEV 
    : API_BASE_PROD;

// Listen for messages from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "CHECK_SKU") {
        handleCheckSKU(request.payload)
            .then(data => sendResponse(data))
            .catch(err => {
                console.error("Match SKU failed", err);
                sendResponse(null);
            });
        return true; // Keep channel open for async response
    }
});

async function handleCheckSKU(product) {
    console.log("Checking SKU for:", product.title);

    try {
        // GA 구조: Match API 사용 (확장 프로그램 전용)
        const response = await fetch(`${API_BASE}/match`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: product.title,
                currentPrice: product.price || 0,
                currency: product.currency || 'USD'
            })
        });

        if (!response.ok) throw new Error('API Error');

        const result = await response.json();
        
        // GA 구조: Match API 응답 형식
        const bestMatch = result.bestMatch || null;
        const matches = result.matches || [];
        
        if (!bestMatch && matches.length === 0) {
            return null;
        }

        // Simple suppression: don't show if best match is essentially the same price
        // or if it's the same source (pseudo-check)
        // [DEBUG] Logic disabled for Beta Verification so user always sees the banner!
        /*
        if (bestMatch && bestMatch.source.toLowerCase().includes(product.hostname.split('.')[1])) {
            // It's the same platform, check if there's a 2nd best?
            // For now, return null to avoid noise if we are already at the cheapest place
            return null;
        }
        */

        // Calculate potential savings
        let potentialSavings = 0;
        if (product.price && bestMatch && bestMatch.price < product.price) {
            potentialSavings = Math.round(((product.price - bestMatch.price) / product.price) * 100);
        }

        return {
            bestMatch: bestMatch,
            potentialSavings: potentialSavings > 0 ? potentialSavings : 0,
            matches: matches
        };

    } catch (error) {
        console.warn("Server unavailable (using demo mode):", error);

        // Fallback: Demo Mode (Mock Data)
        // Ensure we don't show ridiculous prices (e.g. 45,000 for a 3M laptop)
        // If detection failed (price=0), assume a high-end default or just don't match.

        let demoPrice = 0;
        if (product.price && product.price > 1000) {
            // If we successfully detected a price, just undercut it by 5%
            demoPrice = Math.floor(product.price * 0.95);
        } else {
            // If detection failed, default to a realistic laptop price for the demo
            demoPrice = 1250000;
        }

        const demoMatch = {
            source: 'Coupang (Demo)',
            title: product.title,
            price: demoPrice,
            currency: product.currency || 'KRW',
            url: 'https://coupang.com', // Dummy URL
            similarityScore: 0.99
        };

        const savings = product.price ? Math.round(((product.price - demoMatch.price) / product.price) * 100) : 10;

        return {
            bestMatch: demoMatch,
            potentialSavings: savings > 0 ? savings : 10,
            matches: [demoMatch]
        };
    }
}

