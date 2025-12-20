/**
 * Wishlist API Route Handler
 */
import { Request, Response } from "express";
import * as admin from "firebase-admin";

function getDb() {
  return admin.firestore();
}

// 인증 미들웨어
async function getUserId(req: Request): Promise<string | null> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // 개발 환경에서는 query parameter 허용
      if (process.env.NODE_ENV !== "production") {
        return (req.query.userId as string) || null;
      }
      return null;
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    // 개발 환경에서는 query parameter 허용
    if (process.env.NODE_ENV !== "production") {
      return (req.query.userId as string) || null;
    }
    return null;
  }
}

// 위시리스트 조회
export async function getWishlistHandler(req: Request, res: Response) {
  try {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const userId = await getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const db = getDb();
    const snap = await db
      .collection("users")
      .doc(userId)
      .collection("wishlist")
      .orderBy("addedAt", "desc")
      .get();

    const items = snap.docs.map((d) => ({
      id: d.id,
      productId: d.id,
      ...d.data(),
    }));

    res.status(200).json({ items });
  } catch (error: any) {
    console.error("Get Wishlist Error:", error);
    res.status(500).json({ error: "Failed to fetch wishlist", message: error.message });
  }
}

// 위시리스트 추가
export async function addToWishlistHandler(req: Request, res: Response) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const userId = await getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { productId, productData } = req.body;

    if (!productId) {
      res.status(400).json({ error: "productId is required" });
      return;
    }

    const db = getDb();
    const wishRef = db.collection("users").doc(userId).collection("wishlist").doc(productId);
    const docSnap = await wishRef.get();

    if (docSnap.exists) {
      res.status(200).json({ added: false, message: "Already in wishlist" });
    } else {
      await wishRef.set({
        ...productData,
        addedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      res.status(200).json({ added: true, message: "Added to wishlist" });
    }
  } catch (error: any) {
    console.error("Add to Wishlist Error:", error);
    res.status(500).json({ error: "Failed to add to wishlist", message: error.message });
  }
}

// 위시리스트에서 제거
export async function removeFromWishlistHandler(req: Request, res: Response) {
  try {
    if (req.method !== "DELETE") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const userId = await getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const productId = req.params.productId || (req.query.productId as string);

    if (!productId) {
      res.status(400).json({ error: "productId is required" });
      return;
    }

    const db = getDb();
    const wishRef = db.collection("users").doc(userId).collection("wishlist").doc(productId);
    await wishRef.delete();

    res.status(200).json({ success: true, message: "Removed from wishlist" });
  } catch (error: any) {
    console.error("Remove from Wishlist Error:", error);
    res.status(500).json({ error: "Failed to remove from wishlist", message: error.message });
  }
}
