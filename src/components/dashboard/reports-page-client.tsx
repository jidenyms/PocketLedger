"use client";

import { useEffect, useMemo, useState } from "react";
import type { FinancialReportPayload } from "@/services/report.service";
import { MetricCard } from "@/components/ui/MetricCard";
import { ReportsCharts, type ChartMonth } from "@/components/dashboard/reports-charts";
import {
  WeeklyComparisonCard,
  type WeekBlock,
} from "@/components/dashboard/weekly-comparison";
import { buildWeekOverWeekInsights } from "@/lib/insights/week-over-week";
import { useUserCurrency } from "@/contexts/currency-context";

async function parseJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

type RangePreset = "weekly" | "monthly" | "quarterly" | "annual";

export function ReportsPageClient({
  initialReport,
  subtitle,
}: {
  initialReport: FinancialReportPayload;
  subtitle: string;
}) {
  const { formatMoney } = useUserCurrency();
  const [weekly, setWeekly] = useState<{
    currentWeek: WeekBlock;
    previousWeek: WeekBlock;
  } | null>(null);
  const [rangePreset, setRangePreset] = useState<RangePreset>("monthly");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/reports/weekly", { credentials: "include" });
      if (!res.ok) return;
      const body = await parseJson<{
        comparison: { currentWeek: WeekBlock; previousWeek: WeekBlock };
      }>(res);
      setWeekly(body?.comparison ?? null);
    })();
  }, []);

  const chartData: ChartMonth[] = useMemo(() => {
    return initialReport.byMonth.map((m) => ({
      label: m.label,
      income: Number.parseFloat(m.income) || 0,
      expenses: Number.parseFloat(m.expenses) || 0,
      profit: Number.parseFloat(m.profit) || 0,
    }));
  }, [initialReport.byMonth]);

  const chartFiltered = useMemo(() => {
    if (!chartData.length) return [];
    switch (rangePreset) {
      case "weekly":
        return chartData.slice(-4);
      case "monthly":
        return chartData.slice(-6);
      case "quarterly":
        return chartData.slice(-3);
      default:
        return chartData;
    }
  }, [chartData, rangePreset]);

  const weekInsightLines = useMemo(() => {
    if (!weekly) return [];
    return buildWeekOverWeekInsights(
      weekly.currentWeek.totals,
      weekly.previousWeek.totals,
    );
  }, [weekly]);

  const primaryInsight =
    weekInsightLines[0] ??
    "Start tracking your income and expenses to see your real profit.";

  const incomeNum = Number.parseFloat(initialReport.totals.income) || 0;
  const expNum = Number.parseFloat(initialReport.totals.expenses) || 0;
  const profitNum = Number.parseFloat(initialReport.totals.profit) || 0;
  const spendOfIncomePct =
    incomeNum > 0 ? Math.round((expNum / incomeNum) * 100) : 0;
  const keepPct = Math.max(0, 100 - spendOfIncomePct);

  const rangeButtons: { id: RangePreset; label: string }[] = [
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "quarterly", label: "Quarterly" },
    { id: "annual", label: "Annual" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="pl-text-eyebrow">Live ledger analytics</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Financial reports
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
            {subtitle} — multi-period performance, anomalies, and forecast-style
            readouts in one executive view.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 rounded-2xl border border-[#1f2a33] bg-[#0c1016]/90 p-1.5">
          {rangeButtons.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setRangePreset(b.id)}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200 active:scale-95 sm:px-4 ${
                rangePreset === b.id
                  ? "bg-[#22c55e] text-[#0B0F14] shadow-md shadow-[#22c55e]/25"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#1f2a33] bg-[#0c1016]/90 p-5 shadow-lg shadow-black/25 backdrop-blur-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Efficiency
          </p>
          <p className="mt-2 text-lg font-bold text-white">
            You keep ~{keepPct}%
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Estimated share of income after reported expenses in this range.
          </p>
        </div>
        <div className="rounded-2xl border border-[#1f2a33] bg-[#0c1016]/90 p-5 shadow-lg shadow-black/25 backdrop-blur-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Goals
          </p>
          <p className="mt-2 text-lg font-bold text-[#5af0b0]">
            {formatMoney(initialReport.totals.profit)}
          </p>
          <p className="mt-1 text-xs text-gray-400">Net profit in range.</p>
        </div>
        <div className="rounded-2xl border border-[#1f2a33] bg-[#0c1016]/90 p-5 shadow-lg shadow-black/25 backdrop-blur-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Capital inflow
          </p>
          <p className="mt-2 text-lg font-bold text-white">
            {formatMoney(initialReport.totals.income)}
          </p>
          <p className="mt-1 text-xs text-gray-400">Total income recorded.</p>
        </div>
        <div className="rounded-2xl border border-[#22c55e]/25 bg-linear-to-br from-[#22c55e]/12 to-[#0c1016] p-5 shadow-lg shadow-[#22c55e]/10 ring-1 ring-[#22c55e]/20">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#86efac]">
            Forecast signal
          </p>
          <p className="mt-2 text-lg font-bold text-white">
            {profitNum >= 0 ? "Surplus trajectory" : "Tight margin"}
          </p>
          <p className="mt-1 text-xs text-gray-300">
            {profitNum >= 0
              ? "Profit stayed positive for the sampled window."
              : "Expenses exceeded income — revisit spend cadence."}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-[#22c55e]/25 bg-linear-to-br from-[#22c55e]/10 via-[#0a0e14] to-transparent p-5 shadow-xl shadow-[#22c55e]/10 backdrop-blur-sm sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#86efac]">
          Insight
        </p>
        <p className="mt-2 text-sm leading-relaxed text-gray-100">
          {primaryInsight}
        </p>
        {weekInsightLines.length > 1 ? (
          <ul className="mt-3 space-y-1.5 text-xs text-gray-400">
            {weekInsightLines.slice(1, 4).map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[#22c55e]" aria-hidden>
                  ·
                </span>
                {line}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          title="Total revenue"
          amount={formatMoney(initialReport.totals.income)}
          changePercent={null}
          variant="income"
          subtitle={subtitle}
        />
        <MetricCard
          title="Total expenses"
          amount={formatMoney(initialReport.totals.expenses)}
          changePercent={null}
          variant="expense"
          subtitle={subtitle}
        />
        <MetricCard
          title="Net profit"
          amount={formatMoney(initialReport.totals.profit)}
          changePercent={null}
          variant="profit"
          featured
          subtitle={subtitle}
        />
      </div>

      <p className="text-xs text-gray-500">
        {initialReport.transactionCount} transactions in range · UTC month
        boundaries
      </p>

      {weekly ? (
        <WeeklyComparisonCard
          currentWeek={weekly.currentWeek}
          previousWeek={weekly.previousWeek}
        />
      ) : null}

      <section>
        <h2 className="mb-4 text-lg font-bold tracking-tight text-white">
          Revenue vs expenses
        </h2>
        <ReportsCharts data={chartFiltered} />
      </section>
    </div>
  );
}
