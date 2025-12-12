import { PricingInput, PricingOutput } from "@pricebuddy/core";
import { TAX_RULES } from "./data/tax-rules";
import { SHIPPING_RULES } from "./data/shipping-rules";
import { getRates } from "./forex/rates-store";

export function computePrice(input: PricingInput): PricingOutput {
  const rates = getRates();
  const fx = input.currency === "KRW" ? 1 : (rates[input.currency] ?? 1);

  const itemKrw = input.basePrice * fx;

  const shipRule = SHIPPING_RULES.find(
    r => r.marketplace === input.marketplace
  );
  if (!shipRule) {
    throw new Error(`No shipping rule for ${input.marketplace}`);
  }

  const weight = input.weightKg ?? 1;
  const shipping = shipRule.baseFee + shipRule.perKgFee * weight;

  const taxRule = TAX_RULES.find(r => r.country === input.country);
  if (!taxRule) {
    throw new Error(`No tax rule for ${input.country}`);
  }

  const taxable = Math.max(0, itemKrw + shipping - taxRule.thresholdKrw);
  const tax = taxable * taxRule.rate;

  return {
    itemPriceKrw: Math.round(itemKrw),
    shippingFeeKrw: Math.round(shipping),
    taxFeeKrw: Math.round(tax),
    totalPriceKrw: Math.round(itemKrw + shipping + tax),
  };
}

