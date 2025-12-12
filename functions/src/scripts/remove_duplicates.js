const admin = require('firebase-admin');

admin.initializeApp({
    projectId: 'pricebuddy'
});

const db = admin.firestore();

async function removeDuplicates() {
    console.log('Removing duplicate Samsung Galaxy S24 Ultra...\n');

    // Keep test-galaxy-s24, remove the other one
    const duplicateId = 'yKGp5P6ofJ7ecvkbmBA0';

    try {
        await db.collection('products').doc(duplicateId).delete();
        console.log(`✅ Deleted duplicate: ${duplicateId}`);

        // Verify
        const remaining = await db.collection('products')
            .where('title', '==', 'Samsung Galaxy S24 Ultra')
            .get();

        console.log(`\n✅ Remaining Samsung products: ${remaining.size}`);
        if (remaining.size === 1) {
            console.log(`   ID: ${remaining.docs[0].id}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

removeDuplicates();
