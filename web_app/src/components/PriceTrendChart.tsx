import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { tokens } from '../theme/tokens';

interface PricePoint {
    date: string;
    price: number;
    merchant: string;
}

interface PriceTrendChartProps {
    data: PricePoint[];
    title: string;
}

export function PriceTrendChart({ data, title }: PriceTrendChartProps) {
    // Format data for Recharts if needed, or pass directly
    return (
        <div className="w-full h-[300px] bg-[#161B22] p-4 rounded-xl border border-[#30363D]">
            <h3 className="text-lg font-bold mb-4 text-[#E6EDF3]">{title}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={tokens.color.brand} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={tokens.color.brand} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#9BA7B4"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#9BA7B4"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₩${value.toLocaleString()}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#0D1117',
                            border: '1px solid #30363D',
                            borderRadius: '8px',
                            color: '#E6EDF3'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke={tokens.color.brand}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                    />
                    <Area
                        type="monotone"
                        dataKey="forecastPrice"
                        stroke={tokens.color.brand}
                        strokeDasharray="5 5"
                        fill="none"
                        strokeOpacity={0.6}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
