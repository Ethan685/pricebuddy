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
exports.enterpriseApi = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (admin.apps.length === 0) {
    admin.initializeApp();
}
exports.enterpriseApi = functions.https.onRequest(async (req, res) => {
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
        }
        else {
            res.status(404).send({ error: "Not Found" });
        }
    }
    catch (error) {
        functions.logger.error("Enterprise API Error", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});
