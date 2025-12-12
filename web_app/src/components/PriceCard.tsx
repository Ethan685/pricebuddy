import React from 'react';

interface PriceCardProps {
    item: {
        title: string;
        totalKRW: number;
        deltaPct?: number;
        productId?: string;
        merchantUrl?: string;
    };
}

export const PriceCard: React.FC<PriceCardProps> = ({ item }) => {
    // Calculate 5% cashback for display
    const cashback = Math.round(item.totalKRW * 0.05);

    const handlePurchaseClick = () => {
        if (item.productId) {
            // Log affiliate click
            fetch('/api/logAffiliateClick', {
                method: 'POST',
                body: JSON.stringify({ productId: item.productId })
            });
        }

        // Open merchant URL if available
        if (item.merchantUrl) {
            window.open(item.merchantUrl, '_blank');
        }
    };

    return (
        <div
            className="group relative bg-[#161B22] border border-[#30363D] rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-[#4F7EFF] hover:shadow-xl hover:shadow-blue-900/10 overflow-hidden"
        >
            {/* Image Placeholder */}
            <div className="bg-[#0D1117] rounded-xl h-40 mb-4 flex items-center justify-center text-[#30363D] group-hover:text-[#4F7EFF] transition-colors">
                <span className="text-4xl">📦</span>
            </div>

            <h3 className="text-[#E6EDF3] font-medium text-sm line-clamp-2 mb-3 group-hover:text-[#4F7EFF] transition-colors">
                {item.title}
            </h3>

            <div className="flex items-end justify-between mb-3">
                <div>
                    <span className="text-[10px] text-[#9BA7B4] block uppercase tracking-wider font-bold">Best Price</span>
                    <span className="text-[#E6EDF3] text-lg font-bold">
                        {item.totalKRW.toLocaleString()}원
                    </span>
                </div>
                {item.deltaPct !== undefined && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${item.deltaPct < 0 ? 'bg-[#238636]/20 text-[#3FB950]' : 'bg-[#DA3633]/20 text-[#F85149]'}`}>
                        {item.deltaPct > 0 ? '+' : ''}{item.deltaPct}%
                    </span>
                )}
            </div>

            {/* 💰 Cashback Display (NEW) */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-2 mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    <div className="flex-1">
                        <div className="text-xs font-bold text-green-400">
                            +{cashback.toLocaleString()}원 캐시백
                        </div>
                        <div className="text-[10px] text-[#9BA7B4]">
                            구매 시 즉시 적립
                        </div>
                    </div>
                </div>
            </div>

            {/* 🛒 One-Click Purchase Button (NEW) */}
            <button
                onClick={handlePurchaseClick}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-sm py-3 rounded-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
            >
                🛒 최저가로 구매하기
            </button>
        </div>
    );
};

