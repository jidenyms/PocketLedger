"use client";

import { useUserCurrency } from "@/contexts/currency-context";
import {
  buildWeekOverWeekInsights,
  incomeChangePercent,
  spendingChangePercent,
} from "@/lib/insights/week-over-week";

export type WeekBlock = {
  label: string;
  start: string;
  end: string;
  totals: { income: string; expenses: string; profit: string };
  transactionCount: number;
};

export function WeeklyComparisonCard({
  currentWeek,
  previousWeek,
}: {
  currentWeek: WeekBlock;
  previousWeek: WeekBlock;
}) {
  const { formatMoney } = useUserCurrency();
  const incPct = incomeChangePercent(currentWeek.totals, previousWeek.totals);
  const spendPct = spendingChangePercent(currentWeek.totals, previousWeek.totals);
  const messages = buildWeekOverWeekInsights(
    currentWeek.totals,
    previousWeek.totals,
  );

  function pill(pct: number | null, kind: "income" | "spend") {
    if (pct === null) {
      return (
        <span className="text-xs text-gray-500 tabular-nums">— vs prior week</span>
      );
    }
    if (Math.abs(pct) < 0.5) {
      return (
        <span className="text-xs font-medium text-gray-500 tabular-nums">
          Flat vs last week
        </span>
      );
    }
    const up = pct > 0;
    const negativeIsBad = kind === "spend" ? up : !up;
    const cls = negativeIsBad ? "text-rose-400" : "text-[#4ade80]";
    const sign = pct >= 0 ? "+" : "−";
    return (
      <span className={`text-xs font-semibold tabular-nums ${cls}`}>
        {sign}
        {Math.round(Math.abs(pct))}% vs last week
      </span>
    );
  }

  return (
    <div className="rounded-2xl border border-[#22c55e]/20 bg-gradient-to-br from-[#22c55e]/10 to-transparent px-4 py-4 shadow-lg shadow-[#22c55e]/5 backdrop-blur-sm ring-1 ring-white/5 transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#22c55e]/10 sm:px-5 sm:py-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#22c55e]">
        Week over week · UTC
      </p>
      <p className="mt-1 text-xs text-gray-400">{currentWeek.label}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3">
          <p className="text-xs font-medium text-gray-500">Income</p>
          <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-white">
            {formatMoney(currentWeek.totals.income)}
          </p>
          {pill(incPct, "income")}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3">
          <p className="text-xs font-medium text-gray-500">Spending</p>
          <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-white">
            {formatMoney(currentWeek.totals.expenses)}
          </p>
          {pill(spendPct, "spend")}
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {messages.map((msg, i) => (
          <li
            key={i}
            className="flex gap-2 text-sm leading-relaxed text-gray-300"
          >
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#22c55e]"
              aria-hidden
            />
            {msg}
          </li>
        ))}
      </ul>
    </div>
  );
}
