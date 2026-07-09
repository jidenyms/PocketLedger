"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useUserCurrency } from "@/contexts/currency-context";

export type ChartMonth = {
  label: string;
  income: number;
  expenses: number;
  profit: number;
};

export function ReportsCharts({ data }: { data: ChartMonth[] }) {
  const { currency, formatMoney } = useUserCurrency();
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-20 text-center backdrop-blur-sm">
        <p className="text-sm text-gray-400">
          Start tracking your income and expenses to see your real profit.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[min(55vw,380px)] min-h-[260px] w-full rounded-2xl border border-[#1f2a33] bg-[#0c1016]/90 p-4 shadow-lg shadow-black/30 backdrop-blur-md sm:h-[420px] sm:min-h-0 sm:p-6">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(255,255,255,0.06)"
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) =>
              v >= 1000
                ? `${currency} ${(v / 1000).toFixed(0)}k`
                : `${currency} ${v}`
            }
          />
          <Tooltip
            formatter={(value: number | string) =>
              formatMoney(typeof value === "number" ? value : Number(value))
            }
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(11,15,20,0.95)",
              color: "#fff",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#9ca3af" }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
            formatter={(value) => (
              <span className="text-gray-400">{value}</span>
            )}
          />
          <Bar
            dataKey="income"
            name="Income"
            fill="#22c55e"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />
          <Bar
            dataKey="expenses"
            name="Expenses"
            fill="#52525b"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />
          <Line
            type="monotone"
            dataKey="profit"
            name="Profit"
            stroke="#4ade80"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#4ade80" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
