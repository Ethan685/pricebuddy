import { Card } from "@/shared/ui/Card";
import { formatKrw } from "@/shared/lib/money";
import { useLanguage } from "@/shared/context/LanguageContext";
import { httpPost } from "@/shared/lib/http";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface PriceCardProps {
  offer: any;
}

export function PriceCard({ offer }: PriceCardProps) {
  const lang = useLanguage() as any;
  const t =
    typeof lang?.t === "function"
      ? lang.t
      : ((key: string) => key);

  const sellerLabel = offer?.seller || offer?.marketplace || "Store";
  const urlLabel = offer?.url || "";

  const total = offer?.totalPriceKrw ?? offer?.totalPrice ?? offer?.price ?? 0;
  const shipping = offer?.shippingFeeKrw ?? offer?.shippingFee ?? 0;

  const { user } = useAuth();

  const handleClick = async (e: any) => {
    if (e?.preventDefault) e.preventDefault();
    if (e?.stopPropagation) e.stopPropagation();

    if (!offer?.url) return;

    try {
      // If user is logged in, try to generate affiliate link and track
      if (user) {
        const res = await httpPost<{ affiliateLink: string, id: string }>("/api/cashback/click", {
          userId: user.uid,
          productUrl: offer.url,
          marketplace: offer.marketplace || offer.seller, // Fallback
          // productId: offer.productId // If available in offer object
        });

        if (res && res.affiliateLink) {
          window.open(res.affiliateLink, "_blank", "noopener,noreferrer");
          return;
        }
      }
    } catch (error) {
      console.error("Failed to track cashback:", error);
      // Fallback to original URL on error
    }

    // Default: Open original URL
    window.open(offer.url, "_blank", "noopener,noreferrer");
  };


  return (
    <Card className="cursor-pointer hover:bg-surfaceHighlight/50 transition-all duration-200 border border-border group">
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        className="flex items-center justify-between"
        onKeyDown={(e: any) => {
          if (e?.key === "Enter" || e?.key === " ") handleClick(e);
        }}
      >
        <div className="flex-1">
          <div className="font-display font-semibold text-textMain group-hover:text-primary transition-colors">
            {sellerLabel}
          </div>
          <div className="text-sm text-textMuted/70 truncate">{urlLabel}</div>
        </div>

        <div className="text-right ml-4">
          <div className="text-successNeon font-bold text-xl font-display">
            {formatKrw(total)}
          </div>
          <div className="text-xs text-textMuted">
            {t("product.shipping")}: {formatKrw(shipping)}
          </div>
          <div className="text-xs text-primary mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {t("product.clickToVisit")} →
          </div>
        </div>
      </div>
    </Card>
  );
}
