import { Router } from "express";
import type { TypedRequestQuery } from "../types/http";
import { scraperClient } from "../clients/scraper-client";

export const searchRouter = Router();

/**
 * GET /api/search?q=iphone17&region=global
 */
searchRouter.get(
  "/",
  async (req: TypedRequestQuery<{ q?: string; region?: string }>, res, next) => {
    try {
      const q = req.query.q ?? "";
      const region = req.query.region ?? "KR";

      if (!q) {
        return res.status(400).json({ error: "Missing query" });
      }

      const results = await scraperClient.search(q, region);
      res.json({ query: q, region, results });
    } catch (e) {
      next(e);
    }
  }
);

