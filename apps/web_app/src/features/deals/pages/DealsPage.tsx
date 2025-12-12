import { useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { formatKrw } from "@/shared/lib/money";
import { formatRelativeTime } from "@/shared/lib/datetime";
import { Link } from "react-router-dom";

interface Deal {
  id: string;
  productId: string;
  title: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  marketplace: string;
  url: string;
  validUntil: string;
  isFlashDeal: boolean;
}

// Mock 데이터
const mockDeals: Deal[] = [
  {
    id: "1",
    productId: "1",
    title: "Apple iPhone 17 Pro 256GB",
    originalPrice: 1890000,
    discountedPrice: 1590000,
    discountPercent: 16,
    marketplace: "coupang",
    url: "https://www.coupang.com/vp/products/123456",
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    isFlashDeal: true,
  },
  {
    id: "2",
    productId: "2",
    title: "Samsung Galaxy S24 Ultra 512GB",
    originalPrice: 1490000,
    discountedPrice: 1290000,
    discountPercent: 13,
    marketplace: "naver",
    url: "https://smartstore.naver.com/products/789012",
    validUntil: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    isFlashDeal: true,
  },
  {
    id: "3",
    productId: "3",
    title: "Sony WH-1000XM5 무선 헤드폰",
    originalPrice: 499000,
    discountedPrice: 399000,
    discountPercent: 20,
    marketplace: "coupang",
    url: "https://www.coupang.com/vp/products/345678",
    validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    isFlashDeal: false,
  },
];

export function DealsPage() {
  const [filter, setFilter] = useState<"all" | "flash">("all");
  const [sortBy, setSortBy] = useState<"discount" | "price" | "time">("discount");

  const filteredDeals = mockDeals.filter((deal) => {
    if (filter === "flash") return deal.isFlashDeal;
    return true;
  });

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    switch (sortBy) {
      case "discount":
        return b.discountPercent - a.discountPercent;
      case "price":
        return a.discountedPrice - b.discountedPrice;
      case "time":
        return new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime();
      default:
        return 0;
    }
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">오늘만 초특가 딜</h1>
        <p className="text-slate-400 mb-6">
          한정 시간 특가 상품을 놓치지 마세요!
        </p>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "all"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter("flash")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "flash"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              플래시 딜
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
          >
            <option value="discount">할인율 높은 순</option>
            <option value="price">가격 낮은 순</option>
            <option value="time">마감 임박 순</option>
          </select>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {sortedDeals.map((deal) => (
          <Link key={deal.id} to={`/products/${deal.productId}`}>
            <Card className="hover:border-emerald-500/40 transition-colors cursor-pointer relative">
              {deal.isFlashDeal && (
                <Badge variant="danger" className="absolute top-2 right-2">
                  플래시 딜
                </Badge>
              )}
              <div className="bg-slate-800 h-48 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-slate-500">상품 이미지</span>
              </div>
              <h3 className="font-semibold mb-2 line-clamp-2">{deal.title}</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-emerald-400 font-bold text-lg">
                  {formatKrw(deal.discountedPrice)}
                </span>
                <span className="text-slate-500 line-through text-sm">
                  {formatKrw(deal.originalPrice)}
                </span>
                <Badge variant="danger">{-deal.discountPercent}%</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{deal.marketplace}</span>
                <span>⏰ {formatRelativeTime(deal.validUntil)}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

