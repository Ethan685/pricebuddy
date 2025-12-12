import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { formatKrw } from "@/shared/lib/money";
import { Link } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";

interface ComparisonItem {
  productId: string;
  title: string;
  minPrice: number;
  maxPrice: number;
  offers: {
    marketplace: string;
    price: number;
    url: string;
  }[];
}

export function ComparisonPage() {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const productIds = searchParams.get("ids")?.split(",") || [];

  // Mock 데이터
  const [items] = useState<ComparisonItem[]>([
    {
      productId: "1",
      title: "Apple iPhone 17 Pro 256GB",
      minPrice: 1590000,
      maxPrice: 1890000,
      offers: [
        { marketplace: "coupang", price: 1590000, url: "https://coupang.com/1" },
        { marketplace: "naver", price: 1650000, url: "https://naver.com/1" },
        { marketplace: "amazon_us", price: 1200, url: "https://amazon.com/1" },
      ],
    },
    {
      productId: "2",
      title: "Samsung Galaxy S24 Ultra 512GB",
      minPrice: 1290000,
      maxPrice: 1490000,
      offers: [
        { marketplace: "coupang", price: 1290000, url: "https://coupang.com/2" },
        { marketplace: "naver", price: 1350000, url: "https://naver.com/2" },
        { marketplace: "amazon_us", price: 1000, url: "https://amazon.com/2" },
      ],
    },
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">상품 비교</h1>
        <p className="text-slate-400">여러 상품을 한눈에 비교하세요.</p>
      </div>

      {/* Comparison Table */}
      <Card className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-4">상품</th>
              {items.map((item) => (
                <th key={item.productId} className="text-center p-4 min-w-[200px]">
                  <Link to={`/products/${item.productId}`}>
                    <div className="font-semibold hover:text-emerald-400 transition-colors">
                      {item.title}
                    </div>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-700">
              <td className="p-4 font-semibold">최저가</td>
              {items.map((item) => (
                <td key={item.productId} className="text-center p-4">
                  <div className="text-emerald-400 font-bold text-lg">
                    {formatKrw(item.minPrice)}
                  </div>
                </td>
              ))}
            </tr>
            <tr className="border-b border-slate-700">
              <td className="p-4 font-semibold">최고가</td>
              {items.map((item) => (
                <td key={item.productId} className="text-center p-4">
                  <div className="text-slate-400 line-through">
                    {formatKrw(item.maxPrice)}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-semibold">가격 차이</td>
              {items.map((item) => (
                <td key={item.productId} className="text-center p-4">
                  <div className="text-emerald-400">
                    {formatKrw(item.maxPrice - item.minPrice)} 절약
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </Card>

      {/* Detailed Offers */}
      <div className="mt-8 space-y-6">
        {items.map((item) => (
          <Card key={item.productId}>
            <h3 className="font-semibold text-lg mb-4">{item.title}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {item.offers.map((offer, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-slate-800 border border-slate-700"
                >
                  <div className="text-sm text-slate-400 mb-2">
                    {offer.marketplace}
                  </div>
                  <div className="text-emerald-400 font-bold text-xl mb-2">
                    {formatKrw(offer.price)}
                  </div>
                  <a
                    href={offer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-emerald-400 hover:underline"
                  >
                    구매하기 →
                  </a>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

