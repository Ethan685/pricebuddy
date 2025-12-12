import { Card } from "@/shared/ui/Card";
import { formatKrw } from "@/shared/lib/money";

interface PriceCardProps {
  offer: any;
}

export function PriceCard({ offer }: PriceCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{offer.marketplace}</div>
          <div className="text-sm text-slate-400">{offer.url}</div>
        </div>
        <div className="text-right">
          <div className="text-emerald-400 font-bold text-xl">
            {formatKrw(offer.totalPriceKrw)}
          </div>
          <div className="text-xs text-slate-400">
            배송비: {formatKrw(offer.shippingFeeKrw || 0)}
          </div>
        </div>
      </div>
    </Card>
  );
}

