import { Link } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { formatKrw } from "@/shared/lib/money";

interface SearchCardProps {
  item: any;
}

export function SearchCard({ item }: SearchCardProps) {
  const productId = item.productId || item.id;
  const minPrice = item.minPriceKrw || item.minPrice || item.price || 0;
  const maxPrice = item.maxPriceKrw || item.maxPrice || 0;
  const hasPriceRange = maxPrice > minPrice;
  const priceChange = item.priceChangePercent || 0;
  
  return (
    <Link to={`/products/${productId}`} className="h-full block">
      <Card className="h-full hover:border-primary/50 transition-all duration-300 hover:shadow-neon-blue/20 hover:-translate-y-1 group relative flex flex-col overflow-hidden">
        <div className="bg-surface h-56 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
          {(item.imageUrl || item.image) ? (
            <img
              src={item.imageUrl || item.image}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-successNeon/20 flex items-center justify-center">
              <span className="text-6xl">📦</span>
            </div>
          )}
          
          {/* Price Change Badge */}
          {priceChange < 0 && (
            <div className="absolute top-3 left-3">
              <Badge variant="success" className="text-xs bg-successNeon/90 backdrop-blur-sm">
                ↓ {Math.abs(priceChange).toFixed(1)}%
              </Badge>
            </div>
          )}
          
          {/* Marketplace Badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="default" className="text-xs bg-surface/90 backdrop-blur-sm border-none">
              {item.marketplace || item.minPriceMarketplace || "Global"}
            </Badge>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <h3 className="font-semibold mb-3 line-clamp-2 text-textMain group-hover:text-primary transition-colors text-lg leading-tight">
            {item.title}
          </h3>

          <div className="mt-auto pt-4 border-t border-border/30">
            <div className="flex items-end justify-between mb-2">
              <div className="flex-1">
                <div className="text-xs text-textMuted mb-1">최저가</div>
                <div className="text-2xl font-bold text-successNeon font-display">
                  {formatKrw(minPrice)}
                </div>
                {hasPriceRange && (
                  <div className="text-xs text-textMuted mt-1">
                    최대 {formatKrw(maxPrice)}
                  </div>
                )}
              </div>
              {item.offerCount && item.offerCount > 1 && (
                <div className="text-xs text-textMuted text-right">
                  <div className="font-medium">{item.offerCount}</div>
                  <div>offers</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl" />
        
        {/* View Deal Badge */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
          <Badge variant="primary" className="shadow-lg backdrop-blur-md text-sm px-3 py-1.5 font-semibold">
            View Deal →
          </Badge>
        </div>
      </Card>
    </Link>
  );
}
