import type { ScrapeResultRaw, ParsedOfferOutput } from "../types";
import { parseWithConfig } from "./base";
import { naverSelectors } from "../config/naver";

export function parseNaver(raw: ScrapeResultRaw): ParsedOfferOutput {
  return parseWithConfig(raw, naverSelectors, "KRW");
}

