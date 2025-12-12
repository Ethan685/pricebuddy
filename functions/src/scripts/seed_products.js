const admin = require('firebase-admin');

// Initialize Firebase Admin (using emulator)
admin.initializeApp({
    projectId: 'pricebuddy'
});

const db = admin.firestore();

// Sample products for testing
const testProducts = [
    {
        id: 'test-iphone-15-pro',
        title: 'iPhone 15 Pro 256GB',
        titleLower: 'iphone 15 pro 256gb',
        brand: 'Apple',
        category: 'Electronics',
        minPrice: 1490000,
        imageUrl: 'https://via.placeholder.com/300x300?text=iPhone+15+Pro',
        createdAt: admin.firestore.Timestamp.now(),
    },
    {
        id: 'test-iphone-15',
        title: 'iPhone 15 128GB',
        titleLower: 'iphone 15 128gb',
        brand: 'Apple',
        category: 'Electronics',
        minPrice: 1290000,
        imageUrl: 'https://via.placeholder.com/300x300?text=iPhone+15',
        createdAt: admin.firestore.Timestamp.now(),
    },
    {
        id: 'test-macbook-air',
        title: 'MacBook Air M2',
        titleLower: 'macbook air m2',
        brand: 'Apple',
        category: 'Computers',
        minPrice: 1590000,
        imageUrl: 'https://via.placeholder.com/300x300?text=MacBook+Air',
        createdAt: admin.firestore.Timestamp.now(),
    },
    {
        id: 'test-airpods-pro',
        title: 'AirPods Pro (2nd gen)',
        titleLower: 'airpods pro (2nd gen)',
        brand: 'Apple',
        category: 'Audio',
        minPrice: 359000,
        imageUrl: 'https://via.placeholder.com/300x300?text=AirPods+Pro',
        createdAt: admin.firestore.Timestamp.now(),
    },
    {
        id: 'test-galaxy-s24',
        title: 'Samsung Galaxy S24 Ultra',
        titleLower: 'samsung galaxy s24 ultra',
        brand: 'Samsung',
        category: 'Electronics',
        minPrice: 1690000,
        imageUrl: 'https://via.placeholder.com/300x300?text=Galaxy+S24',
        createdAt: admin.firestore.Timestamp.now(),
    }
];

async function seedProducts() {
    console.log('Seeding test products...');

    for (const product of testProducts) {
        const docRef = db.collection('products').doc(product.id);
        await docRef.set(product);
        console.log(`✓ Added: ${product.title}`);
    }

    console.log(`\n✅ Successfully added ${testProducts.length} test products!`);
    console.log('\nYou can now search for:');
    console.log('  - "iPhone"');
    console.log('  - "MacBook"');
    console.log('  - "AirPods"');
    console.log('  - "Galaxy"');
    console.log('  - "Samsung"');

    process.exit(0);
}

seedProducts().catch((error) => {
    console.error('Error seeding products:', error);
    process.exit(1);
});
