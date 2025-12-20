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
import { useState } from "react";

export function ProductDetailPage() {
  const { productId } = useParams();
  const { t } = useTranslation();
  const { data, isLoading, error } = useProductDetail(productId!);

  return (
    <AsyncBoundary isLoading={isLoading} error={error}>
      {data ? (
        <ProductDetailContent data={data} />
      ) : (
        <div className="text-center py-8 text-red-400">{t("product.error.loadFailed")}</div>
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
      alert(t("product.tracking.noOffers"));
      return;
    }

    setIsTracking(true);
    setTrackingStatus("idle");
    try {
      // 첫 번째 offer의 URL로 가격 추적 시작
      const firstOffer = offers[0];
      const result = await trackProduct.mutateAsync({
        url: firstOffer.url,
        marketplace: firstOffer.marketplace,
        productId: product.id,
      });

      setTrackingStatus("success");
      console.log("Price tracking started:", result);

      // 성공 메시지 표시
      setTimeout(() => {
        setTrackingStatus("idle");
      }, 3000);
    } catch (error) {
      console.error("Failed to start tracking:", error);
      setTrackingStatus("error");
      alert(t("product.tracking.failed"));

      setTimeout(() => {
        setTrackingStatus("idle");
      }, 3000);
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <div className="flex gap-8 mt-8 flex-col md:flex-row">
      {/* 왼쪽 상품 이미지 영역 */}
      <div className="flex-1 rounded-xl bg-slate-900/60 min-h-[400px] flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-contain rounded-xl"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="text-slate-500 text-center">
            <div className="text-4xl mb-2">📱</div>
            <div className="text-sm">{t("product.imagePreparing")}</div>
          </div>
        )}
      </div>

      {/* 오른쪽 정보 영역 */}
      <div className="flex-1 space-y-4">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-semibold flex-1">{product.title}</h1>
          <ShareButton productId={product.id} productTitle={product.title} />
        </div>

        {/* AI Signal 카드 */}
        {aiSignal && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-900/20 p-4">
            <div className="text-sm text-emerald-300">
              {t("product.aiSignal")}: {aiSignal.label === "BUY" ? t("product.aiSignal.buy") : t("product.aiSignal.wait")}
            </div>
            <div className="text-xs text-slate-300 mt-1">
              {t("recommendations.confidence")}: {Math.round(aiSignal.confidence * 100)}%
            </div>
            <div className="text-xs text-slate-400 mt-2">{aiSignal.reason}</div>
          </div>
        )}

        {/* Price Tracking Button */}
        <div className="space-y-2">
          <Button
            variant="primary"
            onClick={handleTrackPrice}
            disabled={isTracking || !offers || offers.length === 0}
            className="w-full"
          >
            {isTracking
              ? t("product.tracking.inProgress")
              : trackingStatus === "success"
                ? t("product.tracking.started")
                : t("product.tracking.start")
            }
          </Button>
          {trackingStatus === "success" && (
            <div className="text-sm text-emerald-400 text-center">
              ✅ {t("product.tracking.successMessage")}
            </div>
          )}
          {trackingStatus === "error" && (
            <div className="text-sm text-red-400 text-center">
              ❌ {t("product.tracking.errorMessage")}
            </div>
          )}
        </div>

        {/* Price Alert */}
        <PriceAlertButton
          productId={product.id}
          currentPrice={offers?.[0]?.totalPriceKrw || 0}
        />

        {/* Price History & Forecast */}
        {historyDaily && historyDaily.length > 0 && <PriceHistoryChart data={historyDaily} />}

        {/* Truth Engine: Total Cost Breakdown */}
        {offers && offers.length > 0 && (
          <div className="space-y-4 mb-6">
            <h2 className="text-xl font-display font-bold text-textMain">{t("product.truthEngine.title") || "💸 The Real Price (Truth Engine)"}</h2>
            <TotalCostCalculator
              basePrice={offers[0].price || 0}
              shipping={offers[0].shippingFee || 0}
              tax={offers[0].tax || 0}
              duty={offers[0].duty || 0}
              currency={offers[0].currency || "KRW"}
            />
          </div>
        )}

        {/* Offers Comparison */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold mb-2 text-textMain">{t("product.priceComparison")}</h2>
          {offers && offers.length > 0 ? (
            <div className="flex overflow-x-auto md:block space-x-4 md:space-x-0 md:space-y-3 pb-4 md:pb-0 snap-x hide-scrollbar">
              {offers.map((offer: any, index: number) => (
                <div key={offer.id} className={`min-w-[280px] md:min-w-0 snap-center transform transition-all duration-300 ${index === 0 ? 'scale-[1.02] ring-2 ring-primary shadow-neon-blue/20 rounded-xl z-10' : ''}`}>
                  <PriceCard offer={offer} />
                  {index === 0 && (
                    <div className="absolute -top-3 -right-2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-20">
                      BEST CHOICE
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-textMuted text-center py-4">{t("product.noPriceInfo")}</div>
          )}
        </div>
      </div>
    </div>
  );
}

