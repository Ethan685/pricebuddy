import { AreaChart, Area, YAxis, Tooltip, XAxis } from 'recharts';

interface PricePoint {
    date: string;
    price: number;
}

interface MiniPriceTrendProps {
    data: PricePoint[];
    priceChange: number;
    priceChangePercent: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div
                className="border border-[#30363D]/40 p-2 rounded shadow-xl text-xs z-50 transform translate-y-2 pointer-events-none"
                style={{
                    backgroundColor: 'rgba(13, 17, 23, 0.65)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)'
                }}
            >
                <p className="text-[#9BA7B4] mb-0.5">{label}</p>
                <p className="text-white font-bold whitespace-nowrap">
                    {payload[0].value.toLocaleString()}원
                </p>
            </div>
        );
    }
    return null;
};

/**
 * Compact price trend chart for search results
 */
export function MiniPriceTrend({ data, priceChange, priceChangePercent }: MiniPriceTrendProps) {
    if (!data || data.length === 0) return null;

    const isDown = priceChange < 0;
    const color = isDown ? '#10b981' : '#ef4444'; // Green if down, red if up

    return (
        <div className="flex items-center gap-3">
            {/* Mini Chart */}
            <div className="w-24 h-12">
                <AreaChart width={96} height={48} data={data}>
                    <defs>
                        <linearGradient id={`mini-${isDown ? 'green' : 'red'}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <YAxis domain={['dataMin', 'dataMax']} hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke={color}
                        strokeWidth={2}
                        fill={`url(#mini-${isDown ? 'green' : 'red'})`}
                        isAnimationActive={false}
                    />
                </AreaChart>
            </div>

            {/* Price Change Indicator */}
            <div className={`text-sm font-bold ${isDown ? 'text-green-400' : 'text-red-400'}`}>
                {isDown ? '↓' : '↑'} {Math.abs(priceChangePercent)}%
                <div className="text-xs text-[#9BA7B4] font-normal">
                    30일 전 대비
                </div>
            </div>
        </div>
    );
}
