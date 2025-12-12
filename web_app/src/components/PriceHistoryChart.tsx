import React, { useEffect, useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingDown, TrendingUp, Clock, Shield, AlertCircle } from 'lucide-react';
import { api } from '../api/api';

interface PriceHistoryProps {
    productId: string;
    merchantName?: string;
}

export const PriceHistoryChart: React.FC<PriceHistoryProps> = ({ productId, merchantName }) => {
    const [history, setHistory] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [freshness, setFreshness] = useState<any>(null);

    useEffect(() => {
        loadPriceHistory();
        checkDataFreshness();
    }, [productId, merchantName]);

    const loadPriceHistory = async () => {
        setLoading(true);
        try {
            const data = await api.getPriceHistory(productId, merchantName);
            setHistory(data.history || []);
            setStats(data.stats || {});
        } catch (error) {
            console.error('Failed to load price history:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkDataFreshness = async () => {
        try {
            const data = await api.getDataFreshness(productId);
            setFreshness(data);
        } catch (error) {
            console.error('Failed to check freshness:', error);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse bg-[#161B22] rounded-xl p-6">
                <div className="h-64 bg-[#0D1117] rounded"></div>
            </div>
        );
    }

    if (!history.length) {
        return (
            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6">
                <div className="text-center text-[#9BA7B4]">
                    <AlertCircle className="mx-auto mb-2" size={32} />
                    <p>가격 히스토리 데이터가 없습니다</p>
                </div>
            </div>
        );
    }

    // Prepare chart data
    const chartData = history.map(h => ({
        date: new Date(h.recordedAt.seconds * 1000).toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric'
        }),
        price: h.price,
        verified: h.verified
    })).reverse();

    const priceChange = stats.priceChange || 0;
    const isDecrease = priceChange < 0;

    return (
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6">
            {/* Header with Stats */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        📊 가격 변동 추이
                        {stats.isLowestEver && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                                🎉 역대 최저가!
                            </span>
                        )}
                    </h3>

                    {/* Data Freshness Badge */}
                    {freshness && (
                        <div className={`inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full ${freshness.status === 'fresh' ? 'bg-green-500/20 text-green-400' :
                            freshness.status === 'recent' ? 'bg-blue-500/20 text-blue-400' :
                                freshness.status === 'stale' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-red-500/20 text-red-400'
                            }`}>
                            <Clock size={12} />
                            {freshness.message}
                            <Shield size={12} className="text-green-400" />
                        </div>
                    )}
                </div>

                <div className="text-right">
                    <div className={`flex items-center gap-2 text-lg font-bold ${isDecrease ? 'text-green-400' : 'text-red-400'
                        }`}>
                        {isDecrease ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
                        {Math.abs(priceChange).toFixed(1)}%
                    </div>
                    <div className="text-xs text-[#9BA7B4]">
                        최근 30일
                    </div>
                </div>
            </div>

            {/* Price Statistics */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-[#0D1117] rounded-lg p-3">
                    <div className="text-xs text-[#9BA7B4] mb-1">현재 가격</div>
                    <div className="text-lg font-bold text-white">
                        ₩{stats.current?.toLocaleString()}
                    </div>
                </div>
                <div className="bg-[#0D1117] rounded-lg p-3">
                    <div className="text-xs text-[#9BA7B4] mb-1">최저 가격</div>
                    <div className="text-lg font-bold text-green-400">
                        ₩{stats.min?.toLocaleString()}
                    </div>
                </div>
                <div className="bg-[#0D1117] rounded-lg p-3">
                    <div className="text-xs text-[#9BA7B4] mb-1">평균 가격</div>
                    <div className="text-lg font-bold text-blue-400">
                        ₩{Math.round(stats.average)?.toLocaleString()}
                    </div>
                </div>
                <div className="bg-[#0D1117] rounded-lg p-3">
                    <div className="text-xs text-[#9BA7B4] mb-1">최고 가격</div>
                    <div className="text-lg font-bold text-red-400">
                        ₩{stats.max?.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4F7EFF" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#4F7EFF" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                        <XAxis
                            dataKey="date"
                            stroke="#9BA7B4"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            stroke="#9BA7B4"
                            style={{ fontSize: '12px' }}
                            tickFormatter={(value) => `₩${(value / 1000).toFixed(0)}K`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#161B22',
                                border: '1px solid #30363D',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                            formatter={(value: any) => [`₩${value.toLocaleString()}`, '가격']}
                        />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#4F7EFF"
                            strokeWidth={2}
                            fill="url(#priceGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Trust Indicators */}
            <div className="mt-6 pt-4 border-t border-[#30363D]">
                <div className="flex items-center justify-between text-xs text-[#9BA7B4]">
                    <div className="flex items-center gap-2">
                        <Shield size={14} className="text-green-400" />
                        <span>
                            검증된 데이터 {history.filter(h => h.verified).length}/{history.length}개
                        </span>
                    </div>
                    <div>
                        출처: {merchantName || '모든 판매처'}
                    </div>
                    <div>
                        마지막 업데이트: {new Date(history[0].recordedAt.seconds * 1000).toLocaleString('ko-KR')}
                    </div>
                </div>
            </div>

            {/* Current Position Indicator */}
            <div className="mt-4 p-4 bg-[#0D1117] rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-bold text-white mb-1">
                            💡 구매 추천 분석
                        </div>
                        <div className="text-xs text-[#9BA7B4]">
                            현재 가격은 {stats.isLowestEver ? '역대 최저가' :
                                stats.current < stats.average ? '평균보다 낮음' : '평균보다 높음'}
                        </div>
                    </div>
                    {stats.isLowestEver ? (
                        <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg font-bold">
                            🟢 지금 구매 추천!
                        </div>
                    ) : stats.current < stats.average ? (
                        <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg font-bold">
                            🔵 괜찮은 가격
                        </div>
                    ) : (
                        <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg font-bold">
                            🟡 대기 권장
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
