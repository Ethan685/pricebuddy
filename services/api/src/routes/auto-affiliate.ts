import { Router, type Request, type Response } from "express";
import { generateAffiliateLink } from "../lib/affiliate-clients";
import { detectMarketplaceFromUrl, type Marketplace } from "../lib/marketplace";

export const router = Router();

router.get("/auto-affiliate", async (req: Request, res: Response) => {
  try {
    const inputUrl = String(req.query.url || req.query.testUrl || "");
    const testUrl =
      inputUrl ||
      "https://www.coupang.com/vp/products/0";

    const marketplace: Marketplace = detectMarketplaceFromUrl(testUrl);
    const affiliateUrl = await generateAffiliateLink(marketplace, testUrl, "test");

    res.json({
      ok: true,
      marketplace,
      url: testUrl,
      affiliateUrl,
    });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

export default router;
