import { Card } from "@/shared/ui/Card";
import { formatKrw } from "@/shared/lib/money";
import { useLanguage } from "@/shared/context/LanguageContext";

interface CostBreakdownProps {
    basePrice: number;
    shipping: number;
    tax: number;
    duty: number;
    currency: string;
}

export function TotalCostCalculator({ basePrice, shipping, tax, duty, currency }: CostBreakdownProps) {
    const { t } = useLanguage();
    const total = basePrice + shipping + tax + duty;

    return (
        <Card className="bg-surface/90 backdrop-blur-md border border-primary/20 shadow-neon-blue/10 overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-surfaceHighlight/30">
                <h3 className="text-lg font-display font-bold text-textMain flex items-center justify-between">
                    <span>{t("product.costBreakdown.title") || "Total Landed Cost"}</span>
                    <span className="text-2xl text-primary animate-pulse-slow">{formatKrw(total)}</span>
                </h3>
            </div>

            <div className="p-4 space-y-3">
                {/* Base Price */}
                <div className="flex justify-between items-center text-sm">
                    <span className="text-textMuted">{t("product.costBreakdown.basePrice") || "Base Price"}</span>
                    <span className="text-textMain font-medium">{formatKrw(basePrice)}</span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between items-center text-sm">
                    <span className="text-textMuted">{t("product.costBreakdown.shipping") || "Shipping"}</span>
                    <span className="text-textMain font-medium"> + {formatKrw(shipping)}</span>
                </div>

                {/* Tax & Duty */}
                <div className="flex justify-between items-center text-sm">
                    <span className="text-textMuted">{t("product.costBreakdown.tax") || "Tax & Duty"}</span>
                    <span className="text-textMain font-medium"> + {formatKrw(tax + duty)}</span>
                </div>

                {/* Divider */}
                <div className="h-px bg-border/50 my-2"></div>

                {/* Final Verdict */}
                <div className="flex justify-between items-center pt-1">
                    <span className="text-successNeon font-bold text-sm tracking-wide">
                        {t("product.costBreakdown.verdict") || "YOU PAY (FINAL)"}
                    </span>
                    <span className="text-xl font-bold text-successNeon">{formatKrw(total)}</span>
                </div>
            </div>
        </Card>
    );
}
