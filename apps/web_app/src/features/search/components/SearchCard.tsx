import { SearchResultItem } from "../api/useSearch";
import { Card } from "@/shared/ui/Card";
import { formatKrw } from "@/shared/lib/money";
import { Link } from "react-router-dom";

interface SearchCardProps {
  item: SearchResultItem;
}

export function SearchCard({ item }: SearchCardProps) {
  return (
    <Link to={`/products/${item.productId}`}>
      <Card className="hover:border-emerald-500/40 transition-colors cursor-pointer">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-48 object-cover rounded-lg mb-3"
            onError={(e) => {
              // 이미지 로드 실패 시 숨김
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-48 bg-slate-800 rounded-lg mb-3 flex items-center justify-center">
            <span className="text-slate-500 text-sm">이미지 없음</span>
          </div>
        )}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-emerald-400 font-bold">
            {formatKrw(item.minPriceKrw)}
          </span>
          {item.priceChangePct && (
            <span
              className={`text-sm ${
                item.priceChangePct < 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {item.priceChangePct > 0 ? "+" : ""}
              {item.priceChangePct.toFixed(1)}%
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}

