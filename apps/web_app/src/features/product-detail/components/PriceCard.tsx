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
    <div
      className="cursor-pointer hover:bg-slate-800/50 transition-colors rounded-lg border border-slate-700 bg-slate-900/60 p-4"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick(e as any);
        }
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-semibold">{offer.marketplace}</div>
          <div className="text-sm text-slate-400 truncate">{offer.url}</div>
        </div>
        <div className="text-right ml-4">
          <div className="text-emerald-400 font-bold text-xl">
            {formatKrw(offer.totalPriceKrw || offer.totalPrice || offer.price || 0)}
          </div>
          <div className="text-xs text-slate-400">
            {t("product.shipping")}: {formatKrw(offer.shippingFeeKrw || offer.shippingFee || 0)}
          </div>
          <div className="text-xs text-emerald-400 mt-1">
            {t("product.clickToVisit")} →
          </div>
        </div>
      </div>
    </div>
  );
}

