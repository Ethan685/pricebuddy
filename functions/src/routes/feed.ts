/**
 * Feed API Route Handler
 */
import { Request, Response } from "express";
import * as admin from "firebase-admin";
import { FirestoreFeedRepository } from "../infrastructure/firestore/FirestoreFeedRepository";
import { GetPersonalizedFeed } from "../domain/usecases/GetPersonalizedFeed";

function getDb() {
  return admin.firestore();
}

// 인증 미들웨어
async function getUserId(req: Request): Promise<string | null> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    return null;
  }
}

// 개인화된 피드 조회
export async function getFeedHandler(req: Request, res: Response) {
  try {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const limit = Number(req.query.limit) || 12;
    const userId = await getUserId(req);

    const db = getDb();
    const feedRepository = new FirestoreFeedRepository();
    const getPersonalizedFeed = new GetPersonalizedFeed(feedRepository);

    let userPreferences = null;

    // 사용자 선호도 가져오기
    if (userId) {
      const userDoc = await db.collection("users").doc(userId).get();
      userPreferences = userDoc.data()?.preferences || null;
    }

    // 피드 가져오기
    const result = await getPersonalizedFeed.execute(userPreferences, limit);

    res.status(200).json({
      success: true,
      data: {
        products: result.products,
        personalized: !!userId,
        timestamp: Date.now(),
      },
    });
  } catch (error: any) {
    console.error("Get Feed Error:", error);
    res.status(500).json({ error: "Failed to fetch feed", message: error.message });
  }
}
