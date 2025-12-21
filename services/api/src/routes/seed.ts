import { Router } from "express";
import { firestore } from "../lib/firestore";
import { v4 as uuidv4 } from "uuid";

export const seedRouter = Router();

seedRouter.get("/", async (req, res) => {
    try {
        const batch = firestore.batch();

        // 1. Create Sample Products
        const products = [
            {
                id: "prod_iphone15",
                title: "Apple iPhone 15 Pro Max 256GB Natural Titanium",
                imageUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-natural-titanium-select-202309?wid=5120&hei=2880&fmt=p-jpg",
                minPriceKrw: 1750000,
                maxPriceKrw: 1900000,
                priceChangePct: -5.2,
                currency: "KRW",
                category: "electronics",
                lastUpdatedAt: new Date().toISOString()
            },
            {
                id: "prod_ps5",
                title: "Sony PlayStation 5 Console (Slim)",
                imageUrl: "https://gmedia.playstation.com/is/image/SIEPDC/ps5-slim-disc-console-image-block-01-en-16nov23?$1600px$",
                minPriceKrw: 620000,
                maxPriceKrw: 688000,
                priceChangePct: -12.5,
                currency: "KRW",
                category: "gaming",
                lastUpdatedAt: new Date().toISOString()
            },
            {
                id: "prod_airpods",
                title: "Apple AirPods Pro (2nd Generation) with MagSafe Case (USB-C)",
                imageUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MTJV3?wid=1144&hei=1144&fmt=jpeg",
                minPriceKrw: 299000,
                maxPriceKrw: 359000,
                priceChangePct: -8.1,
                currency: "KRW",
                category: "audio",
                lastUpdatedAt: new Date().toISOString()
            }
        ];

        products.forEach(prod => {
            const docRef = firestore.collection("products").doc(prod.id);
            batch.set(docRef, prod, { merge: true });
        });

        // 2. Create Sample Deals
        const deals = [
            {
                id: "deal_iphone15_coupang",
                productId: "prod_iphone15",
                title: "[Coupang] iPhone 15 Pro Max 256GB - Flash Sale",
                imageUrl: products[0].imageUrl,
                price: 1750000,
                originalPrice: 1900000,
                discountPercent: Math.round((1 - 1750000 / 1900000) * 100),
                currency: "KRW",
                marketplace: "Coupang",
                itemUrl: "https://www.coupang.com",
                isActive: true, // IMPORTANT
                validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 days
                category: "electronics",
                isFlashDeal: true,
                createdAt: new Date().toISOString()
            },
            {
                id: "deal_ps5_11st",
                productId: "prod_ps5",
                title: "[11st] PlayStation 5 Slim Disc Edition",
                imageUrl: products[1].imageUrl,
                price: 620000,
                originalPrice: 688000,
                discountPercent: Math.round((1 - 620000 / 688000) * 100),
                currency: "KRW",
                marketplace: "11st",
                itemUrl: "https://www.11st.co.kr",
                isActive: true,
                validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                category: "gaming",
                isFlashDeal: false,
                createdAt: new Date().toISOString()
            },
            {
                id: "deal_airpods_gmarket",
                productId: "prod_airpods",
                title: "[Gmarket] Apple AirPods Pro 2 USB-C",
                imageUrl: products[2].imageUrl,
                price: 299000,
                originalPrice: 359000,
                discountPercent: Math.round((1 - 299000 / 359000) * 100),
                currency: "KRW",
                marketplace: "Gmarket",
                itemUrl: "http://gmarket.co.kr",
                isActive: true,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                category: "audio",
                isFlashDeal: true,
                createdAt: new Date().toISOString()
            }
        ];

        deals.forEach(deal => {
            const docRef = firestore.collection("deals").doc(deal.id);
            batch.set(docRef, deal, { merge: true });
        });

        await batch.commit();

        res.json({
            ok: true,
            message: `Seeded ${products.length} products and ${deals.length} deals successfully.`,
            products,
            deals
        });

    } catch (error: any) {
        console.error("Seed error:", error);
        res.status(500).json({ error: error.message });
    }
});
