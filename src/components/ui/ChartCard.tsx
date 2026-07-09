"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useUserCurrency } from "@/contexts/currency-context";

export type ChartCardPoint = {
  label: string;
  value: number;
};

type ChartCardProps = {
  title: string;
  subtitle?: string;
  data: ChartCardPoint[];
  /** Y-axis line label */
  valueLabel?: string;
  /** e.g. period toggle pills */
  headerRight?: ReactNode;
};

export function ChartCard({
  title,
  subtitle,
  data,
  valueLabel = "Amount",
  headerRight,
}: ChartCardProps) {
  const { currency, formatMoney } = useUserCurrency();
  const gradId = useId().replace(/:/g, "");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(false);
    const t = window.setTimeout(() => setAnimate(true), 60);
    return () => window.clearTimeout(t);
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center backdrop-blur-sm transition-opacity duration-500">
        <p className="text-sm text-gray-400">
          Start tracking your income and expenses to see your real profit.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c1016]/90 p-5 shadow-lg shadow-black/30 backdrop-blur-md transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-[#22c55e]/20 hover:shadow-xl hover:shadow-[#22c55e]/10 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-white sm:text-xl">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          ) : null}
        </div>
        {headerRight ? (
          <div className="flex shrink-0 flex-wrap items-center gap-1 sm:justify-end">
            {headerRight}
          </div>
        ) : null}
      </div>
      <div className="h-[min(55vw,280px)] min-h-[220px] w-full sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
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
                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
              }
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const v = payload[0]?.value as number;
                return (
                  <div className="rounded-xl border border-white/10 bg-[#0B0F14]/95 px-3 py-2 shadow-xl backdrop-blur-md">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-base font-bold tabular-nums text-[#22c55e]">
                      {formatMoney(v)}
                    </p>
                    <p className="text-[10px] text-gray-600">{valueLabel}</p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              name={valueLabel}
              stroke="#22c55e"
              strokeWidth={2.5}
              fill={`url(#${gradId})`}
              dot={{ r: 3, fill: "#22c55e", strokeWidth: 0 }}
              activeDot={{
                r: 6,
                fill: "#4ade80",
                stroke: "#0B0F14",
                strokeWidth: 2,
              }}
              isAnimationActive={animate}
              animationDuration={1400}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs text-gray-600">Values in {currency}</p>
    </div>
  );
}
