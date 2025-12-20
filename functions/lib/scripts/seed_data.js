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
// Initialize Admin SDK
// Note: This script assumes GOOGLE_APPLICATION_CREDENTIALS is set or running in an environment with access
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
const seedData = async () => {
    console.log("Seeding data...");
    const products = [
        {
            id: "sony-xm5",
            title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
            brand: "Sony",
            category: "Electronics",
            images: ["https://m.media-amazon.com/images/I/51SKmu2G9FL._AC_SL1000_.jpg"],
            minPrice: 398000,
            currency: "KRW",
            offers: [
                {
                    merchant: "Amazon",
                    price: 298.00,
                    currency: "USD",
                    shipping: 15.00,
                    url: "https://amazon.com/dp/B09XS7JWHH",
                    inStock: true
                },
                {
                    merchant: "Coupang",
                    price: 398000,
                    currency: "KRW",
                    shipping: 0,
                    url: "https://coupang.com/vp/products/12345",
                    inStock: true
                }
            ]
        },
        {
            id: "airpods-pro-2",
            title: "Apple AirPods Pro (2nd Generation)",
            brand: "Apple",
            category: "Electronics",
            images: ["https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/MQD83?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1660803972361"],
            minPrice: 299000,
            currency: "KRW",
            offers: [
                {
                    merchant: "Coupang",
                    price: 299000,
                    currency: "KRW",
                    shipping: 0,
                    url: "https://coupang.com/vp/products/67890",
                    inStock: true
                },
                {
                    merchant: "Naver",
                    price: 295000,
                    currency: "KRW",
                    shipping: 3000,
                    url: "https://smartstore.naver.com/apple/products/...",
                    inStock: true
                }
            ]
        },
        {
            id: "macbook-air-m3",
            title: "Apple MacBook Air 13 M3 Chip",
            brand: "Apple",
            category: "Computers",
            images: ["https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/macbook-air-midnight-select-202402?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1707329548751"],
            minPrice: 1590000,
            currency: "KRW",
            offers: [
                {
                    merchant: "Apple",
                    price: 1590000,
                    currency: "KRW",
                    shipping: 0,
                    url: "https://apple.com/kr/macbook-air",
                    inStock: true
                },
                {
                    merchant: "Amazon",
                    price: 1099.00,
                    currency: "USD",
                    shipping: 25.00,
                    url: "https://amazon.com/dp/B0CX23...",
                    inStock: true
                }
            ]
        }
    ];
    for (const p of products) {
        const { offers, ...productData } = p;
        // Create Product
        await db.collection("products").doc(p.id).set(productData);
        console.log(`Created product: ${p.title}`);
        // Create Offers
        for (const offer of offers) {
            await db.collection("products").doc(p.id).collection("offers").add(offer);
        }
        console.log(`  Added ${offers.length} offers`);
    }
    console.log("Seeding complete!");
};
seedData().catch(console.error);
