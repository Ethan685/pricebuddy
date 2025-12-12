import { Router } from "express";
import { firestore } from "../lib/firestore";
import { pricingClient } from "../clients/pricing-client";

export const dealsRouter = Router();

/**
 * GET /deals?category=electronics&limit=20
 */
dealsRouter.get("/", async (req, res, next) => {
  try {
    const category = req.query.category as string | undefined;
    const limit = parseInt(req.query.limit as string) || 20;

    let query = firestore
      .collection("deals")
      .where("isActive", "==", true)
      .where("validUntil", ">", new Date().toISOString())
      .orderBy("validUntil", "asc")
      .orderBy("discountPercent", "desc")
      .limit(limit);

    if (category) {
      query = query.where("category", "==", category);
    }

    const snapshot = await query.get();
    const deals = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ deals });
  } catch (e) {
    next(e);
  }
});

