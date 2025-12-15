import { Link } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { formatKrw } from "@/shared/lib/money";

interface SearchCardProps {
  item: any;
}

export function SearchCard({ item }: SearchCardProps) {
  return (
    <Link to={`/products/${item.productId}`} className="h-full block">
      <Card className="h-full hover:border-primary/50 transition-all duration-300 hover:shadow-neon-blue/20 hover:-translate-y-1 group relative flex flex-col">
        <div className="bg-surface h-48 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <span className={`text-textMuted text-sm ${item.imageUrl ? "hidden" : ""}`}>
            No Image
          </span>
          {/* Marketplace Badge (Optional) */}
          <div className="absolute top-2 left-2">
            <Badge variant="default" className="text-xs bg-surface/90 backdrop-blur-sm border-none">
              {item.minPriceMarketplace || "Global"}
            </Badge>
          </div>
        </div>

        <h3 className="font-semibold mb-2 line-clamp-2 text-textMain group-hover:text-primary transition-colors text-lg">
          {item.title}
        </h3>

        <div className="mt-auto pt-4 flex items-end justify-between border-t border-border/30">
          <div>
            <div className="text-xs text-textMuted mb-1">Lowest Price</div>
            <div className="text-2xl font-bold text-successNeon font-display">
              {formatKrw(item.minPrice || item.price || 0)}
            </div>
          </div>
          <div className="text-xs text-textMuted text-right">
            <div>{item.offerCount || 1} offers</div>
          </div>
        </div>

        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
          <Badge variant="success" className="shadow-lg backdrop-blur-md">View Deal →</Badge>
        </div>
      </Card>
    </Link>
  );
}
