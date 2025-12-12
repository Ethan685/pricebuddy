import { useParams } from "react-router-dom";
import { useProductDetail } from "../api/useProductDetail";
import { useTrackProduct } from "../api/usePriceTracking";
import { PriceCard } from "../components/PriceCard";
import { PriceHistoryChart } from "../components/PriceHistoryChart";
import { PriceAlertButton } from "../components/PriceAlertButton";
import { ShareButton } from "../components/ShareButton";
import { AsyncBoundary } from "@/shared/ui/AsyncBoundary";
import { Button } from "@/shared/ui/Button";
import { useState } from "react";

export function ProductDetailPage() {
  const { productId } = useParams();
  const { data, isLoading, error } = useProductDetail(productId!);

  return (
    <AsyncBoundary isLoading={isLoading} error={error}>
      {data ? (
        <ProductDetailContent data={data} />
      ) : (
        <div className="text-center py-8 text-red-400">상품 정보를 가져올 수 없습니다.</div>
      )}
    </AsyncBoundary>
  );
}

function ProductDetailContent({ data }: { data: any }) {
  const { product, offers, history, aiSignal } = data;
  const trackProduct = useTrackProduct();
  const [isTracking, setIsTracking] = useState(false);

  const handleTrackPrice = async () => {
    if (!offers || offers.length === 0) return;
    
    setIsTracking(true);
    try {
      // 첫 번째 offer의 URL로 가격 추적 시작
      const firstOffer = offers[0];
      await trackProduct.mutateAsync({
        url: firstOffer.url,
        marketplace: firstOffer.marketplace,
        productId: product.id,
      });
      alert("가격 추적이 시작되었습니다!");
    } catch (error) {
      console.error("Failed to start tracking:", error);
      alert("가격 추적 시작에 실패했습니다.");
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
            <div className="text-sm">이미지 준비 중</div>
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
              AI 신호: {aiSignal.label === "BUY" ? "BUY NOW" : "WAIT"}
            </div>
            <div className="text-xs text-slate-300 mt-1">
              Confidence: {Math.round(aiSignal.confidence * 100)}%
            </div>
            <div className="text-xs text-slate-400 mt-2">{aiSignal.reason}</div>
          </div>
        )}

        {/* Price Tracking Button */}
        <Button
          variant="primary"
          onClick={handleTrackPrice}
          disabled={isTracking || !offers || offers.length === 0}
          className="w-full"
        >
          {isTracking ? "추적 중..." : "가격 추적 시작"}
        </Button>

        {/* Price Alert */}
        <PriceAlertButton
          productId={product.id}
          currentPrice={offers?.[0]?.totalPriceKrw || 0}
        />

        {/* Price History & Forecast */}
        {history && history.length > 0 && <PriceHistoryChart data={history} />}

        {/* Offers 리스트 */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold mb-2">가격 비교</h2>
          {offers && offers.length > 0 ? (
            offers.map((offer: any) => (
              <PriceCard key={offer.id} offer={offer} />
            ))
          ) : (
            <div className="text-slate-400 text-center py-4">가격 정보가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}

