import { Link } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { useLanguage } from "@/shared/context/LanguageContext";
import { formatKrw } from "@/shared/lib/money";
import { useRecommendations } from "../api/useRecommendations";
import { AsyncBoundary } from "@/shared/ui/AsyncBoundary";
import { SkeletonPage } from "@/shared/ui/Skeleton";

export function RecommendationsPage() {
  const { user } = useAuthContext();
  const { t } = useLanguage();
  const { data, isLoading, error } = useRecommendations(user?.uid);

  const recommendations = data?.recommendations || [];

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
          <h1 className="text-3xl font-bold mb-2">{t("recommendations.title")}</h1>
          <p className="text-slate-400">
            {t("recommendations.subtitle")}
          </p>
        </div>

        {recommendations.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-4xl mb-4">🤖</div>
            <p className="text-slate-400">
              {t("recommendations.empty")}
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {recommendations.map((rec) => (
              <Link key={rec.productId} to={`/products/${rec.productId}`}>
                <Card className="hover:border-emerald-500/40 transition-colors">
                  <div className="flex gap-4">
                    <div className="bg-slate-800 w-24 h-24 rounded-lg flex items-center justify-center flex-shrink-0">
                      {rec.imageUrl ? (
                        <img src={rec.imageUrl} alt={rec.title} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="text-slate-500 text-xs">{t("common.imagePlaceholder")}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{rec.title}</h3>
                      <p className="text-sm text-slate-400 mb-3">{rec.reason}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-emerald-400 font-bold">
                            {formatKrw(rec.minPrice)}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {t("recommendations.confidence")}: {Math.round(rec.confidence * 100)}%
                          </div>
                        </div>
                        <div className="text-emerald-400">→</div>
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
