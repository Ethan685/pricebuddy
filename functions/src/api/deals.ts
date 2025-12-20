import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { withCors } from "../http/cors";

if (!admin.apps.length) {
  admin.initializeApp();
}

export const deals = functions
  .region("asia-northeast3")
  .https.onRequest((req, res) =>
    withCors(req as any, res as any, async () => {
      if (req.method !== "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
      }

      const limit = Number(req.query.limit ?? 20);
      functions.logger.info("HTTP Deals request", { limit });

      const db = admin.firestore();
      const snap = await db
        .collection("deals")
        .where("isActive", "==", true)
        .limit(limit)
        .get();

      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));

      res.json({ deals: list });
    })
  );
