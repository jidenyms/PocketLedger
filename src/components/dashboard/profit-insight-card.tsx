"use client";

import { useUserCurrency } from "@/contexts/currency-context";
import {
  buildProfitInsightCopy,
  profitChangePercent,
  topExpenseShare,
} from "@/lib/insights/profit-insight";

type ExpenseCatRow = { name: string; amount: string };

export function ProfitInsightCard({
  profitThisMonth,
  profitLastMonth,
  expenseByCategory,
  monthLabel,
}: {
  profitThisMonth: string;
  profitLastMonth: string;
  expenseByCategory: ExpenseCatRow[];
  monthLabel: string;
}) {
  const { formatMoney } = useUserCurrency();
  const pct = profitChangePercent(profitThisMonth, profitLastMonth);
  const top = topExpenseShare(expenseByCategory);
  const story = buildProfitInsightCopy(
    profitThisMonth,
    profitLastMonth,
    expenseByCategory,
  );

  const pctLabel =
    pct === null || Math.abs(pct) < 0.5
      ? "vs last month"
      : `${pct >= 0 ? "+" : "−"}${Math.round(Math.abs(pct))}% vs last month`;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-[#22c55e]/35 bg-gradient-to-br from-[#22c55e]/20 via-[#0B0F14] to-[#0B0F14] p-6 shadow-xl shadow-[#22c55e]/15 ring-1 ring-[#22c55e]/20 backdrop-blur-sm transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-2xl hover:shadow-[#22c55e]/25 sm:p-8"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#22c55e]/25 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#86efac]">
          Profit insight · {monthLabel}
        </p>
        <div className="mt-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <p className="text-sm font-medium text-gray-400">Net profit this month</p>
            <p className="mt-1 font-mono text-4xl font-bold leading-none tracking-tight text-white tabular-nums sm:text-5xl">
              {formatMoney(profitThisMonth)}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold tabular-nums ring-1 ${
                pct === null || Math.abs(pct) < 0.5
                  ? "bg-white/10 text-gray-300 ring-white/10"
                  : pct > 0
                    ? "bg-[#22c55e]/25 text-[#86efac] ring-[#22c55e]/40"
                    : "bg-rose-500/20 text-rose-200 ring-rose-400/30"
              }`}
            >
              {pctLabel}
            </span>
            {top ? (
              <p className="text-right text-xs text-gray-500 sm:max-w-[220px]">
                Top spend:{" "}
                <span className="font-semibold text-gray-300">
                  {top.name} ({top.pct}%)
                </span>
              </p>
            ) : null}
          </div>
        </div>
        <p className="relative mt-6 max-w-3xl border-t border-white/10 pt-5 text-base leading-relaxed text-gray-300 sm:text-lg">
          {story}
        </p>
      </div>
    </div>
  );
}
