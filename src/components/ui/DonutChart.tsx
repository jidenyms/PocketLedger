"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useUserCurrency } from "@/contexts/currency-context";

export type DonutDatum = {
  name: string;
  value: number;
};

const COLORS = [
  "#22c55e",
  "#4ade80",
  "#86efac",
  "#6ee7b7",
  "#34d399",
  "#10b981",
  "#059669",
  "#94a3b8",
];

type DonutChartProps = {
  title: string;
  subtitle?: string;
  data: DonutDatum[];
};

export function DonutChart({ title, subtitle, data }: DonutChartProps) {
  const { formatMoney } = useUserCurrency();
  const chartId = useId().replace(/:/g, "");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(false);
    const t = window.setTimeout(() => setAnimate(true), 60);
    return () => window.clearTimeout(t);
  }, [data]);

  const total = useMemo(
    () => data.reduce((s, d) => s + d.value, 0),
    [data],
  );

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-14 text-center backdrop-blur-sm transition-opacity duration-500">
        <p className="text-sm text-gray-400">
          No expense categories in this period yet. Add spending to see the
          breakdown.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-lg shadow-black/25 backdrop-blur-sm transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-white/15 hover:shadow-xl hover:shadow-[#22c55e]/10 sm:p-6">
      <h3 className="text-lg font-bold tracking-tight text-white sm:text-xl">
        {title}
      </h3>
      {subtitle ? (
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      ) : null}
      <div className="mt-4 h-[min(52vw,260px)] min-h-[200px] w-full sm:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={2}
              strokeWidth={2}
              stroke="#0B0F14"
              isAnimationActive={animate}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {data.map((d, i) => (
                <Cell
                  key={`${chartId}-${d.name}-${i}`}
                  fill={COLORS[i % COLORS.length]}
                  className="outline-none transition-opacity duration-300 hover:opacity-90"
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0]?.payload as DonutDatum;
                return (
                  <div className="rounded-xl border border-white/10 bg-[#0B0F14]/95 px-3 py-2 shadow-xl backdrop-blur-md">
                    <p className="text-xs font-medium text-white">{p.name}</p>
                    <p className="text-sm font-bold tabular-nums text-[#22c55e]">
                      {formatMoney(p.value)}
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center">
        <p className="text-center text-sm text-gray-400">
          Total{" "}
          <span className="font-mono text-base font-bold text-white tabular-nums">
            {formatMoney(total)}
          </span>
        </p>
      </div>
      <ul className="mt-4 space-y-2.5">
        {data.map((d, i) => (
          <li
            key={d.name + i}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <span className="flex items-center gap-2 text-gray-400">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              {d.name}
            </span>
            <span className="font-mono text-sm font-semibold tabular-nums text-gray-300">
              {total > 0
                ? `${Math.round((d.value / total) * 100)}%`
                : "—"}{" "}
              · {formatMoney(d.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
