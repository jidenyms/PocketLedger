"use client";

import { useUserCurrency } from "@/contexts/currency-context";

export function DailySummaryStrip({
  summary,
}: {
  summary: {
    date: string;
    earned: string;
    spent: string;
    transactionCount: number;
  } | null;
}) {
  const { formatMoney } = useUserCurrency();

  if (!summary) {
    return (
      <div className="h-20 animate-pulse rounded-2xl bg-white/10" />
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 shadow-lg shadow-black/20 backdrop-blur-sm ring-1 ring-white/5 transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-white/[0.14] hover:shadow-xl sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        Today (UTC) · {summary.date}
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <div>
          <p className="text-xs text-gray-500">Earned</p>
          <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-[#4ade80]">
            {formatMoney(summary.earned)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Spent</p>
          <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-white">
            {formatMoney(summary.spent)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Transactions</p>
          <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-white">
            {summary.transactionCount}
          </p>
        </div>
      </div>
    </div>
  );
}
