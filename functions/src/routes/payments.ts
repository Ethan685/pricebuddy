/**
 * Payments & Subscriptions API Route Handler
 */
import { Request, Response } from "express";
import * as admin from "firebase-admin";
import Stripe from "stripe";

function getDb() {
  return admin.firestore();
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
  apiVersion: "2022-11-15" as any,
});

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

// Stripe Checkout Session 생성
export async function createCheckoutSessionHandler(req: Request, res: Response) {
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

    const { planId } = req.body;
    if (!planId) {
      res.status(400).json({ error: "Missing planId" });
      return;
    }

    // 사용자 이메일 가져오기
    const userRecord = await admin.auth().getUser(userId);
    const email = userRecord.email;

    // 가격 매핑
    const prices: Record<string, string> = {
      pro: process.env.STRIPE_PRICE_PRO || "price_123_pro_test",
      pro_plus: process.env.STRIPE_PRICE_PRO_PLUS || "price_456_pro_plus",
      enterprise: process.env.STRIPE_PRICE_ENTERPRISE || "price_789_ent_test",
    };

    const priceId = prices[planId];
    if (!priceId) {
      res.status(400).json({ error: "Invalid planId" });
      return;
    }

    // Stripe Checkout Session 생성
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email || undefined,
      success_url: `${req.headers.origin || "http://localhost:5173"}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || "http://localhost:5173"}/subscription/cancel`,
      metadata: {
        userId,
        planId,
      },
    });

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("Create Checkout Session Error:", error);
    res.status(500).json({ error: "Failed to create checkout session", message: error.message });
  }
}

// Stripe Webhook 처리
export async function stripeWebhookHandler(req: Request, res: Response) {
  try {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_test";

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      res.status(400).json({ error: `Webhook Error: ${err.message}` });
      return;
    }

    // 이벤트 처리
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;

        if (userId && planId) {
          // 사용자 구독 정보 업데이트
          const db = getDb();
          await db.collection("users").doc(userId).set(
            {
              subscription: {
                planId,
                status: "active",
                stripeCustomerId: session.customer,
                stripeSubscriptionId: session.subscription,
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
              },
            },
            { merge: true }
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          const db = getDb();
          await db.collection("users").doc(userId).set(
            {
              subscription: {
                status: "cancelled",
              },
            },
            { merge: true }
          );
        }
        break;
      }
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Stripe Webhook Error:", error);
    res.status(500).json({ error: "Webhook processing failed", message: error.message });
  }
}

// 구독 정보 조회
export async function getSubscriptionHandler(req: Request, res: Response) {
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
    const userDoc = await db.collection("users").doc(userId).get();
    const subscription = userDoc.data()?.subscription || null;

    res.status(200).json({ subscription });
  } catch (error: any) {
    console.error("Get Subscription Error:", error);
    res.status(500).json({ error: "Failed to fetch subscription", message: error.message });
  }
}
