import { useState, useEffect } from "react";
import { Card } from "@/shared/ui/Card";
import { formatKrw } from "@/shared/lib/money";
import { Link } from "react-router-dom";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { useLanguage } from "@/shared/context/LanguageContext";

interface Recommendation {
  productId: string;
  title: string;
  reason: string;
  confidence: number;
  minPrice: number;
  imageUrl?: string;
}

export function RecommendationsPage() {
  const { user } = useAuthContext();
  const { t } = useLanguage();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: AI 추천 API 호출
    // Mock 데이터
    setTimeout(() => {
      setRecommendations([
        {
          productId: "1",
          title: "Apple iPhone 17 Pro 256GB",
          reason: "최근 검색하신 상품과 유사하며, 현재 최저가 구간입니다.",
          confidence: 0.85,
          minPrice: 1590000,
        },
        {
          productId: "2",
          title: "Samsung Galaxy S24 Ultra 512GB",
          reason: "가격이 15% 하락했으며, 구매 타이밍으로 추천합니다.",
          confidence: 0.78,
          minPrice: 1290000,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 mb-4">로그인이 필요합니다.</p>
        <Link to="/login" className="text-emerald-400 hover:underline">
          로그인하기
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12 text-slate-400">{t("common.loading")}</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI 맞춤 추천</h1>
        <p className="text-slate-400">
          당신의 관심사와 구매 패턴을 분석한 개인화된 상품 추천입니다.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {recommendations.map((rec) => (
          <Link key={rec.productId} to={`/products/${rec.productId}`}>
            <Card className="hover:border-emerald-500/40 transition-colors">
              <div className="flex gap-4">
                <div className="bg-slate-800 w-24 h-24 rounded-lg flex items-center justify-center flex-shrink-0">
                  {rec.imageUrl ? (
                    <img src={rec.imageUrl} alt={rec.title} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-slate-500 text-xs">이미지</span>
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
                        신뢰도: {Math.round(rec.confidence * 100)}%
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

      {recommendations.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">🤖</div>
          <p className="text-slate-400">
            아직 추천할 상품이 없습니다. 더 많은 상품을 검색해보세요!
          </p>
        </Card>
      )}
    </div>
  );
}

