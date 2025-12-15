import { useState } from "react";
import { useSearch } from "../api/useSearch";
import { SearchCard } from "../components/SearchCard";
import { Button } from "@/shared/ui/Button";
import { AsyncBoundary } from "@/shared/ui/AsyncBoundary";
import { SkeletonPage } from "@/shared/ui/Skeleton";
import { useLanguage } from "@/shared/context/LanguageContext";

export function SearchPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("iphone");
  const [region, setRegion] = useState<"global" | "kr">("global");
  const [searchQuery, setSearchQuery] = useState("iphone");

  const { data, isLoading, error } = useSearch(searchQuery, region);

  const handleSearch = () => {
    setSearchQuery(query);
  };

  return (
    <div>
      <div className="mb-12 relative">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-20 animate-pulse-slow pointer-events-none"></div>
        <div className="relative text-center max-w-2xl mx-auto space-y-6">
          <h1 className="text-4xl font-display font-bold mb-4 bg-gradient-to-r from-textMain to-textMuted bg-clip-text text-transparent animate-fade-in">
            {t("search.title")}
          </h1>

          <div className="flex gap-2 p-2 rounded-2xl bg-surface/80 backdrop-blur-md border border-border shadow-neon-blue/10 animate-slide-up delay-[200ms]">
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search.placeholder")}
                className="w-full px-6 py-4 rounded-xl bg-surfaceHighlight/50 border-none text-textMain placeholder-textMuted focus:ring-2 focus:ring-primary/50 transition-all outline-none font-medium text-lg"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted">
                Create Smart Auto-complete here later
              </div>
            </div>

            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as "global" | "kr")}
              className="px-6 py-2 rounded-xl bg-surfaceHighlight/50 text-textMain border-none focus:ring-2 focus:ring-primary/50 font-medium cursor-pointer"
            >
              <option value="global">{t("search.region.global")}</option>
              <option value="kr">{t("search.region.kr")}</option>
            </select>

            <Button
              onClick={handleSearch}
              className="px-8 text-lg hover:scale-105 transition-transform shadow-neon-blue"
            >
              {t("search.button")}
            </Button>
          </div>

          <div className="flex justify-center gap-4 text-sm text-textMuted animate-fade-in delay-[400ms]">
            <span>Running Now:</span>
            {["iPhone 15", "PlayStation 5", "AirPods Pro"].map((tag) => (
              <span
                key={tag}
                className="cursor-pointer hover:text-primary transition-colors hover:underline decoration-primary/50 decoration-2 underline-offset-4"
                onClick={() => {
                  setQuery(tag);
                  setSearchQuery(tag);
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <AsyncBoundary isLoading={isLoading} error={error}>
        {data && data.results.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-4 mt-6">
            {data.results.map((item) => (
              <SearchCard key={item.productId} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            {t("search.noResults")}
          </div>
        )}
      </AsyncBoundary>
    </div>
  );
}


