import cors from "cors";
import type { Request, Response } from "express";

const corsHandler = cors({
  origin: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

export async function withCors(
  req: Request,
  res: Response,
  handler: () => Promise<void>
) {
  return new Promise<void>((resolve, reject) => {
    corsHandler(req, res, async (err) => {
      if (err) {
        res.status(500).send("CORS error");
        reject(err);
        return;
      }
      try {
        await handler();
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  });
}
