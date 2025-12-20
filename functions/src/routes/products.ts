/**
 * Products API Route Handler
 */
import { Request, Response } from "express";
import * as admin from "firebase-admin";

export async function getProductHandler(req: Request, res: Response) {
  try {
    const productId = req.params.productId;

    if (!productId) {
      res.status(400).json({ error: "Product ID required" });
      return;
    }

    const db = admin.firestore(); // 함수 내부에서 호출
    const doc = await db.collection("products").doc(productId).get();

    if (!doc.exists) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const data = doc.data();
    res.status(200).json({
      ok: true,
      product: {
        id: doc.id,
        ...data,
      },
    });
  } catch (error: any) {
    console.error("Product API Error:", error);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
}
