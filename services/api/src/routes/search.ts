import { Router } from "express";
import type { TypedRequestQuery } from "../types/http";
import { scraperClient } from "../clients/scraper-client";
import type { SearchResponse, RegionMode, SearchResultItem } from "@pricebuddy/core";

export const searchRouter = Router();

/**
 * GET /api/search?q=iphone17&region=global
 */
searchRouter.get(
  "/",
  async (req: TypedRequestQuery<{ q?: string; region?: string }>, res, next) => {
    try {
      const q = String(req.query.q ?? "");
      const region: RegionMode = (String(req.query.region ?? "global") === "kr" ? "kr" : "global");

      if (!q) {
        return res.status(400).json({ error: "Missing q" });
      }

      // TODO: 현재 구현에 맞게 results 구성
      const rawResults = await scraperClient.search(q, region === "kr" ? "KR" : "global");
      
      // scraperClient.search의 반환값을 SearchResultItem으로 변환
      const results: SearchResultItem[] = rawResults.map((item: any) => ({
        productId: item.productId,
        title: item.title,
        imageUrl: item.imageUrl,
        minTotalPriceKrw: item.minPriceKrw ?? item.minTotalPriceKrw ?? 0,
        maxTotalPriceKrw: item.maxPriceKrw ?? item.maxTotalPriceKrw ?? 0,
        priceChangePct7d: item.priceChangePct,
        lastUpdatedAt: item.lastUpdatedAt,
      }));

      const payload: SearchResponse = {
        query: q,
        region,
        results,
      };

      return res.json(payload);
    } catch (e) {
      next(e);
    }
  }
);

