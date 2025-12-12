import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';

// We can import the "Clients" or Engines directly to simulate E2E flow
// Or we can use `fetch` against the running server.
// Since we are in the monorepo, let's use the actual Engine functions directly 
// to verify the logic pipeline without relying on the network (Unit/Integration Test Style)
// OR better yet, we can spin up the express app and hit it.

import express from 'express';
import { scrapeOffer } from '@pricebuddy/scraper';
import { computePrice } from '@pricebuddy/pricing';
import { findBestMatch } from '@pricebuddy/matcher';
import { predictPrice } from '@pricebuddy/forecast';
import { analyzeReviews } from '@pricebuddy/review';
import { promoBandit } from '@pricebuddy/promo';

console.log("Starting E2E Verification...");

async function runE2E() {
    try {
        console.log("\n[1] Scraper & Pricing Verification");
        // Mock Scrape
        const mockOffer = {
            title: "Sony WH-1000XM5 Noise Canceling Headphones",
            price: 34800, // JPY
            currency: "JPY",
            imageUrl: "http://example.com/img.jpg",
            attributes: {}
        };
        console.log("Mock Scrape Result:", mockOffer);

        const pricing = computePrice({
            marketplace: 'amazon',
            country: 'KR',
            basePrice: mockOffer.price,
            currency: mockOffer.currency,
            weightKg: 1
        });
        console.log("Pricing Result:", pricing);
        assert(pricing.totalPriceKrw > 300000, "Price should proceed reasonable conversion");

        console.log("\n[2] Matcher Verification");
        const match = await findBestMatch("Sony XM5 Headphones", [
            { id: "1", title: "Sony WH-1000XM5 Wireless" },
            { id: "2", title: "Bose QC45" }
        ]);
        console.log("Match Result:", match);
        assert(match && match.candidateId === "1", "Should match Sony XM5");
        assert(match && match.score > 0.5, "Score should be high");

        console.log("\n[3] Forecast Verification");
        const history = [
            { offerId: "1", ts: "2023-01-01", price: 100, totalPriceKrw: 350000 },
            { offerId: "1", ts: "2023-01-02", price: 100, totalPriceKrw: 360000 },
            { offerId: "1", ts: "2023-01-03", price: 100, totalPriceKrw: 370000 } // Trend UP
        ];
        const forecast = predictPrice({ history });
        console.log("Forecast Result:", forecast);
        assert(forecast.trend === "UP", "Trend should be UP");

        console.log("\n[4] Review Verification");
        const reviews = [
            "This headphone is absolutely amazing!",
            "Battery life is terrible though."
        ];
        const reviewAnalysis = analyzeReviews(reviews);
        console.log("Review Analysis:", reviewAnalysis);
        assert(reviewAnalysis.positiveKeywords.includes("amazing"), "Should detect positive keyword");
        assert(reviewAnalysis.negativeKeywords.includes("terrible"), "Should detect negative keyword");

        console.log("\n[5] Promo Verification");
        const decision = promoBandit.selectVariant();
        console.log("Promo Decision:", decision);
        assert(decision.id !== undefined, "Should return a variant ID");

        // Simulate feedback
        promoBandit.updateReward(decision.id, true);
        const stats = promoBandit.getStats();
        console.log("Promo Stats:", stats);
        assert(stats.find(s => s.id === decision.id)!.alpha > 1, "Alpha should increase after success");

        console.log("\n✅ [SUCCESS] All E2E checks passed!");

    } catch (e: any) {
        console.error("\n❌ [FAILED] E2E Test Failed:", e.message);
        process.exit(1);
    }
}

runE2E();
