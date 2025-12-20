/**
 * Referrals API Route Handler
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
      return null;
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    return null;
  }
}

// 추천인 코드 생성
function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 추천인 코드 생성/조회
export async function getReferralCodeHandler(req: Request, res: Response) {
  try {
    if (req.method !== "GET" && req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const userId = await getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const db = getDb();
    const userDoc = await db.collection("users").doc(userId).get();

    if (userDoc.exists && userDoc.data()?.referralCode) {
      res.status(200).json({ code: userDoc.data()?.referralCode });
      return;
    }

    // 새 코드 생성
    if (req.method === "POST") {
      const db = getDb();
      let code = generateCode();
      let collision = true;
      let attempts = 0;

      while (collision && attempts < 5) {
        const check = await db.collection("users").where("referralCode", "==", code).get();
        if (check.empty) {
          collision = false;
        } else {
          code = generateCode();
          attempts++;
        }
      }

      if (collision) {
        res.status(500).json({ error: "Failed to generate unique code" });
        return;
      }

      await db.collection("users").doc(userId).set({ referralCode: code }, { merge: true });
      res.status(200).json({ code });
    } else {
      res.status(404).json({ error: "Referral code not found" });
    }
  } catch (error: any) {
    console.error("Get Referral Code Error:", error);
    res.status(500).json({ error: "Failed to get referral code", message: error.message });
  }
}

// 추천인 코드 사용
export async function redeemReferralHandler(req: Request, res: Response) {
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

    const { code } = req.body;
    if (!code) {
      res.status(400).json({ error: "Missing referral code" });
      return;
    }

    const db = getDb();
    
    // 코드 검증
    const referrerSnap = await db.collection("users").where("referralCode", "==", code).limit(1).get();
    if (referrerSnap.empty) {
      res.status(404).json({ error: "Invalid referral code" });
      return;
    }

    const referrerDoc = referrerSnap.docs[0];
    const referrerId = referrerDoc.id;

    if (referrerId === userId) {
      res.status(400).json({ error: "Cannot redeem your own code" });
      return;
    }

    // 이미 사용했는지 확인
    const userDoc = await db.collection("users").doc(userId).get();
    if (userDoc.data()?.redeemedReferral) {
      res.status(400).json({ error: "Already redeemed a code" });
      return;
    }

    // 트랜잭션으로 처리
    await db.runTransaction(async (t) => {
      // 추천인 보상
      const referrerWalletRef = db.collection("cashback_wallet").doc(referrerId);
      t.set(
        referrerWalletRef,
        {
          balance: admin.firestore.FieldValue.increment(1000),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // 사용자 보상
      const userWalletRef = db.collection("cashback_wallet").doc(userId);
      t.set(
        userWalletRef,
        {
          balance: admin.firestore.FieldValue.increment(1000),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // 사용자 마킹
      t.set(
        db.collection("users").doc(userId),
        {
          redeemedReferral: true,
          redeemedCode: code,
        },
        { merge: true }
      );

      // 거래 기록
      const ledgerRef = db.collection("cashback_ledger").doc();
      t.set(ledgerRef, {
        userId: referrerId,
        amount: 1000,
        type: "referral_bonus",
        description: `Referral bonus for ${userId}`,
        status: "paid",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const ledgerRef2 = db.collection("cashback_ledger").doc();
      t.set(ledgerRef2, {
        userId: userId,
        amount: 1000,
        type: "referral_bonus",
        description: `Referral bonus from ${code}`,
        status: "paid",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    res.status(200).json({ success: true, message: "Referral redeemed! +1000 KRW" });
  } catch (error: any) {
    console.error("Redeem Referral Error:", error);
    res.status(500).json({ error: "Redemption failed", message: error.message });
  }
}
