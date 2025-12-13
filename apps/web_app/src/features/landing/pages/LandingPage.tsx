import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { formatKrw } from "@/shared/lib/money";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useDeals } from "@/features/deals/api/useDeals";
import { AsyncBoundary } from "@/shared/ui/AsyncBoundary";

export function LandingPage() {
  const { t } = useLanguage();
  const { data: dealsData, isLoading: dealsLoading } = useDeals();
  const deals = dealsData?.deals || [];
  const displayDeals = deals.slice(0, 4); // 최대 4개만 표시

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
          {t("landing.hero.title")}
        </h1>
        <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
          {t("landing.hero.subtitle")}
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/search">
            <Button variant="primary" className="text-lg px-8 py-3">
              {t("landing.hero.startButton")}
            </Button>
          </Link>
          <Link to="/deals">
            <Button variant="secondary" className="text-lg px-8 py-3">
              {t("landing.hero.dealsButton")}
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-3 gap-8 text-center">
        <div>
          <div className="text-4xl font-bold text-emerald-400 mb-2">{t("landing.stats.productsValue")}</div>
          <div className="text-slate-400">{t("landing.stats.products")}</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-emerald-400 mb-2">{t("landing.stats.usersValue")}</div>
          <div className="text-slate-400">{t("landing.stats.users")}</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-emerald-400 mb-2">{t("landing.stats.savingsValue")}</div>
          <div className="text-slate-400">{t("landing.stats.savings")}</div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12">{t("landing.features.title")}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">{t("landing.features.comparison.title")}</h3>
            <p className="text-slate-400">
              {t("landing.features.comparison.desc")}
            </p>
          </Card>
          <Card>
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">{t("landing.features.ai.title")}</h3>
            <p className="text-slate-400">
              {t("landing.features.ai.desc")}
            </p>
          </Card>
          <Card>
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">{t("landing.features.cashback.title")}</h3>
            <p className="text-slate-400">
              {t("landing.features.cashback.desc")}
            </p>
          </Card>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">{t("landing.howToUse.title")}</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="text-center p-6">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="font-semibold mb-2">{t("landing.howToUse.step1.title")}</h3>
            <p className="text-sm text-slate-400">{t("landing.howToUse.step1.desc")}</p>
          </Card>
          <Card className="text-center p-6">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="font-semibold mb-2">{t("landing.howToUse.step2.title")}</h3>
            <p className="text-sm text-slate-400">{t("landing.howToUse.step2.desc")}</p>
          </Card>
          <Card className="text-center p-6">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="font-semibold mb-2">{t("landing.howToUse.step3.title")}</h3>
            <p className="text-sm text-slate-400">{t("landing.howToUse.step3.desc")}</p>
          </Card>
          <Card className="text-center p-6">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="font-semibold mb-2">{t("landing.howToUse.step4.title")}</h3>
            <p className="text-sm text-slate-400">{t("landing.howToUse.step4.desc")}</p>
          </Card>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="py-16 bg-slate-900/50 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center mb-8">{t("landing.categories.title")}</h2>
        <p className="text-center text-slate-400 mb-8 max-w-2xl mx-auto">
          {t("landing.categories.subtitle")}
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-2xl">📱</div>
              <div>
                <h3 className="font-semibold">{t("landing.categories.category1.title")}</h3>
                <p className="text-sm text-slate-400">{t("landing.categories.category1.desc")}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl">💻</div>
              <div>
                <h3 className="font-semibold">{t("landing.categories.category2.title")}</h3>
                <p className="text-sm text-slate-400">{t("landing.categories.category2.desc")}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl">🎧</div>
              <div>
                <h3 className="font-semibold">{t("landing.categories.category3.title")}</h3>
                <p className="text-sm text-slate-400">{t("landing.categories.category3.desc")}</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Today's Deals Preview */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">{t("landing.deals.title")}</h2>
          <Link to="/deals">
            <Button variant="secondary">{t("landing.deals.viewAll")}</Button>
          </Link>
        </div>
        {dealsLoading ? (
          <div className="grid md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="bg-slate-800 h-32 rounded-lg mb-3"></div>
                <div className="h-4 bg-slate-700 rounded mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-2/3"></div>
              </Card>
            ))}
          </div>
        ) : displayDeals.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-slate-400">{t("common.loading")}</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-4 gap-4">
            {displayDeals.map((deal) => (
              <Link key={deal.id} to={`/products/${deal.productId}`}>
                <Card className="hover:border-emerald-500/40 transition-colors cursor-pointer relative">
                  {deal.isFlashDeal && (
                    <Badge variant="error" className="absolute top-2 right-2 z-10">
                      {t("deal.flash")}
                    </Badge>
                  )}
                  <div className="bg-slate-800 h-32 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
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
                    <span className={`text-slate-500 text-sm ${deal.imageUrl ? "hidden" : ""}`}>
                      {t("common.imagePlaceholder")}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2 line-clamp-2">{deal.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-emerald-400 font-bold">
                      {formatKrw(deal.discountedPrice)}
                    </span>
                    <span className="text-slate-500 line-through text-sm">
                      {formatKrw(deal.originalPrice)}
                    </span>
                    <Badge variant="error" className="text-xs">
                      -{deal.discountPercent}%
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-400">{deal.marketplace}</div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="text-center py-16 bg-slate-900/60 rounded-xl">
        <h2 className="text-3xl font-bold mb-4">{t("landing.cta.title")}</h2>
        <p className="text-slate-400 mb-8">
          {t("landing.cta.subtitle")}
        </p>
        <Link to="/search">
          <Button variant="primary" className="text-lg px-8 py-3">
            {t("landing.cta.button")}
          </Button>
        </Link>
      </section>
    </div>
  );
}

