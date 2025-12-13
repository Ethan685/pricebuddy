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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{t("search.title")}</h1>
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as "global" | "kr")}
            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
          >
            <option value="global">{t("search.region.global")}</option>
            <option value="kr">{t("search.region.kr")}</option>
          </select>
          <Button onClick={handleSearch}>{t("search.button")}</Button>
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


