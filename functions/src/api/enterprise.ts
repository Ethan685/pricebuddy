import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
    admin.initializeApp();
}

export const enterpriseApi = functions.https.onRequest(async (req, res) => {
    // 1. Validate API Key
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) {
        res.status(401).send({ error: "Missing API Key" });
        return;
    }

    const db = admin.firestore();

    try {
        // Check if API key exists in any user's profile
        // In production, use a dedicated 'api_keys' collection for faster lookup
        const usersSnap = await db.collection("users").where("apiKey", "==", apiKey).limit(1).get();

        if (usersSnap.empty) {
            res.status(403).send({ error: "Invalid API Key" });
            return;
        }

        const user = usersSnap.docs[0].data();
        if (user.role !== "enterprise") {
            res.status(403).send({ error: "Enterprise plan required" });
            return;
        }

        // 2. Handle Request
        if (req.method === "GET" && req.path === "/products") {
            const productsSnap = await db.collection("products").limit(50).get();
            const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            res.status(200).send({ data: products });
        } else {
            res.status(404).send({ error: "Not Found" });
        }

    } catch (error) {
        functions.logger.error("Enterprise API Error", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});
