import { Card } from "@/shared/ui/Card";
import { formatKrw } from "@/shared/lib/money";
import { useLanguage } from "@/shared/context/LanguageContext";

interface PriceCardProps {
  offer: any;
}

export function PriceCard({ offer }: PriceCardProps) {
  const { t } = useLanguage();
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (offer.url) {
      console.log("Opening URL:", offer.url);
      window.open(offer.url, "_blank", "noopener,noreferrer");
    } else {
      console.warn("No URL available for offer:", offer);
    }
  };

  return (
    <Card
      className="cursor-pointer hover:bg-surfaceHighlight/50 transition-all duration-200 border border-border group"
    // Remove onClick logic from here if Card doesn't forward props properly, but Card wraps a div so it should be fine to wrap Card in a div or pass props if supported. 
    // Actually Card accepts className and children. Let's wrap the content in a div that handles the click to be safe, or just use the div inside structure.
    // Better yet, let's keep the div structure but use the glassmorphism classes directly or use the Card component if it allows props.
    // The current Card implementation accepts children and className.
    >
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        className="flex items-center justify-between"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleClick(e as any);
          }
        }}
      >
        <div className="flex-1">
          <div className="font-display font-semibold text-textMain group-hover:text-primary transition-colors">{offer.marketplace}</div>
          <div className="text-sm text-textMuted/70 truncate">{offer.url}</div>
        </div>
        <div className="text-right ml-4">
          <div className="text-successNeon font-bold text-xl font-display">
            {formatKrw(offer.totalPriceKrw || offer.totalPrice || offer.price || 0)}
          </div>
          <div className="text-xs text-textMuted">
            {t("product.shipping")}: {formatKrw(offer.shippingFeeKrw || offer.shippingFee || 0)}
          </div>
          <div className="text-xs text-primary mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {t("product.clickToVisit")} →
          </div>
        </div>
      </div>
    </Card>
  );
}

