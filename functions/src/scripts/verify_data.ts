import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
    admin.initializeApp({
        projectId: "pricebuddy-5a869"
    });
}

const db = admin.firestore();

async function verifyData() {
    console.log("Listing products...");
    const snapshot = await db.collection("products").get();

    if (snapshot.empty) {
        console.log("No products found.");
    } else {
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            console.log(`- ${data.title} (titleLower: ${data.titleLower})`);
        });
    }
}

verifyData().catch(console.error);
