/**
 * Product Matching API Route Handler (확장 프로그램용)
 */
import { Request, Response } from "express";
import * as admin from "firebase-admin";

function getDb() {
  return admin.firestore();
}

// SKU 매칭 (확장 프로그램에서 사용)
export async function matchSKUHandler(req: Request, res: Response) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const { title, currentPrice, currency } = req.body;

    if (!title) {
      res.status(400).json({ error: "Title required" });
      return;
    }

    const db = getDb();

    // 제목으로 유사한 상품 검색 (Firestore 쿼리 최적화)
    const titleLower = title.toLowerCase();
    const keywords = titleLower.split(/\s+/).filter((w) => w.length > 2);
    
    let matchingDocs: admin.firestore.QueryDocumentSnapshot[] = [];
    
    if (keywords.length > 0) {
      // 첫 번째 키워드로 시작하는 쿼리
      const firstKeyword = keywords[0];
      const productsRef = db.collection("products");
      
      // titleLower 필드가 있는 경우 (인덱싱된 필드)
      try {
        const snapshot = await productsRef
          .where("titleLower", ">=", firstKeyword)
          .where("titleLower", "<=", firstKeyword + "\uf8ff")
          .limit(50)
          .get();
        
        matchingDocs = snapshot.docs;
      } catch (error) {
        console.warn("Indexed query failed, using fallback:", error);
        // 폴백: 전체 스캔 (제한적)
        const allProducts = await productsRef.limit(100).get();
        matchingDocs = allProducts.docs;
      }
    } else {
      // 키워드가 없으면 빈 결과
      matchingDocs = [];
    }

    // 필터링: 제목에 키워드 포함 여부 확인
    const filteredDocs = matchingDocs.filter((doc) => {
      const data = doc.data();
      const titleLower = (data.titleLower || data.title || "").toLowerCase();
      return keywords.some((kw) => titleLower.includes(kw));
    });

    // 가격 기준으로 정렬
    const matches = filteredDocs
      .map((doc) => {
        const data = doc.data();
        const price = data.minPriceKrw || data.price || data.minPrice || 0;
        return {
          id: doc.id,
          title: data.title || "Unknown Product",
          price: price,
          currency: data.currency || "KRW",
          url: data.url || data.productUrl || data.product_url || "",
          source: data.marketplace || data.merchantName || data.merchant || "Unknown",
          similarityScore: 0.9,
        };
      })
      .filter((m) => m.price > 0) // 가격이 있는 것만
      .sort((a, b) => a.price - b.price);

    const bestMatch = matches[0] || null;

    res.status(200).json({
      bestMatch,
      matches: matches.slice(0, 5),
    });
  } catch (error: any) {
    console.error("Match SKU Error:", error);
    res.status(500).json({ error: "Failed to match SKU", message: error.message });
  }
}
