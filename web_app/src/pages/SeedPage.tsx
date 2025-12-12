import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

const SEED_PRODUCTS = [
    {
        title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
        minPrice: 348000,
        currency: "KRW",
        description: "Industry-leading noise cancellation, crystal clear hands-free calling, and 30-hour battery life.",
        images: ["https://m.media-amazon.com/images/I/61+El6k8xQL._AC_SL1500_.jpg"],
        category: "Electronics",
        merchant: "Coupang",
        url: "https://coupang.com",
        offers: [
            { merchantName: "Coupang", totalPrice: 348000, productUrl: "#" },
            { merchantName: "Amazon", totalPrice: 398000, productUrl: "#" },
            { merchantName: "Naver Shopping", totalPrice: 355000, productUrl: "#" }
        ]
    },
    {
        title: "Apple MacBook Air 15-inch (M2)",
        minPrice: 1690000,
        currency: "KRW",
        description: "Impossibly thin and incredibly fast. Features a silent, fanless design and up to 18 hours of battery life.",
        images: ["https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/macbook-air-15-midnight-select-202306?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1684517278923"],
        category: "Laptops",
        merchant: "Apple",
        url: "https://apple.com",
        offers: [
            { merchantName: "Apple", totalPrice: 1890000, productUrl: "#" },
            { merchantName: "Coupang", totalPrice: 1690000, productUrl: "#" },
            { merchantName: "11st", totalPrice: 1750000, productUrl: "#" }
        ]
    },
    {
        title: "Samsung Galaxy S24 Ultra",
        minPrice: 1450000,
        currency: "KRW",
        description: "Unleash your creativity with the S Pen and AI-powered camera features.",
        images: ["https://images.samsung.com/is/image/samsung/p6pim/kr/sm-s928nztckoo/gallery/kr-galaxy-s24-s928-sm-s928nztckoo-thumb-539304675?"],
        category: "Smartphones",
        merchant: "Samsung",
        url: "https://samsung.com",
        offers: [
            { merchantName: "Samsung", totalPrice: 1698400, productUrl: "#" },
            { merchantName: "Coupang", totalPrice: 1450000, productUrl: "#" },
            { merchantName: "Gmarket", totalPrice: 1500000, productUrl: "#" }
        ]
    },
    {
        title: "LG OLED evo C3 65-inch 4K TV",
        minPrice: 2100000,
        currency: "KRW",
        description: "The world's #1 OLED TV. Experience infinite contrast and 100% color fidelity.",
        images: ["https://www.lge.co.kr/kr/images/tv/oled-evo/2023/gallery/OLED65C3KNA_gallery_01.jpg"],
        category: "TVs",
        merchant: "LG Electronics",
        url: "https://lge.co.kr",
        offers: [
            { merchantName: "LG Best Shop", totalPrice: 2500000, productUrl: "#" },
            { merchantName: "Coupang", totalPrice: 2100000, productUrl: "#" },
            { merchantName: "Himart", totalPrice: 2200000, productUrl: "#" }
        ]
    },
    {
        title: "Dyson Airwrap Multi-Styler",
        minPrice: 650000,
        currency: "KRW",
        description: "Curl. Shape. Smooth. Hide Flyaways. With no heat damage.",
        images: ["https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/images/products/hair-care/dyson-airwrap-multi-styler/complete-long-nickel-copper/600x600_Airwrap_Complete_Long_Nickel_Copper.jpg"],
        category: "Beauty",
        merchant: "Dyson",
        url: "https://dyson.co.kr",
        offers: [
            { merchantName: "Dyson", totalPrice: 749000, productUrl: "#" },
            { merchantName: "Coupang", totalPrice: 650000, productUrl: "#" },
            { merchantName: "Kurly", totalPrice: 699000, productUrl: "#" }
        ]
    }
];

export const SeedPage: React.FC = () => {
    const [status, setStatus] = useState<string>('Ready to seed');
    const auth = getAuth();

    const handleSeed = async () => {
        if (!auth.currentUser) {
            setStatus('Error: You must be logged in to seed data.');
            return;
        }

        setStatus('Seeding started...');
        try {
            for (const product of SEED_PRODUCTS) {
                // Add product to 'products' collection
                const docRef = await addDoc(collection(db, 'products'), {
                    title: product.title,
                    minPrice: product.minPrice,
                    currency: product.currency,
                    description: product.description,
                    images: product.images,
                    category: product.category,
                    merchant: product.merchant,
                    url: product.url,
                    createdAt: new Date()
                });

                // Add offers to subcollection
                for (const offer of product.offers) {
                    await addDoc(collection(db, 'products', docRef.id, 'offers'), {
                        merchantName: offer.merchantName,
                        totalPrice: offer.totalPrice,
                        productUrl: offer.productUrl,
                        scannedAt: new Date()
                    });
                }

                setStatus(`Added ${product.title}...`);
            }
            setStatus('Seeding Complete! You can now check the Landing Page.');
        } catch (error) {
            console.error(error);
            setStatus(`Error: ${(error as Error).message}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1117] text-white flex flex-col items-center justify-center gap-4">
            <h1 className="text-3xl font-bold">Database Seeder</h1>
            <p className="text-[#9BA7B4]">Adds realistic test data to Firestore.</p>

            <div className="bg-[#161B22] p-4 rounded-xl border border-[#30363D] w-full max-w-md text-center">
                <p className="mb-4 text-sm font-mono">{status}</p>
                <button
                    onClick={handleSeed}
                    className="bg-[#238636] hover:bg-[#2ea043] text-white font-bold py-2 px-6 rounded-full transition-colors"
                >
                    Run Seed
                </button>
            </div>

            <p className="text-xs text-[#F85149]">Warning: This will add duplicate data if run multiple times.</p>
        </div>
    );
};
