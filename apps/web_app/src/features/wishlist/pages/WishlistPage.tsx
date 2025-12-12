import { useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { formatKrw } from "@/shared/lib/money";
import { Link } from "react-router-dom";

interface WishlistItem {
  id: string;
  productId: string;
  title: string;
  currentPrice: number;
  minPrice: number;
  priceChangePct: number;
  addedAt: string;
}

// Mock 데이터
const mockWishlist: WishlistItem[] = [
  {
    id: "1",
    productId: "1",
    title: "Apple iPhone 17 Pro 256GB",
    currentPrice: 1590000,
    minPrice: 1490000,
    priceChangePct: -5.2,
    addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    productId: "2",
    title: "Samsung Galaxy S24 Ultra 512GB",
    currentPrice: 1290000,
    minPrice: 1190000,
    priceChangePct: -3.1,
    addedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function WishlistPage() {
  const [items, setItems] = useState(mockWishlist);

  const handleRemove = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">위시리스트</h1>
        <p className="text-slate-400">
          관심 상품의 가격 변동을 실시간으로 확인하세요.
        </p>
      </div>

      {items.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-slate-400 mb-4">위시리스트가 비어있습니다.</p>
          <Link to="/search">
            <Button variant="primary">상품 검색하기</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="relative">
              <button
                onClick={() => handleRemove(item.id)}
                className="absolute top-2 right-2 text-slate-400 hover:text-red-400 transition-colors"
                aria-label="위시리스트에서 제거"
              >
                ✕
              </button>
              <Link to={`/products/${item.productId}`}>
                <div className="bg-slate-800 h-32 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-slate-500">상품 이미지</span>
                </div>
                <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-emerald-400 font-bold">
                    {formatKrw(item.currentPrice)}
                  </span>
                  <span
                    className={`text-sm ${
                      item.priceChangePct < 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {item.priceChangePct > 0 ? "+" : ""}
                    {item.priceChangePct.toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  최저가: {formatKrw(item.minPrice)}
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

