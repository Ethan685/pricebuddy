import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/shared/ui/Card";

interface PriceHistoryChartProps {
  data: { ts: string; totalPriceKrw: number }[];
}

export function PriceHistoryChart({ data }: PriceHistoryChartProps) {
  const chartData = data.map((d) => ({
    date: new Date(d.ts).toLocaleDateString("ko-KR"),
    price: d.totalPriceKrw,
  }));

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">가격 히스토리</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: "#10b981" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

