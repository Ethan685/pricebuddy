import { Card } from "@/shared/ui/Card";
import { formatKrw } from "@/shared/lib/money";
import { formatDateTime } from "@/shared/lib/datetime";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { usePurchases } from "../api/usePurchases";
import { AsyncBoundary } from "@/shared/ui/AsyncBoundary";
import { SkeletonPage } from "@/shared/ui/Skeleton";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function PurchaseHistoryPage() {
  const { user } = useAuthContext();
  const { t } = useTranslation();
  const { data, isLoading, error } = usePurchases(user?.uid);

  const purchases = data?.purchases || [];
  const totalSaved = data?.totalSaved || 0;
  const averageSavedPercent = data?.averageSavedPercent || 0;

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 mb-4">{t("auth.loginRequired")}</p>
        <Link to="/login" className="text-emerald-400 hover:underline">
          {t("auth.loginButton")}
        </Link>
      </div>
    );
  }

  return (
    <AsyncBoundary isLoading={isLoading} error={error}>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("purchases.title")}</h1>
          <p className="text-slate-400">
            {t("purchases.subtitle")}
          </p>
        </div>

        {/* Summary Card */}
        <Card className="mb-6 bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border-emerald-500/40">
          <div className="grid grid-cols-3 gap-4 text-center py-6">
            <div>
              <div className="text-sm text-slate-400 mb-1">{t("purchases.stats.totalCount")}</div>
              <div className="text-2xl font-bold">{purchases.length}{t("purchases.stats.countUnit")}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">{t("purchases.stats.totalSaved")}</div>
              <div className="text-2xl font-bold text-emerald-400">
                {formatKrw(totalSaved)}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">{t("purchases.stats.averageSaved")}</div>
              <div className="text-2xl font-bold text-emerald-400">
                {averageSavedPercent > 0 ? averageSavedPercent.toFixed(1) : "0"}%
              </div>
            </div>
          </div>
        </Card>

        {/* Purchase List */}
        {purchases.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-4xl mb-4">🛒</div>
            <p className="text-slate-400 mb-4">{t("purchases.empty")}</p>
            <Link to="/search">
              <button className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">
                {t("wishlist.searchButton")}
              </button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <Link key={purchase.id} to={`/products/${purchase.productId}`}>
                <Card className="hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        {purchase.productTitle}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>{purchase.marketplace}</span>
                        <span>{formatDateTime(purchase.purchasedAt)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 text-sm line-through mb-1">
                        {formatKrw(purchase.originalPrice || purchase.purchasePrice)}
                      </div>
                      <div className="text-emerald-400 font-bold text-lg mb-1">
                        {formatKrw(purchase.purchasePrice)}
                      </div>
                      <div className="text-emerald-400 text-sm font-semibold">
                        {t("purchases.saved")}: {formatKrw(purchase.savedAmount)}
                      </div>
                    </div>
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
