const admin = require('firebase-admin');

admin.initializeApp({
    projectId: 'pricebuddy'
});

const db = admin.firestore();

async function addTitleLower() {
    console.log('Adding titleLower field to existing products...\n');

    const productsRef = db.collection('products');
    const snapshot = await productsRef.get();

    if (snapshot.empty) {
        console.log('❌ No products found in database.');
        process.exit(1);
    }

    console.log(`Found ${snapshot.size} products.\n`);

    let updated = 0;
    for (const doc of snapshot.docs) {
        const data = doc.data();
        const title = data.title || '';
        const titleLower = title.toLowerCase();

        await doc.ref.update({ titleLower });
        console.log(`✓ Updated: ${doc.id} - "${title}" → titleLower: "${titleLower}"`);
        updated++;
    }

    console.log(`\n✅ Successfully updated ${updated} products!`);
    console.log('\nNow you can search for products!');

    process.exit(0);
}

addTitleLower().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
