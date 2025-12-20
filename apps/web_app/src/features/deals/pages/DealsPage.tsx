import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { formatKrw } from "@/shared/lib/money";
import { formatRelativeTime } from "@/shared/lib/datetime";
import { Link } from "react-router-dom";
import { useDeals } from "../api/useDeals";
import { AsyncBoundary } from "@/shared/ui/AsyncBoundary";
import { SkeletonPage } from "@/shared/ui/Skeleton";

export function DealsPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<"all" | "flash">("all");
  const [sortBy, setSortBy] = useState<"discount" | "price" | "time">("discount");
  const { deals, loading: isLoading, error } = useDeals();

  const filteredDeals = deals.filter((deal) => {
    if (filter === "flash") return deal.isFlashDeal;
    return true;
  });

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    switch (sortBy) {
      case "discount":
        return (b.discountPercent || 0) - (a.discountPercent || 0);
      case "price":
        return (a.discountedPrice || a.price || 0) - (b.discountedPrice || b.price || 0);
      case "time":
        if (!a.validUntil || !b.validUntil) return 0;
        return new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime();
      default:
        return 0;
    }
  });

  return (
    <AsyncBoundary isLoading={isLoading} error={error ? (typeof error === "string" ? error : error.message || "An error occurred") : null}>
      <div>
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-successNeon bg-clip-text text-transparent">
            {t("landing.deals.title", { defaultValue: "Deals" })}
          </h1>
          <p className="text-textMuted text-lg mb-8">
            {t("deals.subtitle", { defaultValue: "Find the best deals and discounts" })}
          </p>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-6 py-2 rounded-lg transition-all font-medium ${
                  filter === "all"
                    ? "bg-primary text-white shadow-neon-blue"
                    : "bg-surfaceHighlight text-textMain hover:bg-border border border-border"
                }`}
              >
                {t("deals.filter.all", { defaultValue: "All" })}
              </button>
              <button
                onClick={() => setFilter("flash")}
                className={`px-6 py-2 rounded-lg transition-all font-medium ${
                  filter === "flash"
                    ? "bg-primary text-white shadow-neon-blue"
                    : "bg-surfaceHighlight text-textMain hover:bg-border border border-border"
                }`}
              >
                🔥 {t("deal.flash", { defaultValue: "Flash Deal" })}
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-6 py-2 rounded-lg bg-surfaceHighlight border border-border text-textMain focus:ring-2 focus:ring-primary/50 outline-none font-medium"
            >
              <option value="discount">{t("deals.sort.discount", { defaultValue: "Discount" })}</option>
              <option value="price">{t("deals.sort.price", { defaultValue: "Price" })}</option>
              <option value="time">{t("deals.sort.time", { defaultValue: "Time" })}</option>
            </select>
          </div>
        </div>

        {/* Deals Grid */}
        {sortedDeals.length === 0 ? (
          <Card className="text-center py-16">
            <div className="text-6xl mb-6">🎁</div>
            <p className="text-textMuted text-lg mb-4">{t("deals.empty", { defaultValue: "No deals available" })}</p>
            <Link to="/search">
              <Button variant="primary">Start Searching</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedDeals.map((deal) => (
              <Link key={deal.id} to={`/products/${deal.productId || deal.id}`} className="group">
                <Card className="hover:border-primary/50 transition-all duration-300 cursor-pointer relative h-full hover:shadow-neon-blue/20 hover:-translate-y-1">
                  {deal.isFlashDeal && (
                    <Badge variant="error" className="absolute top-3 right-3 z-10 animate-pulse-slow shadow-lg">
                      🔥 {t("deal.flash", { defaultValue: "Flash" })}
                    </Badge>
                  )}
                  <div className="bg-surface h-48 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
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
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-successNeon/20 flex items-center justify-center">
                        <span className="text-5xl">📦</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold mb-3 line-clamp-2 text-lg group-hover:text-primary transition-colors">{deal.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-successNeon font-bold text-xl">
                      {formatKrw(deal.discountedPrice || deal.price || 0)}
                    </span>
                    {deal.originalPrice && deal.originalPrice > (deal.discountedPrice || deal.price || 0) && (
                      <>
                        <span className="text-textMuted line-through text-sm">
                          {formatKrw(deal.originalPrice)}
                        </span>
                        {deal.discountPercent && (
                          <Badge variant="error" className="text-xs">
                            -{deal.discountPercent}%
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-textMuted pt-3 border-t border-border/30">
                    <span className="font-medium">{deal.marketplace || "Global"}</span>
                    {deal.validUntil && (
                      <span className="flex items-center gap-1">
                        <span>⏰</span>
                        <span>{formatRelativeTime(deal.validUntil)}</span>
                      </span>
                    )}
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
