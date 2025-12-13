import fastify from "fastify";
import { scrapeOffer } from "./scrape";
import { searchMultipleMarketplaces } from "./search";

const app = fastify({ logger: true });

app.post("/scrape", async (req, res) => {
  try {
    const body = req.body as { marketplace: string; url: string };
    const out = await scrapeOffer({
      marketplace: body.marketplace as any,
      url: body.url,
    });
    return out;
  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
});

app.post("/search", async (req, res) => {
  try {
    const body = req.body as { query: string; marketplaces?: string[]; limit?: number };
    const { query, marketplaces = ["coupang", "naver"], limit = 20 } = body;
    
    if (!query) {
      return res.status(400).send({ error: "Query is required" });
    }

    const results = await searchMultipleMarketplaces(query, marketplaces, limit);
    return { query, results };
  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/health", async (req, res) => {
  return { status: "ok" };
});

const port = Number(process.env.PORT ?? 8080);

app.listen({ port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});

export { scrapeOffer };

