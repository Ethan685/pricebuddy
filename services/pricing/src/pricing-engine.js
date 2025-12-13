"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computePrice = computePrice;
const tax_rules_1 = require("./data/tax-rules");
const shipping_rules_1 = require("./data/shipping-rules");
const rates_store_1 = require("./forex/rates-store");
function computePrice(input) {
    const rates = (0, rates_store_1.getRates)();
    const fx = input.currency === "KRW" ? 1 : (rates[input.currency] ?? 1);
    const itemKrw = input.basePrice * fx;
    const shipRule = shipping_rules_1.SHIPPING_RULES.find(r => r.marketplace === input.marketplace);
    if (!shipRule) {
        throw new Error(`No shipping rule for ${input.marketplace}`);
    }
    const weight = input.weightKg ?? 1;
    const shipping = shipRule.baseFee + shipRule.perKgFee * weight;
    const taxRule = tax_rules_1.TAX_RULES.find(r => r.country === input.country);
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
//# sourceMappingURL=pricing-engine.js.map