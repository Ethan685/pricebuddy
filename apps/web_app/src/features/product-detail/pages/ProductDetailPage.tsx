import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProductDetail } from "../api/useProductDetail";
import { useTrackProduct } from "../api/usePriceTracking";
import { PriceCard } from "../components/PriceCard";
import { PriceHistoryChart } from "../components/PriceHistoryChart";
import { PriceAlertButton } from "../components/PriceAlertButton";
import { ShareButton } from "../components/ShareButton";
import { TotalCostCalculator } from "../components/TotalCostCalculator";
import { AsyncBoundary } from "@/shared/ui/AsyncBoundary";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { formatKrw } from "@/shared/lib/money";
import { useState } from "react";

const formatPercent = (raw: unknown) => {
  const v = (typeof raw === "number" && Number.isFinite(raw)) ? raw : null;
  return v === null ? "—" : `${Math.round(v * 100)}%`;
};


export function ProductDetailPage() {


  const { productId } = useParams();
  const { t } = useTranslation();
  const { data, isLoading, error } = useProductDetail(productId!);



  return (
    <AsyncBoundary isLoading={isLoading} error={error}>
      {data ? (
        <ProductDetailContent data={data} />
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-xl text-textMuted">{t("product.error.loadFailed", { defaultValue: "Failed to load product" })}</p>
        </div>
      )}
    </AsyncBoundary>
  );
}

function ProductDetailContent({ data }: { data: any }) {
  const { product, offers, historyDaily, aiSignal } = data;
  const { t } = useTranslation();
  const trackProduct = useTrackProduct();
  const [isTracking, setIsTracking] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState<"idle" | "success" | "error">("idle");

  const handleTrackPrice = async () => {
    if (!offers || offers.length === 0) {
      alert(t("product.tracking.noOffers", { defaultValue: "No offers available" }));
      return;
    }

    setIsTracking(true);
    setTrackingStatus("idle");
    try {
      const firstOffer = offers[0];
      const result = await trackProduct.mutateAsync({
        url: firstOffer.url,
        marketplace: firstOffer.marketplace,
        productId: product.id,
      });

      setTrackingStatus("success");
      setTimeout(() => {
        setTrackingStatus("idle");
      }, 3000);
    } catch (error) {
      setTrackingStatus("error");
      alert(t("product.tracking.failed", { defaultValue: "Failed to start tracking" }));
      setTimeout(() => {
        setTrackingStatus("idle");
      }, 3000);
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 상단 헤더 */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-primary to-successNeon bg-clip-text text-transparent">
              {product.title}
            </h1>
            {aiSignal && (
              <Badge variant={aiSignal.label === "BUY" ? "success" : "warning"} className="mb-4">
                🤖 {t("product.aiSignal", { defaultValue: "AI Recommendation" })}: {aiSignal.label === "BUY" ? t("product.aiSignal.buy", { defaultValue: "Buy Now" }) : t("product.aiSignal.wait", { defaultValue: "Wait" })} ({formatPercent(aiSignal?.score)})
              </Badge>
            )}
          </div>
          <ShareButton productId={product.id} productTitle={product.title} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 왼쪽: 이미지 */}
        <Card className="p-8 bg-gradient-to-br from-surface/90 to-surface/50">
          <div className="aspect-square rounded-xl bg-gradient-to-br from-surfaceHighlight to-surface flex items-center justify-center overflow-hidden relative group">
            {product.imageUrl ? (
              <>
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            ) : (
              <div className="text-center">
                <div className="text-8xl mb-4 opacity-50">📦</div>
                <div className="text-textMuted">{t("product.imagePreparing", { defaultValue: "Image preparing..." })}</div>
              </div>
            )}
          </div>
        </Card>

        {/* 오른쪽: 정보 */}
        <div className="space-y-6">
          {/* 가격 추적 버튼 */}
          <Card className="p-6">
            <Button
              variant="primary"
              onClick={handleTrackPrice}
              disabled={isTracking || !offers || offers.length === 0}
              className="w-full text-lg py-6 font-bold"
            >
              {isTracking
                ? t("product.tracking.inProgress", { defaultValue: "Starting..." })
                : trackingStatus === "success"
                  ? t("product.tracking.started", { defaultValue: "Tracking Started" })
                  : t("product.tracking.start", { defaultValue: "Start Price Tracking" })
              }
            </Button>
            {trackingStatus === "success" && (
              <div className="text-sm text-successNeon text-center mt-3">
                ✅ {t("product.tracking.successMessage", { defaultValue: "Price tracking started successfully" })}
              </div>
            )}
            {trackingStatus === "error" && (
              <div className="text-sm text-red-400 text-center mt-3">
                ❌ {t("product.tracking.errorMessage", { defaultValue: "Failed to start price tracking" })}
              </div>
            )}
          </Card>

          {/* 가격 알림 */}
          <PriceAlertButton
            productId={product.id}
            currentPrice={offers?.[0]?.totalPriceKrw || 0}
          />

          {/* Truth Engine */}
          {offers && offers.length > 0 && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-textMain">
                {t("product.truthEngine.title", { defaultValue: "💸 The Real Price (Truth Engine)" })}
              </h2>
              <TotalCostCalculator
                basePrice={offers[0].price || offers[0].totalPriceKrw || 0}
                shipping={offers[0].shippingFee || offers[0].shippingFeeKrw || 0}
                tax={offers[0].tax || 0}
                duty={offers[0].duty || 0}
                currency={offers[0].currency || "KRW"}
              />
            </Card>
          )}

          {/* 가격 비교 */}
          {offers && offers.length > 0 && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-textMain">
                {t("product.priceComparison", { defaultValue: "Price Comparison" })}
              </h2>
              <div className="space-y-4">
                {offers.map((offer: any, index: number) => (
                  <div key={`${offer.id ?? offer.seller ?? 'offer'}-${offer.url ?? 'url'}-${index}`} className={`relative ${index === 0 ? 'ring-2 ring-primary rounded-xl p-2' : ''}`}>
                    {index === 0 && (
                      <Badge variant="success" className="absolute -top-3 -right-2 z-10">
                        BEST
                      </Badge>
                    )}
                    <PriceCard offer={offer} />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* 가격 히스토리 */}
      {historyDaily && historyDaily.length > 0 && (
        <Card className="mt-8 p-6">
          <h2 className="text-2xl font-bold mb-4 text-textMain">Price History</h2>
          <PriceHistoryChart data={historyDaily} />
        </Card>
      )}
    </div>
  );
}
