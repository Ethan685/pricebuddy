import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) admin.initializeApp();

export const seedDemoProducts = functions.region("asia-northeast3").https.onRequest(async (req, res) => {
  try {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    const sample = [
      {
        id: "p_iphone_15_128",
        product: {
          title: "아이폰 15 128GB",
          imageUrl: "https://via.placeholder.com/400x400.png?text=iPhone15",
          minPriceKrw: 1200000,
          maxPriceKrw: 1550000,
          updatedAt: now,
        },
        offers: [
          { marketplace: "naver", currency: "KRW", price: 1550000, totalPrice: 1550000, updatedAt: now },
          { marketplace: "coupang", currency: "KRW", price: 1350000, totalPrice: 1350000, updatedAt: now },
          { marketplace: "11st", currency: "KRW", price: 1200000, totalPrice: 1200000, updatedAt: now },
        ],
      },
      {
        id: "p_airpods_pro_2",
        product: {
          title: "에어팟 프로 2",
          imageUrl: "https://via.placeholder.com/400x400.png?text=AirPods+Pro+2",
          minPriceKrw: 285000,
          maxPriceKrw: 359000,
          updatedAt: now,
        },
        offers: [
          { marketplace: "naver", currency: "KRW", price: 359000, totalPrice: 359000, updatedAt: now },
          { marketplace: "coupang", currency: "KRW", price: 299000, totalPrice: 299000, updatedAt: now },
          { marketplace: "gmarket", currency: "KRW", price: 285000, totalPrice: 285000, updatedAt: now },
        ],
      },
      {
        id: "p_dyson_v15",
        product: {
          title: "다이슨 V15",
          imageUrl: "https://via.placeholder.com/400x400.png?text=Dyson+V15",
          minPriceKrw: 699000,
          maxPriceKrw: 990000,
          updatedAt: now,
        },
        offers: [
          { marketplace: "naver", currency: "KRW", price: 990000, totalPrice: 990000, updatedAt: now },
          { marketplace: "coupang", currency: "KRW", price: 799000, totalPrice: 799000, updatedAt: now },
          { marketplace: "ssg", currency: "KRW", price: 699000, totalPrice: 699000, updatedAt: now },
        ],
      },
    ];

    for (const item of sample) {
      const pRef = db.collection("products").doc(item.id);
      await pRef.set(item.product, { merge: true });

      const batch = db.batch();
      item.offers.forEach((o, idx) => {
        const oRef = pRef.collection("offers").doc(`o_${idx + 1}`);
        batch.set(oRef, o, { merge: true });
      });
      await batch.commit();
    }

    res.status(200).json({ ok: true, inserted: sample.length });
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e?.message || String(e) });
  }
});
