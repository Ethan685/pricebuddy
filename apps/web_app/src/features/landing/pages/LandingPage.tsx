import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { formatKrw } from "@/shared/lib/money";
import { useDeals } from "@/features/deals/api/useDeals";
import { AsyncBoundary } from "@/shared/ui/AsyncBoundary";
import { OnboardingWizard } from "../components/OnboardingWizard";

export function LandingPage() {
  const { t } = useTranslation();
  const { deals: dealsData, loading: dealsLoading } = useDeals(8);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    const hasOnboarded = localStorage.getItem("pricebuddy_onboarded");
    if (!hasOnboarded) {
      const timer = setTimeout(() => setShowWizard(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleOnboardingComplete = (interests: string[]) => {
    localStorage.setItem("pricebuddy_onboarded", "true");
    localStorage.setItem("pricebuddy_interests", JSON.stringify(interests));
    setShowWizard(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem("pricebuddy_onboarded", "true");
    setShowWizard(false);
  };

  const deals = dealsData?.deals || [];
  const displayDeals = deals.slice(0, 4);

  return (
    <div className="min-h-screen">
      {showWizard && (
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      {/* Hero Section - Full Width with Gradient */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/30 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-successNeon/30 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-display font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-primary via-successNeon to-primary bg-clip-text text-transparent animate-gradient">
                {t("landing.hero.title")}
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-textMuted mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              {t("landing.hero.subtitle")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20 animate-fade-in delay-[200ms]">
            <Link to="/search">
              <Button 
                variant="primary" 
                className="text-xl px-12 py-6 rounded-2xl shadow-neon-blue hover:shadow-neon-blue/50 transform hover:scale-110 transition-all duration-300 font-bold"
              >
                {t("landing.hero.startButton")} →
              </Button>
            </Link>
            <Link to="/deals">
              <Button 
                variant="secondary" 
                className="text-xl px-12 py-6 rounded-2xl hover:scale-110 transition-all duration-300 font-bold"
              >
                {t("landing.hero.dealsButton")}
              </Button>
            </Link>
          </div>

          {/* Stats - Large Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto animate-slide-up delay-[400ms]">
            <Card className="p-10 text-center hover:border-primary/50 transition-all hover:scale-105 hover:shadow-neon-blue/20">
              <div className="text-7xl font-black text-successNeon mb-4 font-display">{t("landing.stats.productsValue")}</div>
              <div className="text-xl text-textMuted font-medium">{t("landing.stats.products")}</div>
            </Card>
            <Card className="p-10 text-center hover:border-primary/50 transition-all hover:scale-105 hover:shadow-neon-blue/20">
              <div className="text-7xl font-black text-successNeon mb-4 font-display">{t("landing.stats.usersValue")}</div>
              <div className="text-xl text-textMuted font-medium">{t("landing.stats.users")}</div>
            </Card>
            <Card className="p-10 text-center hover:border-primary/50 transition-all hover:scale-105 hover:shadow-neon-blue/20">
              <div className="text-7xl font-black text-successNeon mb-4 font-display">{t("landing.stats.savingsValue")}</div>
              <div className="text-xl text-textMuted font-medium">{t("landing.stats.savings")}</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features - Modern Grid */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-6xl font-black text-center mb-20 bg-gradient-to-r from-textMain to-textMuted bg-clip-text text-transparent">
            {t("landing.features.title")}
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            <Card className="p-10 hover:border-primary/50 transition-all hover:scale-105 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="text-7xl mb-8 group-hover:scale-110 transition-transform duration-300">🔍</div>
                <h3 className="text-3xl font-bold mb-6 group-hover:text-primary transition-colors">{t("landing.features.comparison.title")}</h3>
                <p className="text-lg text-textMuted leading-relaxed">
                  {t("landing.features.comparison.desc")}
                </p>
              </div>
            </Card>
            <Card className="p-10 hover:border-primary/50 transition-all hover:scale-105 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-successNeon/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="text-7xl mb-8 group-hover:scale-110 transition-transform duration-300">📊</div>
                <h3 className="text-3xl font-bold mb-6 group-hover:text-primary transition-colors">{t("landing.features.ai.title")}</h3>
                <p className="text-lg text-textMuted leading-relaxed">
                  {t("landing.features.ai.desc")}
                </p>
              </div>
            </Card>
            <Card className="p-10 hover:border-primary/50 transition-all hover:scale-105 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="text-7xl mb-8 group-hover:scale-110 transition-transform duration-300">💰</div>
                <h3 className="text-3xl font-bold mb-6 group-hover:text-primary transition-colors">{t("landing.features.cashback.title")}</h3>
                <p className="text-lg text-textMuted leading-relaxed">
                  {t("landing.features.cashback.desc")}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works - Step by Step */}
      <section className="py-32 bg-surface/30 relative">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-6xl font-black text-center mb-20 bg-gradient-to-r from-textMain to-textMuted bg-clip-text text-transparent">
            {t("landing.howToUse.title")}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "🔍", title: t("landing.howToUse.step1.title"), desc: t("landing.howToUse.step1.desc") },
              { icon: "📊", title: t("landing.howToUse.step2.title"), desc: t("landing.howToUse.step2.desc") },
              { icon: "🔔", title: t("landing.howToUse.step3.title"), desc: t("landing.howToUse.step3.desc") },
              { icon: "💰", title: t("landing.howToUse.step4.title"), desc: t("landing.howToUse.step4.desc") },
            ].map((step, idx) => (
              <Card key={idx} className="text-center p-10 hover:border-primary/50 transition-all hover:scale-105 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">{step.icon}</div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">{step.title}</h3>
                  <p className="text-textMuted leading-relaxed">{step.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Deals Section - Carousel */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-6xl font-black bg-gradient-to-r from-textMain to-textMuted bg-clip-text text-transparent">
              {t("landing.deals.title")}
            </h2>
            <Link to="/deals">
              <Button variant="secondary" className="text-lg px-8 py-4 rounded-xl hover:scale-105 transition-transform">
                {t("landing.deals.viewAll")} →
              </Button>
            </Link>
          </div>

          {dealsLoading ? (
            <div className="grid md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="bg-surface h-64 rounded-xl mb-4" />
                  <div className="h-6 bg-surfaceHighlight rounded mb-2" />
                  <div className="h-4 bg-surfaceHighlight rounded w-2/3" />
                </Card>
              ))}
            </div>
          ) : displayDeals.length === 0 ? (
            <Card className="p-20 text-center">
              <div className="text-8xl mb-6">🎁</div>
              <p className="text-2xl text-textMuted mb-8">{t("deals.empty")}</p>
              <Link to="/search">
                <Button variant="primary" className="text-lg px-8 py-4">Start Searching</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayDeals.map((deal) => (
                <Link key={deal.id} to={`/products/${deal.productId || deal.id}`} className="group">
                  <Card className="h-full hover:border-primary/50 transition-all duration-300 cursor-pointer relative overflow-hidden hover:shadow-neon-blue/20 hover:-translate-y-2">
                    {deal.isFlashDeal && (
                      <Badge variant="error" className="absolute top-4 right-4 z-10 animate-pulse-slow shadow-lg">
                        🔥 {t("deal.flash")}
                      </Badge>
                    )}
                    <div className="bg-surface h-64 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
                      {deal.imageUrl ? (
                        <img
                          src={deal.imageUrl}
                          alt={deal.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-successNeon/20 flex items-center justify-center">
                          <span className="text-7xl">📦</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold mb-4 line-clamp-2 text-xl group-hover:text-primary transition-colors">{deal.title}</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-successNeon font-black text-2xl">
                        {formatKrw(deal.price || deal.discountedPrice || 0)}
                      </span>
                      {deal.originalPrice && deal.originalPrice > (deal.price || deal.discountedPrice || 0) && (
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
                    <div className="flex items-center justify-between text-sm text-textMuted pt-4 border-t border-border/30">
                      <span className="font-medium">{deal.marketplace || "Global"}</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-surface/60 to-successNeon/20" />
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-successNeon/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-7xl md:text-8xl font-black mb-8 bg-gradient-to-r from-primary via-successNeon to-primary bg-clip-text text-transparent">
            {t("landing.cta.title")}
          </h2>
          <p className="text-2xl md:text-3xl text-textMuted mb-12 leading-relaxed">
            {t("landing.cta.subtitle")}
          </p>
          <Link to="/search">
            <Button 
              variant="primary" 
              className="text-2xl px-16 py-8 rounded-2xl shadow-neon-blue hover:shadow-neon-blue/50 transform hover:scale-110 transition-all duration-300 font-black"
            >
              {t("landing.cta.button")} →
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
