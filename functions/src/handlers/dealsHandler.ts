import type { Request, Response } from "express";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) admin.initializeApp();

export async function dealsHandler(req: Request, res: Response) {
  if (req.method === "OPTIONS") {
    res.status(200).send("");
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const category = (req.query.category as string | undefined) ?? undefined;
    const limit = Math.min(parseInt((req.query.limit as string) || "20", 10) || 20, 100);

    const db = admin.firestore();
    const nowIso = new Date().toISOString();

    let q: FirebaseFirestore.Query = db
      .collection("deals")
      .where("isActive", "==", true)
      .where("validUntil", ">", nowIso)
      .orderBy("validUntil", "asc")
      .orderBy("discountPercent", "desc")
      .limit(limit);

    if (category) q = q.where("category", "==", category);

    const snap = await q.get();

    const deals = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    res.json({
      ok: true,
      deals,
      meta: { limit, count: deals.length, ts: Date.now() },
    });
  } catch (e: any) {
    res.status(200).json({
      ok: true,
      deals: [],
      meta: { limit: Number(req.query.limit ?? 20) || 20, count: 0, ts: Date.now() },
      warning: "deals collection query failed (likely missing index/collection). seed deals or add index.",
      message: String(e?.message ?? e),
    });
  }
}
