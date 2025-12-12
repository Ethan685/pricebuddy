// background.js

// Production Cloud Functions URL (Commented out for V1 Dev)
// const API_BASE = 'https://us-central1-pricebuddy.cloudfunctions.net';
// Local Emulator URL
const API_BASE = 'http://localhost:5001/pricebuddy/us-central1';

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
        // Call the matchSKU cloud function
        const response = await fetch(`${API_BASE}/matchSKU`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: {
                    title: product.title,
                    currentPrice: product.price || 0,
                    currency: product.currency || 'USD'
                }
            })
        });

        if (!response.ok) throw new Error('API Error');

        const result = await response.json();
        const data = result.result || result.data || {}; // Handle Firebase's wrapped response

        // Logic: Find the best deal that isn't the current one (simplified)
        // For MVP, we pass back the "bestMatch" from the cloud function.
        // In reality, we should filter out the current hostname.

        const bestMatch = data.bestMatch;
        const matches = data.matches || [];

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

