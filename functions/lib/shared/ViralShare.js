"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViralShare = void 0;
class ViralShare {
    /**
     * Generate a shareable link with referral code.
     * @param baseUrl The base URL of the web app (e.g., https://pricebuddy.com)
     * @param path The path to share (e.g., /product/123)
     * @param referralCode The user's referral code
     */
    static generateShareLink(baseUrl, path, referralCode) {
        const url = new URL(path, baseUrl);
        if (referralCode) {
            url.searchParams.set('ref', referralCode);
        }
        url.searchParams.set('utm_source', 'viral_share');
        return url.toString();
    }
    /**
     * Generate Open Graph tags for a product share.
     * (Useful if rendering server-side logic or generating meta for dynamic links)
     */
    static generateProductMeta(product) {
        return {
            title: `Check out ${product.title} on PriceBuddy!`,
            description: product.description || 'Compare prices and save big.',
            image: product.image || 'https://pricebuddy.com/og-default.png'
        };
    }
}
exports.ViralShare = ViralShare;
//# sourceMappingURL=ViralShare.js.map