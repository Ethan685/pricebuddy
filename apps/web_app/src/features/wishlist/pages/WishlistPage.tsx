import { Link } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { formatKrw } from "@/shared/lib/money";
import { formatRelativeTime } from "@/shared/lib/datetime";
import { useWishlist, useRemoveFromWishlist } from "../api/useWishlist";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { AsyncBoundary } from "@/shared/ui/AsyncBoundary";
import { SkeletonPage } from "@/shared/ui/Skeleton";
import { useLanguage } from "@/shared/context/LanguageContext";

export function WishlistPage() {
  const { user } = useAuthContext();
  const { t } = useLanguage();
  const { data, isLoading, error } = useWishlist(user?.uid);
  const removeFromWishlist = useRemoveFromWishlist();

  const items = data?.items || [];

  const handleRemove = async (id: string) => {
    if (!user) return;
    try {
      await removeFromWishlist.mutateAsync({ userId: user.uid, itemId: id });
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      alert(t("wishlist.removeError"));
    }
  };

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
          <h1 className="text-3xl font-bold mb-2">{t("nav.wishlist")}</h1>
          <p className="text-slate-400">
            {t("wishlist.subtitle")}
          </p>
        </div>

        {items.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-slate-400 mb-4">{t("wishlist.empty")}</p>
            <Link to="/search">
              <Button variant="primary">{t("wishlist.searchButton")}</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card key={item.id} className="relative">
                <button
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-red-400 transition-colors"
                  aria-label={t("wishlist.removeAriaLabel")}
                >
                  ✕
                </button>
                <Link to={`/products/${item.productId}`}>
                  <div className="bg-slate-800 h-32 rounded-lg mb-3 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-slate-500">{t("common.imagePlaceholder")}</span>
                    )}
                  </div>
                  <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-emerald-400 font-bold">
                      {formatKrw(item.minPriceKrw)}
                    </span>
                    {item.priceChangePct !== undefined && (
                      <span
                        className={`text-sm ${
                          item.priceChangePct < 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {item.priceChangePct > 0 ? "+" : ""}
                        {item.priceChangePct.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  {item.maxPriceKrw > item.minPriceKrw && (
                    <div className="text-xs text-slate-400">
                      {t("wishlist.maxPrice")}: {formatKrw(item.maxPriceKrw)}
                    </div>
                  )}
                  <div className="text-xs text-slate-400 mt-1">
                    {t("wishlist.addedAt")}: {formatRelativeTime(item.addedAt)}
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AsyncBoundary>
  );
}
