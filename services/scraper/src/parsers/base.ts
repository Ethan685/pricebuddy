import * as cheerio from "cheerio";
import type { ParsedOfferOutput } from "../types";

interface SelectorConfig {
  title: string;
  price: string;
  priceFraction?: string;
  image: string;
  shippingFee?: string;
}

export function parseWithConfig(
  html: string,
  selectors: SelectorConfig,
  currency: string
): ParsedOfferOutput {
  const $ = cheerio.load(html);

  const title = $(selectors.title).first().text().trim();
  
  let priceText = $(selectors.price).first().text().trim();
  if (selectors.priceFraction) {
    const fraction = $(selectors.priceFraction).first().text().trim();
    priceText = priceText + "." + fraction;
  }
  const price = parseFloat(priceText.replace(/[^\d.]/g, "")) || 0;

  const imageUrl = $(selectors.image).first().attr("src") || 
                   $(selectors.image).first().attr("data-src") || "";

  const shippingFeeText = selectors.shippingFee 
    ? $(selectors.shippingFee).first().text().trim()
    : "";
  const shippingFee = parseFloat(shippingFeeText.replace(/[^\d.]/g, "")) || 0;

  return {
    title,
    basePrice: price,
    currency,
    shippingFee,
    imageUrl,
    attributes: {},
  };
}
