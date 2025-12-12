import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSearch } from '../api/useSearch';
import { PriceCard } from '../../../components/ui/PriceCard';
import { RegionSelector } from '../../../components/RegionSelector';
import { Loader2, Globe } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

type Region = 'ALL' | 'KR' | 'NA' | 'EU' | 'ASIA' | 'JP' | 'SEA';

export function SearchPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    useLanguage();

    // Query state for Input Field (controlled component)
    const [inputValue, setInputValue] = useState(searchParams.get('q') || '');

    // Actual search term from URL (Source of Truth for Query)
    const searchTerm = searchParams.get('q') || '';

    const [region, setRegion] = useState<Region>('ALL');
    const [useGlobalSearch, setUseGlobalSearch] = useState(true);

    // TanStack Query Hook
    const { data: results = [], isLoading: loading, error } = useSearch(searchTerm, region, useGlobalSearch);

    // Sync input with URL when navigating back/forward
    useEffect(() => {
        setInputValue(searchTerm);
    }, [searchTerm]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            navigate(`/search?q=${encodeURIComponent(inputValue)}`);
        }
    };

    const handleRegionChange = (newRegion: Region) => {
        setRegion(newRegion);
        // Region is local state for now, but usually should be in URL too
    };


    const [sortBy, setSortBy] = useState<'rank' | 'price_asc' | 'price_desc' | 'review' | 'date'>('rank');

    // Sort results based on selected criteria
    const sortedResults = [...results].sort((a, b) => {
        switch (sortBy) {
            case 'rank':
                // Smart Sort: Prioritize 'verified' items, then by popularity (reviewCount)
                // This is a simple heuristic for "Relevance" in a demo
                if (a.verified && !b.verified) return -1;
                if (!a.verified && b.verified) return 1;
                return (b.reviewCount || 0) - (a.reviewCount || 0);
            case 'price_asc':
                return (a.priceKRW || a.price || a.minPrice || 0) - (b.priceKRW || b.price || b.minPrice || 0);
            case 'price_desc':
                return (b.priceKRW || b.price || b.minPrice || 0) - (a.priceKRW || a.price || a.minPrice || 0);
            case 'review':
                return (b.reviewCount || 0) - (a.reviewCount || 0);
            case 'date':
                // Simple string comparison for '2025.04' format, sufficient for sorting
                return (b.since || '').localeCompare(a.since || '');

            default:
                return 0; // Keep original order
        }
    });

    const sortOptions = [
        { id: 'rank', label: '✨ 추천순' },
        { id: 'price_asc', label: '💰 낮은 가격순' },
        { id: 'price_desc', label: '💎 높은 가격순' },
        { id: 'review', label: '⭐ 리뷰 많은순' },
        { id: 'date', label: '🆕 최신순' },
    ];

    return (
        <div className="min-h-screen bg-[#0B1117] text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Search Bar */}
                <div className="mb-8">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="제품 검색..."
                            className="flex-1 bg-[#161B22] border border-[#30363D] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4F7EFF]"
                        />
                        <button
                            type="submit"
                            className="bg-[#4F7EFF] hover:bg-[#6B93FF] px-6 py-3 rounded-lg font-bold transition-colors"
                        >
                            검색
                        </button>
                    </form>
                </div>

                {/* Global Search Toggle & Region Selector */}
                <div className="mb-8 space-y-4">
                    {/* Toggle */}
                    <div className="flex items-center gap-3 p-4 bg-[#161B22] border border-[#30363D] rounded-xl">
                        <Globe className="text-[#4F7EFF]" size={24} />
                        <div className="flex-1">
                            <h3 className="font-bold text-white">🌍 글로벌 검색</h3>
                            <p className="text-sm text-[#9BA7B4]">
                                전 세계 30+ 쇼핑몰에서 최저가를 찾아드립니다
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                // setUseGlobalSearch handled by state, query refetches automatically?
                                // Actually, changing useGlobalSearch should trigger refetch.
                                // useSearch hook includes useGlobal in queryKey, so it refetches automatically!
                                setUseGlobalSearch(!useGlobalSearch);
                            }}
                            className={`px-4 py-2 rounded-lg font-bold transition-colors ${useGlobalSearch
                                ? 'bg-[#4F7EFF] text-white'
                                : 'bg-[#30363D] text-[#9BA7B4]'
                                } `}
                        >
                            {useGlobalSearch ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    {/* Region Selector */}
                    {useGlobalSearch && (
                        <RegionSelector value={region} onChange={handleRegionChange} />
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-20">
                        <Loader2 className="animate-spin mx-auto mb-4 text-[#4F7EFF]" size={48} />
                        <p className="text-[#9BA7B4]">전 세계에서 최저가를 검색 중...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-8 text-center">
                        {error instanceof Error ? error.message : 'An unknown error occurred'}
                    </div>
                )}

                {/* Results */}
                {!loading && results.length > 0 && (
                    <div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    검색 결과 <span className="text-[#9BA7B4] text-lg font-normal">({results.length}개)</span>
                                </h2>
                                <div className="text-sm text-[#9BA7B4] mt-1">
                                    {useGlobalSearch && `🌍 ${region === 'ALL' ? '글로벌' : region} 검색`}
                                </div>
                            </div>

                            {/* Sort Controls */}
                            <div className="flex items-center gap-1 bg-[#161B22] p-1 rounded-lg border border-[#30363D]">
                                {sortOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setSortBy(option.id as any)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${sortBy === option.id
                                            ? 'bg-[#30363D] text-white shadow-sm'
                                            : 'text-[#9BA7B4] hover:text-[#E6EDF3] hover:bg-[#21262D]'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 gap-y-6">
                            {sortedResults.map((product, index) => (
                                <PriceCard
                                    key={`${product.merchantName}-${product.id}-${index}`}
                                    product={product}
                                    index={index}
                                    sortBy={sortBy}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* No Results */}
                {!loading && results.length === 0 && searchTerm && (
                    <div className="text-center py-20">
                        <p className="text-[#9BA7B4] text-lg mb-4">
                            "{searchTerm}" 검색 결과가 없습니다
                        </p>
                        <p className="text-sm text-[#9BA7B4]">
                            다른 검색어를 입력하거나 지역을 변경해보세요
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
