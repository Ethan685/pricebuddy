import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
    admin.initializeApp();
}

export const shareProduct = functions.https.onRequest(async (req, res) => {
    const productId = req.query.id as string;

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

        const product = doc.data()!;
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

    } catch (error) {
        functions.logger.error("Share Function Error", error);
        res.redirect("https://pricebuddy.web.app");
    }
});
