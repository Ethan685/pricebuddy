import { Marketplace } from "@pricebuddy/core";

export async function generateAffiliateLink(
    marketplace: string | Marketplace,
    originalUrl: string,
    userId?: string
): Promise<string> {
    // 1. Mock Logic for Testing / Development
    // If the user ID starts with 'TEST', we just append a query param
    if (userId && userId.startsWith("TEST")) {
        const url = new URL(originalUrl);
        url.searchParams.set("affiliate_id", "TEST_AFFILIATE");
        url.searchParams.set("sub_id", userId);
        return url.toString();
    }

    // 2. Real Logic (Placeholder for now)
    // In a real scenario, we would use API keys from process.env to call
    // Coupang Partners API, Amazon Associates, etc.

    try {
        const url = new URL(originalUrl);

        switch (marketplace) {
            case "coupang":
                // Coupang Partners logic would go here
                // For now, simple deep link format example
                // https://link.coupang.com/re/AFFILIATE?lptag=...
                return originalUrl + "&trace=" + (userId || "anonymous");

            case "naver":
                return originalUrl + "&cr=pricebuddy";

            case "amazon_us":
            case "amazon_jp":
                // Amazon Associate Tag
                const tag = process.env.AMAZON_TAG || "pricebuddy-20";
                url.searchParams.set("tag", tag);
                return url.toString();

            default:
                // Default behavior: just append a query param to track it internally if possible
                // or return original if we can't monetize
                if (userId) {
                    if (url.search) {
                        return originalUrl + `&ref_id=${userId}`;
                    } else {
                        return originalUrl + `?ref_id=${userId}`;
                    }
                }
                return originalUrl;
        }
    } catch (error) {
        console.error("Error generating affiliate link:", error);
        return originalUrl;
    }
}
