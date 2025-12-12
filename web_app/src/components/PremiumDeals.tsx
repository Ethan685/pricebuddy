import React from 'react';
import { Clock, TrendingUp, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PremiumDeal {
    id: string;
    title: string;
    image: string;
    originalPrice: number;
    currentPrice: number;
    discount: number;
    commission: number; // 8-12%
    expiresAt: Date;
    category: 'beauty' | 'fashion' | 'electronics';
}

export const PremiumDeals: React.FC = () => {
    const navigate = useNavigate();

    const handleCardClick = (deal: PremiumDeal) => {
        // Generate mock history for the chart
        const history = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return {
                date: date.toISOString().split('T')[0],
                price: deal.currentPrice + Math.floor(Math.random() * 20000 - 10000),
                merchant: 'Coupang'
            };
        });

        // Generate mock offers
        const offers = [
            {
                id: 'o1',
                merchant: 'Coupang',
                price: deal.currentPrice,
                url: 'https://coupang.com',
                shippingFee: 0,
                currency: 'KRW'
            },
            {
                id: 'o2',
                merchant: 'Naver Shopping',
                price: deal.currentPrice + 2500,
                url: 'https://shopping.naver.com',
                shippingFee: 3000,
                currency: 'KRW'
            },
            {
                id: 'o3',
                merchant: '11st',
                price: deal.currentPrice + 5000,
                url: 'https://11st.co.kr',
                shippingFee: 0,
                currency: 'KRW'
            }
        ];

        const productState = {
            id: deal.id,
            title: deal.title,
            minPrice: deal.currentPrice,
            currency: 'KRW',
            images: [deal.image], // Use the image from the deal
            imageUrl: deal.image, // Fallback
            offers: offers,
            priceHistory: history,
            description: "High performance premium product with AI-optimized pricing.",
            category: deal.category,
            merchantName: 'Coupang',
            totalPrice: deal.currentPrice,
            reviewCount: 1284,
            rate: 4.8
        };
        navigate(`/product/${deal.id}`, { state: { product: productState } });
    };

    // Mock premium deals (high commission products)
    const deals: PremiumDeal[] = [
        {
            id: '1',
            title: 'SK-II 페이셜 트리트먼트 에센스',
            image: 'https://via.placeholder.com/300x200',
            originalPrice: 289000,
            currentPrice: 199000,
            discount: 31,
            commission: 12,
            expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours
            category: 'beauty'
        },
        {
            id: '2',
            title: '나이키 에어맥스 스니커즈',
            image: 'https://via.placeholder.com/300x200',
            originalPrice: 189000,
            currentPrice: 139000,
            discount: 26,
            commission: 10,
            expiresAt: new Date(Date.now() + 5 * 60 * 60 * 1000),
            category: 'fashion'
        },
        {
            id: '3',
            title: '에스티로더 ANR 세럼',
            image: 'https://via.placeholder.com/300x200',
            originalPrice: 165000,
            currentPrice: 119000,
            discount: 28,
            commission: 11,
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
            category: 'beauty'
        }
    ];

    const getTimeRemaining = (expiresAt: Date) => {
        const now = new Date();
        const diff = expiresAt.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}시간 ${minutes}분`;
    };

    return (
        <div className="bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 border-2 border-orange-500 rounded-2xl p-6 mb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Zap className="text-orange-400" size={32} />
                        <h2 className="text-2xl font-bold text-white">
                            🔥 오늘만! 초특가 딜
                        </h2>
                    </div>
                    <p className="text-[#9BA7B4] text-sm">
                        최대 <span className="text-orange-400 font-bold">15% 추가 캐시백</span> + 한정 수량
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-500 px-4 py-2 rounded-full">
                    <Clock className="text-orange-400" size={18} />
                    <span className="text-orange-400 font-bold text-sm">
                        마감 임박!
                    </span>
                </div>
            </div>

            {/* Deals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {deals.map((deal) => (
                    <div
                        key={deal.id}
                        onClick={() => handleCardClick(deal)}
                        className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden hover:border-orange-500 transition-all cursor-pointer group"
                    >
                        {/* Image */}
                        <div className="relative">
                            <div className="bg-[#0D1117] h-40 flex items-center justify-center">
                                <span className="text-4xl">🎁</span>
                            </div>
                            {/* Discount Badge */}
                            <div className="absolute top-2 right-2 bg-red-500 text-white font-bold px-3 py-1 rounded-full text-sm">
                                -{deal.discount}%
                            </div>
                            {/* Timer */}
                            <div className="absolute bottom-2 left-2 bg-black/80 text-orange-400 font-bold px-2 py-1 rounded text-xs flex items-center gap-1">
                                <Clock size={12} />
                                {getTimeRemaining(deal.expiresAt)} 남음
                            </div>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                            <h3 className="text-white font-medium text-sm mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors">
                                {deal.title}
                            </h3>

                            {/* Prices */}
                            <div className="flex items-end gap-2 mb-3">
                                <span className="text-[#9BA7B4] line-through text-xs">
                                    ₩{deal.originalPrice.toLocaleString()}
                                </span>
                                <span className="text-orange-400 font-bold text-lg">
                                    ₩{deal.currentPrice.toLocaleString()}
                                </span>
                            </div>

                            {/* Cashback */}
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">💰</span>
                                    <div>
                                        <div className="text-xs font-bold text-green-400">
                                            +{Math.round(deal.currentPrice * deal.commission / 100).toLocaleString()}원 캐시백
                                        </div>
                                        <div className="text-[10px] text-[#9BA7B4]">
                                            일반 제품 대비 {deal.commission - 5}% 더!
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CTA */}
                            <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-2 rounded-lg transition-all transform group-hover:scale-105 text-sm">
                                지금 구매하기
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-orange-400">2,847</div>
                    <div className="text-xs text-[#9BA7B4]">명이 지금 보는 중</div>
                </div>
                <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-400">15%</div>
                    <div className="text-xs text-[#9BA7B4]">최대 추가 캐시백</div>
                </div>
                <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-red-400 flex items-center justify-center gap-1">
                        <TrendingUp size={20} />
                        94%
                    </div>
                    <div className="text-xs text-[#9BA7B4]">재고 소진률</div>
                </div>
            </div>
        </div>
    );
};
