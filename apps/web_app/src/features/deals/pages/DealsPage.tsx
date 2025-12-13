import { useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { formatKrw } from "@/shared/lib/money";
import { formatRelativeTime } from "@/shared/lib/datetime";
import { Link } from "react-router-dom";
import { useDeals } from "../api/useDeals";
import { AsyncBoundary } from "@/shared/ui/AsyncBoundary";
import { SkeletonPage } from "@/shared/ui/Skeleton";
import { useLanguage } from "@/shared/context/LanguageContext";

export function DealsPage() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<"all" | "flash">("all");
  const [sortBy, setSortBy] = useState<"discount" | "price" | "time">("discount");
  const { data, isLoading, error } = useDeals();

  const deals = data?.deals || [];

  const filteredDeals = deals.filter((deal) => {
    if (filter === "flash") return deal.isFlashDeal;
    return true;
  });

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    switch (sortBy) {
      case "discount":
        return b.discountPercent - a.discountPercent;
      case "price":
        return a.discountedPrice - b.discountedPrice;
      case "time":
        return new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime();
      default:
        return 0;
    }
  });

  return (
    <AsyncBoundary isLoading={isLoading} error={error}>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{t("landing.deals.title")}</h1>
          <p className="text-slate-400 mb-6">
            {t("deals.subtitle")}
          </p>

          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "all"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {t("deals.filter.all")}
            </button>
            <button
              onClick={() => setFilter("flash")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "flash"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {t("deal.flash")}
            </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
            >
              <option value="discount">{t("deals.sort.discount")}</option>
              <option value="price">{t("deals.sort.price")}</option>
              <option value="time">{t("deals.sort.time")}</option>
            </select>
          </div>
        </div>

        {/* Deals Grid */}
        {sortedDeals.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-4xl mb-4">🎁</div>
            <p className="text-slate-400">{t("deals.empty")}</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-4 gap-4">
            {sortedDeals.map((deal) => (
              <Link key={deal.id} to={`/products/${deal.productId}`}>
                <Card className="hover:border-emerald-500/40 transition-colors cursor-pointer relative">
                  {deal.isFlashDeal && (
                    <Badge variant="error" className="absolute top-2 right-2">
                      플래시 딜
                    </Badge>
                  )}
                  <div className="bg-slate-800 h-48 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {deal.imageUrl ? (
                      <img
                        src={deal.imageUrl}
                        alt={deal.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <span className={`text-slate-500 ${deal.imageUrl ? "hidden" : ""}`}>
                      {t("common.imagePlaceholder")}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2 line-clamp-2">{deal.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-emerald-400 font-bold text-lg">
                      {formatKrw(deal.discountedPrice)}
                    </span>
                    <span className="text-slate-500 line-through text-sm">
                      {formatKrw(deal.originalPrice)}
                    </span>
                    <Badge variant="error">{-deal.discountPercent}%</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{deal.marketplace}</span>
                    <span>⏰ {formatRelativeTime(deal.validUntil)}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AsyncBoundary>
  );
}
