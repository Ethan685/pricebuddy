import { Router } from "express";
import { firestore } from "../lib/firestore";

export const referralRouter = Router();

const REFERRAL_BONUS = 5000; // 추천인 보너스: 5,000원
const REFERRED_BONUS = 3000; // 피추천인 보너스: 3,000원

/**
 * GET /referral/code
 * 사용자의 추천 코드 조회/생성
 */
referralRouter.get("/code", async (req, res, next) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // 사용자 정보 조회
    const userDoc = await firestore.collection("users").doc(userId).get();
    let referralCode: string;

    if (userDoc.exists) {
      const userData = userDoc.data();
      referralCode = userData?.referralCode || generateReferralCode(userId);
      
      // 코드가 없으면 생성
      if (!userData?.referralCode) {
        await userDoc.ref.update({ referralCode });
      }
    } else {
      // 신규 사용자 - 코드 생성
      referralCode = generateReferralCode(userId);
      await firestore.collection("users").doc(userId).set({
        id: userId,
        referralCode,
        createdAt: new Date().toISOString(),
      });
    }

    res.json({ referralCode });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /referral/apply
 * 추천 코드 적용 (회원가입 시)
 */
referralRouter.post("/apply", async (req, res, next) => {
  try {
    const { userId, referralCode } = req.body;

    if (!userId || !referralCode) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 추천인 찾기
    const referrerQuery = await firestore
      .collection("users")
      .where("referralCode", "==", referralCode)
      .limit(1)
      .get();

    if (referrerQuery.empty) {
      return res.status(400).json({ error: "Invalid referral code" });
    }

    const referrer = referrerQuery.docs[0];
    const referrerId = referrer.id;

    if (referrerId === userId) {
      return res.status(400).json({ error: "Cannot use your own referral code" });
    }

    // 사용자 정보 업데이트
    await firestore.collection("users").doc(userId).update({
      referredBy: referrerId,
      referralCodeAppliedAt: new Date().toISOString(),
    });

    // 추천인 보너스 지급
    await firestore.collection("wallet_ledger").add({
      userId: referrerId,
      type: "referral_bonus",
      amount: REFERRAL_BONUS,
      description: `추천인 보너스 (${referralCode})`,
      relatedOrderId: userId,
      createdAt: new Date().toISOString(),
      status: "completed",
    });

    // 피추천인 보너스 지급
    await firestore.collection("wallet_ledger").add({
      userId,
      type: "referral_bonus",
      amount: REFERRED_BONUS,
      description: "신규 가입 보너스",
      createdAt: new Date().toISOString(),
      status: "completed",
    });

    res.json({
      success: true,
      referrerBonus: REFERRAL_BONUS,
      referredBonus: REFERRED_BONUS,
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /referral/stats
 * 추천 통계 조회
 */
referralRouter.get("/stats", async (req, res, next) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // 피추천인 수
    const referredCount = await firestore
      .collection("users")
      .where("referredBy", "==", userId)
      .get();

    // 총 보너스 수익
    const bonusQuery = await firestore
      .collection("wallet_ledger")
      .where("userId", "==", userId)
      .where("type", "==", "referral_bonus")
      .get();

    const totalBonus = bonusQuery.docs.reduce(
      (sum, doc) => sum + (doc.data().amount || 0),
      0
    );

    res.json({
      referredCount: referredCount.size,
      totalBonus,
      averageBonusPerReferral:
        referredCount.size > 0 ? totalBonus / referredCount.size : 0,
    });
  } catch (e) {
    next(e);
  }
});

function generateReferralCode(userId: string): string {
  // 사용자 ID 기반으로 추천 코드 생성 (실제로는 더 복잡한 로직)
  const prefix = userId.substring(0, 4).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${random}`;
}

