import type { ScrapeResultRaw, ParsedOfferOutput } from "../types";
import { parseWithConfig } from "./base";
import { coupangSelectors } from "../config/coupang";

export function parseCoupang(raw: ScrapeResultRaw): ParsedOfferOutput {
  return parseWithConfig(raw.html, coupangSelectors, "KRW");
}

