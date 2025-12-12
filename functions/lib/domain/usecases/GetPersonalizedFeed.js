"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPersonalizedFeed = void 0;
class GetPersonalizedFeed {
    constructor(feedRepository) {
        this.feedRepository = feedRepository;
    }
    async execute(userPreferences, limit = 20) {
        var _a, _b;
        // 1. Fetch Candidates (from Repository)
        // In a real scenario, the Repository might support filtered queries.
        // For now, we fetch a pool and filter in memory as per v1.6 logic.
        const poolSize = 50;
        const candidates = await this.feedRepository.getRecentProducts(poolSize);
        if (!userPreferences) {
            // Guest: Random Shuffle
            const shuffled = candidates.map(p => (Object.assign(Object.assign({}, p), { score: Math.random() })))
                .sort((a, b) => (b.score || 0) - (a.score || 0));
            return {
                products: shuffled.slice(0, limit),
                personalized: false
            };
        }
        // 2. Personalize
        const prefBrand = (_a = userPreferences.brand) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        const prefCategory = (_b = userPreferences.category) === null || _b === void 0 ? void 0 : _b.toLowerCase();
        const scored = candidates.map(p => {
            let score = 0;
            // Brand Match
            if (prefBrand && p.brand && p.brand.toLowerCase() === prefBrand) {
                score += 40;
            }
            // Category Match
            if (prefCategory && p.category && p.category.toLowerCase() === prefCategory) {
                score += 30;
            }
            // Jitter
            score += Math.random() * 5;
            return Object.assign(Object.assign({}, p), { score });
        });
        // 3. Sort
        scored.sort((a, b) => (b.score || 0) - (a.score || 0));
        return {
            products: scored.slice(0, limit),
            personalized: true
        };
    }
}
exports.GetPersonalizedFeed = GetPersonalizedFeed;
//# sourceMappingURL=GetPersonalizedFeed.js.map