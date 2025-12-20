import * as functions from "firebase-functions";
import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

const US_BASE = "https://us-central1-pricebuddy-5a869.cloudfunctions.net";

function pickHeaders(req: express.Request) {
  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (!v) continue;
    if (Array.isArray(v)) headers[k] = v.join(",");
    else headers[k] = String(v);
  }
  delete headers["host"];
  delete headers["content-length"];
  return headers;
}

async function forward(req: any, res: any, path: string) {
  const base = "https://us-central1-pricebuddy-5a869.cloudfunctions.net";
  const qs = req.originalUrl && req.originalUrl.includes("?") ? req.originalUrl.split("?")[1] : "";
  const url = base + path + (qs ? "?" + qs : "");

  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(req.headers || {})) {
    if (!v) continue;
    if (Array.isArray(v)) headers[k] = v.join(",");
    else headers[k] = String(v);
  }

  const method = (req.method || "GET").toUpperCase();
  const init: any = { method, headers };

  if (method !== "GET" && method !== "HEAD") {
    if (req.rawBody) init.body = req.rawBody;
    else if (req.body && typeof req.body === "string") init.body = req.body;
    else if (req.body) {
      init.body = JSON.stringify(req.body);
      if (!init.headers["content-type"] && !init.headers["Content-Type"]) {
        init.headers["content-type"] = "application/json";
      }
    }
  }

  const r = await fetch(url, init);

  res.status(r.status);
  r.headers.forEach((value, key) => {
    if (key.toLowerCase() in { "transfer-encoding": 1 }) return;
    res.setHeader(key, value);
  });

  const buf = Buffer.from(await r.arrayBuffer());
  res.send(buf);
}

app.all("/v1/us/apiSearchProducts", (req, res) => forward(req, res, "/apiSearchProducts"));
app.all("/v1/us/apiGetProduct", (req, res) => forward(req, res, "/apiGetProduct"));
app.all("/v1/us/apiGetPrices", (req, res) => forward(req, res, "/apiGetPrices"));
app.all("/v1/us/apiCreateAlert", (req, res) => forward(req, res, "/apiCreateAlert"));
app.all("/v1/us/apiListAlerts", (req, res) => forward(req, res, "/apiListAlerts"));
app.all("/v1/us/apiCreateShareLink", (req, res) => forward(req, res, "/apiCreateShareLink"));
app.all("/v1/us/shareProduct", (req, res) => forward(req, res, "/shareProduct"));
app.all("/v1/us/enterpriseApi", (req, res) => forward(req, res, "/enterpriseApi"));

app.get("/health", (_req, res) => res.status(200).json({ ok: true, region: "asia-northeast3" }));

export const api = functions.region("asia-northeast3").https.onRequest(app);
