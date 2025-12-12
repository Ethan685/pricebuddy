import React, { useEffect, useState } from 'react';
import { Zap, Clock, TrendingDown } from 'lucide-react';

interface UrgentBannerProps {
    productId: string;
    productTitle: string;
    oldPrice: number;
    newPrice: number;
    dropPercentage: number;
}

export const UrgentBanner: React.FC<UrgentBannerProps> = ({
    // productId,
    // productTitle,
    oldPrice,
    newPrice,
    dropPercentage
}) => {
    const [timeLeft, setTimeLeft] = useState(3 * 60); // 3 minutes in seconds
    const [viewers, setViewers] = useState(0);

    useEffect(() => {
        // Random viewers count (social proof)
        setViewers(Math.floor(Math.random() * 500) + 200);

        // Update viewers count periodically
        const viewersInterval = setInterval(() => {
            setViewers(prev => prev + Math.floor(Math.random() * 10) - 3);
        }, 5000);

        // Countdown timer
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(timer);
            clearInterval(viewersInterval);
        };
    }, []);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const urgentMessages = [
        '🔥 역대 최저가 갱신!',
        '⚡️ 한정 수량 특가!',
        '💥 지금 안 사면 손해!',
        '🚨 3분 후 원가 복구!'
    ];

    if (timeLeft === 0) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 animate-pulse">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    {/* Left: Urgent Message */}
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Zap className="text-white animate-bounce" size={24} />
                        </div>
                        <div>
                            <div className="text-white font-bold text-lg flex items-center gap-2">
                                {urgentMessages[Math.floor(Math.random() * urgentMessages.length)]}
                                <span className="bg-white text-red-600 px-2 py-1 rounded text-sm font-bold">
                                    -{Math.round(dropPercentage)}%
                                </span>
                            </div>
                            <div className="text-white/90 text-sm">
                                ₩{oldPrice.toLocaleString()} → <span className="font-bold">₩{newPrice.toLocaleString()}</span>
                                {' '}(₩{(oldPrice - newPrice).toLocaleString()} 할인)
                            </div>
                        </div>
                    </div>

                    {/* Center: Countdown */}
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <Clock className="text-white" size={20} />
                        <div className="text-center">
                            <div className="text-white text-2xl font-bold font-mono">
                                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                            </div>
                            <div className="text-white/80 text-xs">남음</div>
                        </div>
                    </div>

                    {/* Right: Social Proof */}
                    <div className="flex items-center gap-4">
                        <div className="text-white text-sm">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="font-bold">{viewers.toLocaleString()}명</span>
                            </div>
                            <div className="text-white/80 text-xs">지금 보는 중</div>
                        </div>

                        <div className="text-white text-sm">
                            <div className="flex items-center gap-1">
                                <TrendingDown className="text-yellow-300" size={16} />
                                <span className="font-bold">재고 {Math.floor(Math.random() * 20) + 5}개</span>
                            </div>
                            <div className="text-white/80 text-xs">빠른 구매 필수!</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Flash Deal Badge Component
export const FlashDealBadge: React.FC<{ endsAt: Date }> = ({ endsAt }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const updateTimer = () => {
            const diff = endsAt.getTime() - Date.now();
            setTimeLeft(Math.max(0, Math.floor(diff / 1000)));
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [endsAt]);

    if (timeLeft === 0) return null;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
            <Zap size={14} />
            <span className="font-bold text-sm">
                ⚡️ {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
        </div>
    );
};
