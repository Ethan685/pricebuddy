import express from "express";
import * as cheerio from "cheerio";

type Marketplace =
    | "naver"
    | "coupang"
    | "amazon"
    | "aliexpress"
    | "ebay"
    | "rakuten"
    | "mercari"
    | "yahoojp";

type ParsedOfferOutput = {
    title: string;
    price?: number;
    basePrice?: number;
    currency: string;
    imageUrl?: string;
    shippingFee?: number;
    weightKg?: number;
    externalId?: string;
    attributes: Record<string, string>;
};

async function fetchHtml(url: string) {
    const res = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
            "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
        },
        redirect: "follow",
    });
    if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
    return res.text();
}

function parseGeneric(html: string): ParsedOfferOutput {
    const $ = cheerio.load(html);
    const ogTitle = $('meta[property="og:title"]').attr("content")?.trim();
    const title = ogTitle || $("title").text().trim() || "item";
    const ogImage = $('meta[property="og:image"]').attr("content")?.trim();

    const text = $.text();
    const m = text.replace(/,/g, "").match(/(\d{2,9})\s*원/);
    const price = m ? Number(m[1]) : undefined;

    return {
        title,
        price,
        basePrice: price,
        currency: "KRW",
        imageUrl: ogImage,
        attributes: {},
    };
}

async function scrapeSingle(marketplace: Marketplace, url: string): Promise<ParsedOfferOutput> {
    const html = await fetchHtml(url);
    return parseGeneric(html);
}

import axios from "axios";

// SerpApi Base URL
const SERPAPI_BASE_URL = "https://serpapi.com/search";
const SERPAPI_KEY = process.env.SERPAPI_KEY;

async function searchSerpApi(query: string, region: string = "us") {
    if (!SERPAPI_KEY) {
        console.warn("SERPAPI_KEY is missing. Returning empty results.");
        return [];
    }

    try {
        const response = await axios.get(SERPAPI_BASE_URL, {
            params: {
                engine: "google_shopping",
                q: query,
                gl: region, // Country code (e.g., 'us', 'jp', 'uk')
                hl: "en", // Language (default to English for broad compatibility, or map dynamic)
                api_key: SERPAPI_KEY,
                num: 20
            }
        });

        if (response.data.error) {
            throw new Error(response.data.error);
        }

        const shoppingResults = response.data.shopping_results || [];

        return shoppingResults.map((item: any) => ({
            title: item.title,
            // Robust price extraction: extracted_price -> price parsing -> 0
            price: item.extracted_price || (item.price ? parseFloat(String(item.price).replace(/[^0-9.]/g, "")) : 0),
            currency: item.currency || "USD",
            // Robust image extraction
            imageUrl: item.thumbnail || item.image || (item.images && item.images[0]), // Fallback for various SerpApi layouts
            marketplace: item.source || "Google Shopping",
            itemUrl: item.link,
            externalId: item.product_id,
            token: item.immersive_product_page_token // Vital for fetching details later
        }));
    } catch (error: any) {
        console.error("SerpApi search error:", error.response?.data || error.message);
        return [];
    }
}

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/healthz", (_req, res) => res.status(200).send("ok"));

app.post("/scrape", async (req, res) => {
    try {
        const { marketplace, url } = req.body as { marketplace: Marketplace; url: string };
        if (!marketplace || !url) return res.status(400).json({ error: "missing marketplace/url" });
        const out = await scrapeSingle(marketplace, url);
        res.json(out);
    } catch (e: unknown) {
        res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
    }
});

app.post("/search", async (req, res) => {
    try {
        const { query, region } = req.body;
        if (!query) return res.status(400).json({ error: "missing query" });

        // Use SerpApi for real global search
        const results = await searchSerpApi(query, region);

        res.json(results);
    } catch (e: unknown) {
        res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
    }
});

app.post("/product", async (req, res) => {
    try {
        const { productId, pageToken } = req.body;

        if (!process.env.SERPAPI_KEY) throw new Error("SERPAPI_KEY missing");
        const SERPAPI_KEY = process.env.SERPAPI_KEY;

        // Strategy: 
        // 1. If pageToken is provided (preferred), use google_immersive_product directly.
        // 2. If only productId is provided, try the Search-based lookup (fallback).

        if (!productId && !pageToken) return res.status(400).json({ error: "missing productId or pageToken" });

        if (pageToken) {
            const response = await axios.get(SERPAPI_BASE_URL, {
                params: {
                    engine: "google_immersive_product",
                    page_token: pageToken,
                    gl: "us",
                    hl: "en",
                    api_key: SERPAPI_KEY
                }
            });

            if (response.data.error) throw new Error(response.data.error);

            const product = response.data.product_results || {};
            // Normalize
            const result = {
                title: product.title || product.name || "Product Details",
                description: product.description,
                // Try multiple sources for image (including string array case)
                imageUrl: product.media?.[0]?.link
                    || (typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.link)
                    || product.thumbnail
                    || "https://via.placeholder.com/400x400?text=No+Image",
                rating: product.rating,
                reviews: product.reviews,
                specs: product.specs,
                offers: (response.data.sellers_results?.online_sellers || []).map((s: any) => ({
                    // Prefer pre-extracted price, fall back to parsing string
                    price: s.extracted_price || (s.total_price ? parseFloat(s.total_price.replace(/[^0-9.]/g, "")) : 0) || (s.base_price ? parseFloat(s.base_price.replace(/[^0-9.]/g, "")) : 0),
                    currency: "USD", // SerpApi typically returns in USD for gl=us, or we should map it
                    merchant: s.name,
                    url: s.link
                }))
            };
            return res.json(result);
        }

        // Fallback: 2-Step Lookup Strategy (ID Search)
        // ... existing logic ...
        const searchResponse = await axios.get(SERPAPI_BASE_URL, {
            params: {
                engine: "google_shopping",
                q: productId, // Search for the ID
                gl: "us",
                hl: "en",
                api_key: SERPAPI_KEY
            }
        });

        if (searchResponse.data.error) throw new Error(searchResponse.data.error);

        const searchResults = searchResponse.data.shopping_results || [];
        // Find the matching product strictly
        const matchedItem = searchResults.find((item: any) => item.product_id === productId);

        if (!matchedItem) {
            console.log(`Product ID ${productId} not found in search results. Results count: ${searchResults.length}`);
            throw new Error(`Product not found (ID mismatch). Please try a standard search.`);
        }

        // Check if we need step 2 (Immersive lookup) or if we already have offers
        // If matchedItem has `immersive_product_page_token`, use it.
        // Otherwise, maybe we just return the search result info (fallback)

        // Note: For now, if we can't find a token, we return the basic info from search result
        // But for full details (offers), we ideally want the immersive view.

        // Extract token (it might be in different fields depending on API version)
        // Usually `immersive_product_page_token` or we might check if this item IS the product.

        let offers: any[] = [];
        let specs = {};

        // If we have a token, fetch deep details
        // Note: The field name for token can vary, checking standard ones
        const tokenFromSearch = matchedItem.immersive_product_page_token;

        if (tokenFromSearch) {
            const detailResponse = await axios.get(SERPAPI_BASE_URL, {
                params: {
                    engine: "google_immersive_product",
                    page_token: tokenFromSearch,
                    gl: "us",
                    hl: "en",
                    api_key: SERPAPI_KEY
                }
            });

            if (!detailResponse.data.error) {
                const detailProduct = detailResponse.data.product_results || {};
                const sellers = detailResponse.data.sellers_results?.online_sellers || [];

                // Merge details
                specs = detailProduct.specs || {};
                offers = sellers.map((s: any) => ({
                    price: s.total_price ? parseFloat(s.total_price.replace(/[^0-9.]/g, "")) : 0,
                    currency: "USD",
                    merchant: s.name,
                    url: s.link
                }));
            }
        } else {
            // Fallback: If no token (maybe it's a simple listing), try to use what we have
            // Or look for `sellers` in the search response logic if available
            if (matchedItem.price) {
                offers = [{
                    price: matchedItem.extracted_price || 0,
                    currency: "USD",
                    merchant: matchedItem.source || "Google Shopping",
                    url: matchedItem.link
                }];
            }
        }

        // Normalize to standard format
        const result = {
            title: matchedItem.title,
            description: matchedItem.snippet || matchedItem.description,
            imageUrl: matchedItem.thumbnail,
            rating: matchedItem.rating,
            reviews: matchedItem.reviews,
            specs: specs,
            offers: offers
        };

        res.json(result);
    } catch (e: any) {
        // Extract detailed error from Axios response if available
        const errorDetail = e.response?.data?.error || e.message || String(e);
        console.error("SerpApi product fetch error:", errorDetail);
        res.status(500).json({ error: `SerpApi Error: ${errorDetail}` });
    }
});

const port = Number(process.env.PORT ?? 8080);
app.listen(port, () => console.log(`scraper listening on ${port}`));
