import { Link } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { formatKrw } from "@/shared/lib/money";
import { formatRelativeTime } from "@/shared/lib/datetime";
import { useWishlist, useRemoveFromWishlist } from "../api/useWishlist";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { AsyncBoundary } from "@/shared/ui/AsyncBoundary";
import { SkeletonPage } from "@/shared/ui/Skeleton";
import { useTranslation } from "react-i18next";

export function WishlistPage() {
  const { user } = useAuthContext();
  const { t } = useTranslation();
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
      <div className="text-center py-20">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-6">📋</div>
          <h2 className="text-2xl font-bold mb-4 text-textMain">{t("wishlist.title", { defaultValue: "My Wishlist" })}</h2>
          <p className="text-textMuted mb-8 text-lg">{t("auth.loginRequired", { defaultValue: "Please log in to view your wishlist" })}</p>
          <Link to="/login">
            <Button variant="primary" className="px-8 py-3 text-lg">
              {t("auth.loginButton", { defaultValue: "Login" })}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AsyncBoundary isLoading={isLoading} error={error}>
      <div>
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-primary to-successNeon bg-clip-text text-transparent">
            {t("wishlist.title", { defaultValue: "My Wishlist" })}
          </h1>
          <p className="text-xl text-textMuted">
            {t("wishlist.subtitle", { defaultValue: "Products you've saved for later" })}
          </p>
        </div>

        {items.length === 0 ? (
          <Card className="text-center py-20">
            <div className="text-8xl mb-6">📋</div>
            <h2 className="text-2xl font-bold mb-4 text-textMain">{t("wishlist.empty", { defaultValue: "Your wishlist is empty" })}</h2>
            <p className="text-textMuted mb-8">Start adding products to your wishlist to track prices and deals</p>
            <Link to="/search">
              <Button variant="primary" className="px-8 py-3 text-lg">
                {t("wishlist.searchButton", { defaultValue: "Start Searching" })}
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="relative group hover:border-primary/50 transition-all duration-300 hover:shadow-neon-blue/20 hover:-translate-y-1">
                <button
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-surface/90 backdrop-blur-sm border border-border/50 text-textMuted hover:text-red-400 hover:bg-red-500/20 hover:border-red-400/50 transition-all duration-300 flex items-center justify-center shadow-lg"
                  aria-label={t("wishlist.removeAriaLabel", { defaultValue: "Remove from wishlist" })}
                >
                  ✕
                </button>
                <Link to={`/products/${item.productId}`} className="block">
                  <div className="bg-gradient-to-br from-surfaceHighlight to-surface h-48 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-successNeon/20 flex items-center justify-center">
                        <span className="text-6xl opacity-50">📦</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-3 line-clamp-2 text-lg group-hover:text-primary transition-colors min-h-[3rem]">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-successNeon font-black text-2xl">
                        {formatKrw(item.minPriceKrw)}
                      </span>
                      {item.priceChangePct !== undefined && (
                        <span
                          className={`text-sm font-bold px-2 py-1 rounded ${
                            item.priceChangePct < 0 
                              ? "text-successNeon bg-successNeon/20" 
                              : "text-red-400 bg-red-500/20"
                          }`}
                        >
                          {item.priceChangePct > 0 ? "+" : ""}
                          {item.priceChangePct.toFixed(1)}%
                        </span>
                      )}
                    </div>
                    {item.maxPriceKrw > item.minPriceKrw && (
                      <div className="text-sm text-textMuted mb-2">
                        {t("wishlist.maxPrice", { defaultValue: "Max" })}: {formatKrw(item.maxPriceKrw)}
                      </div>
                    )}
                    <div className="text-xs text-textMuted pt-3 border-t border-border/30">
                      {t("wishlist.addedAt", { defaultValue: "Added" })}: {formatRelativeTime(item.addedAt)}
                    </div>
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
