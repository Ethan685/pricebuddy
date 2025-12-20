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
exports.shareProduct = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (admin.apps.length === 0) {
    admin.initializeApp();
}
exports.shareProduct = functions.https.onRequest(async (req, res) => {
    const productId = req.query.id;
    if (!productId) {
        res.redirect("https://pricebuddy.web.app");
        return;
    }
    const db = admin.firestore();
    try {
        const doc = await db.collection("products").doc(productId).get();
        if (!doc.exists) {
            res.redirect("https://pricebuddy.web.app");
            return;
        }
        const product = doc.data();
        const title = product.title || "PriceBuddy Deal";
        const description = `Check out this deal! Lowest price: ${product.minPrice} ${product.currency}`;
        const image = product.images && product.images.length > 0 ? product.images[0] : "https://pricebuddy.web.app/logo.png";
        const url = `https://pricebuddy.web.app/product/${productId}`;
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <meta property="og:title" content="${title}">
          <meta property="og:description" content="${description}">
          <meta property="og:image" content="${image}">
          <meta property="og:url" content="${url}">
          <meta name="twitter:card" content="summary_large_image">
          <meta http-equiv="refresh" content="0;url=${url}">
        </head>
        <body>
          <p>Redirecting to PriceBuddy...</p>
          <script>window.location.href = "${url}";</script>
        </body>
      </html>
    `;
        res.status(200).send(html);
    }
    catch (error) {
        functions.logger.error("Share Function Error", error);
        res.redirect("https://pricebuddy.web.app");
    }
});
