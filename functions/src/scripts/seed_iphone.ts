import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
    admin.initializeApp({
        projectId: "pricebuddy-5a869"
    });
}

const db = admin.firestore();

const IPHONE_PRODUCTS = [
    {
        title: "Apple iPhone 15 Pro Max",
        titleLower: "apple iphone 15 pro max",
        brand: "Apple",
        category: "Electronics",
        imageUrl: "https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-pro-max-natural-titanium-select?wid=470&hei=556&fmt=png-alpha&.v=1693009279096",
        minPriceKrw: 1890000,
        maxPriceKrw: 1990000,
        priceChangePct: -2.5,
    },
    {
        title: "Apple iPhone 15 Pro",
        titleLower: "apple iphone 15 pro",
        brand: "Apple",
        category: "Electronics",
        imageUrl: "https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-pro-natural-titanium-select?wid=470&hei=556&fmt=png-alpha&.v=1693009279096",
        minPriceKrw: 1590000,
        maxPriceKrw: 1690000,
        priceChangePct: -1.8,
    },
    {
        title: "Apple iPhone 15",
        titleLower: "apple iphone 15",
        brand: "Apple",
        category: "Electronics",
        imageUrl: "https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-natural?wid=470&hei=556&fmt=png-alpha&.v=1693009279096",
        minPriceKrw: 1250000,
        maxPriceKrw: 1350000,
        priceChangePct: -3.2,
    },
    {
        title: "Apple iPhone 14 Pro",
        titleLower: "apple iphone 14 pro",
        brand: "Apple",
        category: "Electronics",
        imageUrl: "https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-14-pro-deep-purple-select?wid=470&hei=556&fmt=png-alpha&.v=1663703841896",
        minPriceKrw: 1390000,
        maxPriceKrw: 1490000,
        priceChangePct: -5.1,
    },
    {
        title: "Apple iPhone 13",
        titleLower: "apple iphone 13",
        brand: "Apple",
        category: "Electronics",
        imageUrl: "https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-13-starlight-select?wid=470&hei=556&fmt=png-alpha&.v=1649959933410",
        minPriceKrw: 990000,
        maxPriceKrw: 1090000,
        priceChangePct: -7.3,
    },
];

async function seedIphone() {
    console.log("Seeding iPhone products...");
    
    const batch = db.batch();
    
    for (const product of IPHONE_PRODUCTS) {
        const ref = db.collection("products").doc();
        batch.set(ref, {
            ...product,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Added: ${product.title}`);
    }
    
    await batch.commit();
    console.log(`Successfully seeded ${IPHONE_PRODUCTS.length} iPhone products.`);
}

seedIphone()
    .then(() => {
        console.log("Done!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    });

