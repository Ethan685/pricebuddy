import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { formatKrw } from "@/shared/lib/money";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useDeals } from "@/features/deals/api/useDeals";
import { AsyncBoundary } from "@/shared/ui/AsyncBoundary";
import { OnboardingWizard } from "../components/OnboardingWizard";

export function LandingPage() {
  const { t } = useLanguage();
  const { data: dealsData, isLoading: dealsLoading } = useDeals();
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasOnboarded = localStorage.getItem("pricebuddy_onboarded");
    if (!hasOnboarded) {
      // Small delay to let fade-in happen first
      const timer = setTimeout(() => setShowWizard(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleOnboardingComplete = (interests: string[]) => {
    console.log("Selected interests:", interests);
    localStorage.setItem("pricebuddy_onboarded", "true");
    localStorage.setItem("pricebuddy_interests", JSON.stringify(interests));
    setShowWizard(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem("pricebuddy_onboarded", "true");
    setShowWizard(false);
  };

  const deals = dealsData?.deals || [];
  const displayDeals = deals.slice(0, 4); // 최대 4개만 표시

  return (
    <div className="space-y-16">
      {/* Onboarding Wizard Modal */}
      {showWizard && (
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-5xl font-display font-bold mb-4 bg-gradient-to-r from-successNeon to-primary bg-clip-text text-transparent animate-fade-in">
          {t("landing.hero.title")}
        </h1>
        <p className="text-xl text-textMuted mb-8 max-w-2xl mx-auto animate-fade-in delay-[200ms]">
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
      <section className="grid grid-cols-3 gap-8 text-center animate-slide-up delay-[400ms]">
        <div>
          <div className="text-4xl font-bold text-successNeon mb-2">{t("landing.stats.productsValue")}</div>
          <div className="text-textMuted">{t("landing.stats.products")}</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-successNeon mb-2">{t("landing.stats.usersValue")}</div>
          <div className="text-textMuted">{t("landing.stats.users")}</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-successNeon mb-2">{t("landing.stats.savingsValue")}</div>
          <div className="text-textMuted">{t("landing.stats.savings")}</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="animate-slide-up delay-[600ms]">
        <h2 className="text-3xl font-bold text-center mb-12">{t("landing.features.title")}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">{t("landing.features.comparison.title")}</h3>
            <p className="text-textMuted">
              {t("landing.features.comparison.desc")}
            </p>
          </Card>
          <Card>
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">{t("landing.features.ai.title")}</h3>
            <p className="text-textMuted">
              {t("landing.features.ai.desc")}
            </p>
          </Card>
          <Card>
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">{t("landing.features.cashback.title")}</h3>
            <p className="text-textMuted">
              {t("landing.features.cashback.desc")}
            </p>
          </Card>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-16 animate-slide-up delay-[800ms]">
        <h2 className="text-3xl font-bold text-center mb-12">{t("landing.howToUse.title")}</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="text-center p-6">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="font-semibold mb-2">{t("landing.howToUse.step1.title")}</h3>
            <p className="text-sm text-textMuted">{t("landing.howToUse.step1.desc")}</p>
          </Card>
          <Card className="text-center p-6">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="font-semibold mb-2">{t("landing.howToUse.step2.title")}</h3>
            <p className="text-sm text-textMuted">{t("landing.howToUse.step2.desc")}</p>
          </Card>
          <Card className="text-center p-6">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="font-semibold mb-2">{t("landing.howToUse.step3.title")}</h3>
            <p className="text-sm text-textMuted">{t("landing.howToUse.step3.desc")}</p>
          </Card>
          <Card className="text-center p-6">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="font-semibold mb-2">{t("landing.howToUse.step4.title")}</h3>
            <p className="text-sm text-textMuted">{t("landing.howToUse.step4.desc")}</p>
          </Card>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="py-16 bg-surface/50 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center mb-8">{t("landing.categories.title")}</h2>
        <p className="text-center text-textMuted mb-8 max-w-2xl mx-auto">
          {t("landing.categories.subtitle")}
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-successNeon/20 flex items-center justify-center text-2xl">📱</div>
              <div>
                <h3 className="font-semibold">{t("landing.categories.category1.title")}</h3>
                <p className="text-sm text-textMuted">{t("landing.categories.category1.desc")}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl">💻</div>
              <div>
                <h3 className="font-semibold">{t("landing.categories.category2.title")}</h3>
                <p className="text-sm text-textMuted">{t("landing.categories.category2.desc")}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl">🎧</div>
              <div>
                <h3 className="font-semibold">{t("landing.categories.category3.title")}</h3>
                <p className="text-sm text-textMuted">{t("landing.categories.category3.desc")}</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Today's Deals Preview (Carousel) */}
      <section className="animate-slide-up delay-[1000ms]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">{t("landing.deals.title")}</h2>
          <Link to="/deals">
            <Button variant="secondary">{t("landing.deals.viewAll")}</Button>
          </Link>
        </div>
        {dealsLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse min-w-[280px]">
                <div className="bg-surface h-32 rounded-lg mb-3"></div>
                <div className="h-4 bg-surfaceHighlight rounded mb-2"></div>
                <div className="h-4 bg-surfaceHighlight rounded w-2/3"></div>
              </Card>
            ))}
          </div>
        ) : displayDeals.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-textMuted">{t("common.loading")}</p>
          </Card>
        ) : (
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
            {displayDeals.map((deal) => (
              <Link key={deal.id} to={`/products/${deal.productId}`} className="min-w-[280px] snap-center">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer relative h-full">
                  {deal.isFlashDeal && (
                    <Badge variant="error" className="absolute top-2 right-2 z-10 animate-pulse-slow">
                      {t("deal.flash")}
                    </Badge>
                  )}
                  <div className="bg-surface h-32 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative group">
                    {deal.imageUrl ? (
                      <img
                        src={deal.imageUrl}
                        alt={deal.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <span className={`text-textMuted text-sm ${deal.imageUrl ? "hidden" : ""}`}>
                      {t("common.imagePlaceholder")}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2 line-clamp-2">{deal.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-successNeon font-bold">
                      {formatKrw(deal.discountedPrice)}
                    </span>
                    <span className="text-textMuted line-through text-sm">
                      {formatKrw(deal.originalPrice)}
                    </span>
                    <Badge variant="error" className="text-xs">
                      -{deal.discountPercent}%
                    </Badge>
                  </div>
                  <div className="text-xs text-textMuted">{deal.marketplace}</div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="text-center py-16 bg-surface/60 rounded-xl">
        <h2 className="text-3xl font-bold mb-4">{t("landing.cta.title")}</h2>
        <p className="text-textMuted mb-8">
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

