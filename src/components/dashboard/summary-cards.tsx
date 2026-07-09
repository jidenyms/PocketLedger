"use client";

import { useUserCurrency } from "@/contexts/currency-context";

type Totals = {
  income: string;
  expenses: string;
  profit: string;
};

export function SummaryCards({
  totals,
  subtitle,
}: {
  totals: Totals;
  subtitle: string;
}) {
  const { formatMoney } = useUserCurrency();
  const profitNum = Number.parseFloat(totals.profit);
  const profitPositive = !Number.isNaN(profitNum) && profitNum >= 0;

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm ring-1 ring-zinc-900/5 transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/80 dark:ring-white/10 sm:p-6">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Total income
        </p>
        <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400 sm:text-3xl">
          {formatMoney(totals.income)}
        </p>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">{subtitle}</p>
      </div>
      <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm ring-1 ring-zinc-900/5 transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/80 dark:ring-white/10 sm:p-6">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-zinc-400/10 blur-2xl" />
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Total expenses
        </p>
        <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          {formatMoney(totals.expenses)}
        </p>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">{subtitle}</p>
      </div>
      <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm ring-1 ring-zinc-900/5 transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/80 dark:ring-white/10 sm:p-6">
        <div
          className={`absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl ${
            profitPositive ? "bg-emerald-500/15" : "bg-rose-500/15"
          }`}
        />
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Profit
        </p>
        <p
          className={`mt-3 text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl ${
            profitPositive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {formatMoney(totals.profit)}
        </p>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">{subtitle}</p>
      </div>
    </section>
  );
}
