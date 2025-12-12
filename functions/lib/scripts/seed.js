"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin
// When running in emulator, FIRESTORE_EMULATOR_HOST env var handles connection
if (admin.apps.length === 0) {
    admin.initializeApp({
        projectId: "pricebuddy-5a869"
    });
}
const db = admin.firestore();
const SAMPLE_PRODUCTS = [
    {
        title: "Apple MacBook Pro 14 M3",
        brand: "Apple",
        category: "Electronics",
        images: ["https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/mbp14-spacegray-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697311054290"],
        description: "The new MacBook Pro with M3 chip. Blazing fast performance.",
        minPrice: 2390000,
        currency: "KRW"
    },
    {
        title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
        brand: "Sony",
        category: "Electronics",
        images: ["https://m.media-amazon.com/images/I/51SKmu2G9FL._AC_UF1000,1000_QL80_.jpg"],
        description: "Industry leading noise cancellation.",
        minPrice: 420000,
        currency: "KRW"
    },
    {
        title: "Nike Air Force 1 '07",
        brand: "Nike",
        category: "Fashion",
        images: ["https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-force-1-07-mens-shoes-jBrhBr.png"],
        description: "Classic style, legendary comfort.",
        minPrice: 139000,
        currency: "KRW"
    },
    {
        title: "Samsung Galaxy S24 Ultra",
        brand: "Samsung",
        category: "Electronics",
        images: ["https://images.samsung.com/is/image/samsung/p6pim/kr/sm-s928nztakoo/gallery/kr-galaxy-s24-s928-sm-s928nztakoo-539304724?$650_519_PNG$"],
        description: "Galaxy AI is here.",
        minPrice: 1698400,
        currency: "KRW"
    }
];
async function seed() {
    console.log("Clearing existing products...");
    const snapshot = await db.collection("products").get();
    const deleteBatch = db.batch();
    snapshot.docs.forEach((doc) => {
        deleteBatch.delete(doc.ref);
    });
    await deleteBatch.commit();
    console.log("Seeding products...");
    const batch = db.batch();
    for (const product of SAMPLE_PRODUCTS) {
        const ref = db.collection("products").doc();
        await batch.set(ref, Object.assign(Object.assign({}, product), { titleLower: product.title.toLowerCase(), id: ref.id, createdAt: admin.firestore.FieldValue.serverTimestamp() }));
        // Seed Offers (Expanded Merchants)
        const merchants = [
            { name: "Coupang", priceMultiplier: 0.98, currency: "KRW" },
            { name: "Amazon", priceMultiplier: 1.05, currency: "USD" },
            { name: "11st", priceMultiplier: 1.02, currency: "KRW" },
            { name: "eBay", priceMultiplier: 1.08, currency: "USD" },
            { name: "AliExpress", priceMultiplier: 0.85, currency: "USD" },
            { name: "Gmarket", priceMultiplier: 1.01, currency: "KRW" },
            { name: "Rakuten", priceMultiplier: 1.10, currency: "JPY" },
        ];
        // Randomly select 3-5 merchants per product to make it realistic
        const selectedMerchants = merchants.sort(() => 0.5 - Math.random()).slice(0, 3 + Math.floor(Math.random() * 3));
        for (const m of selectedMerchants) {
            const offerRef = ref.collection("offers").doc();
            // Simple currency conversion mock (1 USD = 1300 KRW, 1 JPY = 9 KRW)
            let finalPrice = product.minPrice;
            if (m.currency === "USD")
                finalPrice = Math.floor(product.minPrice / 1300 * m.priceMultiplier);
            else if (m.currency === "JPY")
                finalPrice = Math.floor(product.minPrice / 9 * m.priceMultiplier);
            else
                finalPrice = Math.floor(product.minPrice * m.priceMultiplier);
            await batch.set(offerRef, {
                id: offerRef.id,
                merchantName: m.name,
                merchant: m.name,
                totalPrice: finalPrice,
                url: `https://example.com/${m.name.toLowerCase()}/${ref.id}`,
                currency: m.currency
            });
        }
        // Seed Price History (30 Days)
        // creating a 'price_history' subcollection to power charts
        const historyRef = ref.collection("price_history");
        const today = new Date();
        const volatility = 0.05; // 5% fluctuation
        for (let i = 30; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            // Random daily price
            const randomFluct = 1 + (Math.random() * volatility * 2 - volatility);
            const dailyPrice = Math.floor(product.minPrice * randomFluct);
            const histDoc = historyRef.doc(dateStr);
            await batch.set(histDoc, {
                timestamp: admin.firestore.Timestamp.fromDate(date),
                date: dateStr,
                price: dailyPrice,
                currency: product.currency,
                lowestMerchant: selectedMerchants[0].name // Simplified
            });
        }
    }
    await batch.commit();
    console.log(`Successfully seeded ${SAMPLE_PRODUCTS.length} products.`);
}
seed().catch(console.error);
//# sourceMappingURL=seed.js.map