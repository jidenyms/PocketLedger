"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { utcCurrentMonthRange, utcPreviousMonthRange } from "@/lib/dashboard/month-ranges";
import { rollingTwelveMonthUtcRange } from "@/lib/reports/default-range";
import { buildMonthOverMonthInsights } from "@/lib/insights/month-over-month";
import { formatRelativeRefresh } from "@/lib/format/relative-time";
import { MetricCard } from "@/components/ui/MetricCard";
import { ChartCard } from "@/components/ui/ChartCard";
import { DonutChart } from "@/components/ui/DonutChart";
import {
  TransactionsTable,
  type TxRow,
} from "@/components/dashboard/transactions-table";
import { TransactionModal } from "@/components/dashboard/transaction-modal";
import { CreateFirstCategoryScreen } from "@/components/dashboard/create-first-category";
import { FinancialInsights } from "@/components/dashboard/financial-insights";
import { ProfitInsightCard } from "@/components/dashboard/profit-insight-card";
import { DailySummaryStrip } from "@/components/dashboard/daily-summary";
import {
  WeeklyComparisonCard,
  type WeekBlock,
} from "@/components/dashboard/weekly-comparison";
import { Button } from "@/components/ui/button";
import { useUserCurrency } from "@/contexts/currency-context";
import { usePlOpenAddTransaction } from "@/hooks/use-pl-open-add-transaction";
import { moneyDeltaNote } from "@/lib/format/money-delta-note";

function KpiIconIncome() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-3 0-5 1.38-5 3s2 3 5 3 5 1.38 5 3-2 3-5 3m0-12V6m0 12v-1M6 12h.01M18 12h.01" />
    </svg>
  );
}
function KpiIconExpense() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6M7 8h10M5 6h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
    </svg>
  );
}
function KpiIconProfit() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4-3-9s1.34-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  );
}

type MonthRow = {
  label: string;
  income: string;
  expenses: string;
  profit: string;
};

type ExpenseCatRow = {
  id: string | null;
  name: string;
  amount: string;
};

type ReportShape = {
  totals: { income: string; expenses: string; profit: string };
  transactionCount: number;
  byMonth: MonthRow[];
  expenseByCategory: ExpenseCatRow[];
};

type CategoryRow = { id: string; name: string; type: string; createdAt: string };

type PaginatedMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type DailyShape = {
  date: string;
  earned: string;
  spent: string;
  transactionCount: number;
};

function pctDelta(cur: string, prev: string): number | null {
  const c = Number.parseFloat(cur);
  const p = Number.parseFloat(prev);
  if (Number.isNaN(c) || Number.isNaN(p) || p === 0) return null;
  return ((c - p) / p) * 100;
}

async function parseJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function DashboardClient({ email }: { email: string }) {
  const { formatMoney } = useUserCurrency();
  const [report, setReport] = useState<ReportShape | null>(null);
  const [prevReport, setPrevReport] = useState<ReportShape | null>(null);
  const [growthReport, setGrowthReport] = useState<ReportShape | null>(null);
  const [transactions, setTransactions] = useState<TxRow[]>([]);
  const [txMeta, setTxMeta] = useState<PaginatedMeta | null>(null);
  const [page, setPage] = useState(1);
  const [daily, setDaily] = useState<DailyShape | null>(null);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [weekly, setWeekly] = useState<{
    currentWeek: WeekBlock;
    previousWeek: WeekBlock;
  } | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [growthWindow, setGrowthWindow] = useState<"12m" | "6m" | "90d">(
    "12m",
  );

  const { start, end, label } = useMemo(() => utcCurrentMonthRange(), []);
  const prevRange = useMemo(() => utcPreviousMonthRange(), []);
  const growthRange = useMemo(() => rollingTwelveMonthUtcRange(), []);

  const editTransaction = useMemo(
    () =>
      editingId ? (transactions.find((t) => t.id === editingId) ?? null) : null,
    [editingId, transactions],
  );

  const load = useCallback(
    async (opts?: { silent?: boolean; resetPage?: boolean }) => {
      const silent = opts?.silent;
      const txPage = opts?.resetPage ? 1 : page;
      if (opts?.resetPage) setPage(1);

      setErr(null);
      if (!silent) setLoading(true);
      const fromStr = start.toISOString().slice(0, 10);
      const toStr = end.toISOString().slice(0, 10);
      const pFrom = prevRange.start.toISOString().slice(0, 10);
      const pTo = prevRange.end.toISOString().slice(0, 10);
      const gFrom = growthRange.from.toISOString().slice(0, 10);
      const gTo = growthRange.to.toISOString().slice(0, 10);
      try {
        const [
          repRes,
          prevRes,
          growthRes,
          txRes,
          catRes,
          dailyRes,
          weeklyRes,
        ] = await Promise.all([
          fetch(`/api/reports?from=${fromStr}&to=${toStr}`, {
            credentials: "include",
          }),
          fetch(`/api/reports?from=${pFrom}&to=${pTo}`, {
            credentials: "include",
          }),
          fetch(`/api/reports?from=${gFrom}&to=${gTo}`, {
            credentials: "include",
          }),
          fetch(`/api/transactions?page=${txPage}&limit=20`, {
            credentials: "include",
          }),
          fetch("/api/categories", { credentials: "include" }),
          fetch("/api/reports/daily", { credentials: "include" }),
          fetch("/api/reports/weekly", { credentials: "include" }),
        ]);

        if (
          !repRes.ok ||
          !prevRes.ok ||
          !growthRes.ok ||
          !txRes.ok ||
          !catRes.ok ||
          !dailyRes.ok ||
          !weeklyRes.ok
        ) {
          setErr("Could not load dashboard data. Try refreshing.");
          toast.error("Could not load dashboard data");
          return;
        }

        const normalizeReport = (r: {
          totals: ReportShape["totals"];
          transactionCount: number;
          byMonth?: MonthRow[];
          expenseByCategory?: ExpenseCatRow[];
        }): ReportShape => ({
          totals: r.totals,
          transactionCount: r.transactionCount,
          byMonth: r.byMonth ?? [],
          expenseByCategory: r.expenseByCategory ?? [],
        });

        const repBody = await parseJson<{ report: ReportShape }>(repRes);
        const prevBody = await parseJson<{ report: ReportShape }>(prevRes);
        const growthBody = await parseJson<{ report: ReportShape }>(growthRes);
        const txBody = await parseJson<{
          items: TxRow[];
          meta: PaginatedMeta;
        }>(txRes);
        const catBody = await parseJson<{ items: CategoryRow[] }>(catRes);
        const dailyBody = await parseJson<{ summary: DailyShape }>(dailyRes);
        const weeklyBody = await parseJson<{
          comparison: {
            currentWeek: WeekBlock;
            previousWeek: WeekBlock;
          };
        }>(weeklyRes);

        setReport(
          repBody?.report ? normalizeReport(repBody.report) : null,
        );
        setPrevReport(
          prevBody?.report ? normalizeReport(prevBody.report) : null,
        );
        setGrowthReport(
          growthBody?.report ? normalizeReport(growthBody.report) : null,
        );
        setTransactions(txBody?.items ?? []);
        setTxMeta(txBody?.meta ?? null);
        setCategories(catBody?.items ?? []);
        setDaily(dailyBody?.summary ?? null);
        setWeekly(weeklyBody?.comparison ?? null);
        setLastRefreshedAt(new Date());
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [start, end, prevRange.start, prevRange.end, growthRange.from, growthRange.to, page],
  );

  useEffect(() => {
    load();
  }, [load]);

  const categoryLabel = useCallback(
    (id: string | null) => {
      if (!id) return "—";
      const c = categories.find((x) => x.id === id);
      return c?.name ?? id.slice(0, 8) + "…";
    },
    [categories],
  );

  const insightMessages = useMemo(() => {
    if (!report?.totals) return [];
    const prevTotals = prevReport?.totals ?? {
      income: "0",
      expenses: "0",
      profit: "0",
    };
    return buildMonthOverMonthInsights(report.totals, prevTotals);
  }, [report, prevReport]);

  const openAddModal = useCallback(() => {
    setEditingId(null);
    setModalOpen(true);
  }, []);

  usePlOpenAddTransaction(openAddModal);

  const refreshedRelative = useMemo(
    () => (lastRefreshedAt ? formatRelativeRefresh(lastRefreshedAt) : null),
    [lastRefreshedAt],
  );

  function openEditModal(row: TxRow) {
    setEditingId(row.id);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Transaction deleted");
        await load({ silent: true });
      } else {
        toast.error("Could not delete transaction");
      }
    } finally {
      setDeleting(false);
    }
  }

  function mergeCategory(cat: CategoryRow) {
    setCategories((prev) => {
      if (prev.some((c) => c.id === cat.id)) return prev;
      return [...prev, cat].sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const res = await fetch("/api/transactions/export", {
        credentials: "include",
      });
      if (!res.ok) {
        toast.error("Export failed");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pocketledger-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV downloaded");
    } finally {
      setExporting(false);
    }
  }

  const prevTotals = prevReport?.totals ?? {
    income: "0",
    expenses: "0",
    profit: "0",
  };

  const growthChartData = useMemo(() => {
    if (!growthReport?.byMonth?.length) return [];
    return growthReport.byMonth.map((m) => ({
      label: m.label,
      value: Number.parseFloat(m.profit) || 0,
    }));
  }, [growthReport]);

  const growthChartFiltered = useMemo(() => {
    if (!growthChartData.length) return [];
    const take =
      growthWindow === "12m" ? 12 : growthWindow === "6m" ? 6 : 3;
    return growthChartData.slice(-take);
  }, [growthChartData, growthWindow]);

  const donutData = useMemo(() => {
    if (!report?.expenseByCategory?.length) return [];
    return report.expenseByCategory.map((c) => ({
      name: c.name,
      value: Number.parseFloat(c.amount) || 0,
    }));
  }, [report]);

  if (loading) {
    return (
      <div className="space-y-10 px-1 sm:space-y-12 sm:px-0">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-white/10" />
        <div className="h-32 animate-pulse rounded-2xl bg-white/10 sm:h-36" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl bg-white/10"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="h-72 animate-pulse rounded-2xl bg-white/10 sm:h-80 lg:col-span-2" />
          <div className="h-72 animate-pulse rounded-2xl bg-white/10 sm:h-80" />
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-white/10" />
      </div>
    );
  }

  if (categories.length === 0) {
    if (err) {
      return (
        <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center backdrop-blur-sm">
          <p className="text-sm text-gray-300">{err}</p>
          <Button
            type="button"
            variant="neon"
            className="mt-6"
            onClick={() => load()}
          >
            Try again
          </Button>
        </div>
      );
    }
    return (
      <CreateFirstCategoryScreen
        onCreated={() => load({ silent: true, resetPage: true })}
      />
    );
  }

  const hasAnyTransactions = (txMeta?.total ?? 0) > 0;

  return (
    <div className="space-y-10 sm:space-y-12 lg:space-y-14">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div>
          <p className="pl-text-eyebrow">Live ledger</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
            Financial overview
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-400">
            Income, spend, and profit in one calm command center — tuned for how
            you actually run the business.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            <span className="text-gray-400">{email}</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            {refreshedRelative ? (
              <span className="inline-flex items-center gap-2 text-gray-400">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]"
                  aria-hidden
                />
                Last updated {refreshedRelative}
              </span>
            ) : null}
            <span className="hidden text-gray-500 sm:inline">
              Press{" "}
              <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-gray-300">
                N
              </kbd>{" "}
              quick add
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="secondary"
            className="w-full border-white/15! bg-white/5! text-gray-200! hover:bg-white/10! sm:w-auto"
            loading={exporting}
            onClick={() => exportCsv()}
          >
            Export report
          </Button>
          <Button
            type="button"
            variant="neon"
            onClick={openAddModal}
            className="w-full sm:w-auto"
          >
            Add transaction
          </Button>
        </div>
      </div>

      {err ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {err}
        </p>
      ) : null}

      {report ? (
        <ProfitInsightCard
          profitThisMonth={report.totals.profit}
          profitLastMonth={prevTotals.profit}
          expenseByCategory={report.expenseByCategory}
          monthLabel={label}
        />
      ) : null}

      <DailySummaryStrip summary={daily} />

      {weekly ? (
        <WeeklyComparisonCard
          currentWeek={weekly.currentWeek}
          previousWeek={weekly.previousWeek}
        />
      ) : null}

      <FinancialInsights messages={insightMessages} />

      {report ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          <MetricCard
            title="Total revenue"
            amount={formatMoney(report.totals.income)}
            changePercent={
              prevReport
                ? pctDelta(report.totals.income, prevTotals.income)
                : null
            }
            variant="income"
            subtitle="MoM %"
            footnote={
              prevReport
                ? moneyDeltaNote(
                    report.totals.income,
                    prevTotals.income,
                    formatMoney,
                  ) ?? undefined
                : undefined
            }
            icon={<KpiIconIncome />}
          />
          <MetricCard
            title="Total expenses"
            amount={formatMoney(report.totals.expenses)}
            changePercent={
              prevReport
                ? pctDelta(report.totals.expenses, prevTotals.expenses)
                : null
            }
            variant="expense"
            subtitle="MoM %"
            footnote={
              prevReport
                ? moneyDeltaNote(
                    report.totals.expenses,
                    prevTotals.expenses,
                    formatMoney,
                  ) ?? undefined
                : undefined
            }
            icon={<KpiIconExpense />}
          />
          <MetricCard
            title="Net profit"
            amount={formatMoney(report.totals.profit)}
            changePercent={
              prevReport
                ? pctDelta(report.totals.profit, prevTotals.profit)
                : null
            }
            variant="profit"
            subtitle="MoM %"
            featured
            footnote={
              prevReport
                ? moneyDeltaNote(
                    report.totals.profit,
                    prevTotals.profit,
                    formatMoney,
                  ) ?? undefined
                : undefined
            }
            icon={<KpiIconProfit />}
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <ChartCard
            title="Financial growth"
            subtitle="Annual performance — net profit trajectory"
            data={growthChartFiltered}
            valueLabel="Profit"
            headerRight={
              <>
                {(
                  [
                    { key: "12m" as const, label: "12M" },
                    { key: "6m" as const, label: "6M" },
                    { key: "90d" as const, label: "90D" },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setGrowthWindow(key)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
                      growthWindow === key
                        ? "bg-[#22c55e] text-[#0B0F14] shadow-md shadow-[#22c55e]/25"
                        : "bg-white/5 text-gray-400 ring-1 ring-white/10 hover:bg-white/10 hover:text-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </>
            }
          />
        </div>
        <DonutChart
          title="Spending by category"
          subtitle={`Expense mix · ${label} (UTC)`}
          data={donutData}
        />
      </div>

      <section className="space-y-5 pt-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
            Transactions
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            {txMeta ? (
              <span>
                Page {txMeta.page} of {txMeta.totalPages} · {txMeta.total}{" "}
                total
              </span>
            ) : null}
          </div>
        </div>
        <TransactionsTable
          items={transactions}
          categoryLabel={categoryLabel}
          onEdit={openEditModal}
          onDelete={handleDelete}
          disabled={deleting}
          deleteInProgress={deleting}
          onAddFirst={hasAnyTransactions ? undefined : openAddModal}
        />
        {txMeta && txMeta.totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="!border-white/15 !bg-white/5 !text-gray-200"
              disabled={page <= 1 || deleting}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="!border-white/15 !bg-white/5 !text-gray-200"
              disabled={page >= txMeta.totalPages || deleting}
              onClick={() =>
                setPage((p) => Math.min(txMeta.totalPages, p + 1))
              }
            >
              Next
            </Button>
          </div>
        ) : null}
      </section>

      <TransactionModal
        open={modalOpen}
        onClose={closeModal}
        categories={categories}
        onSuccess={() => load({ silent: true, resetPage: true })}
        editTransaction={editTransaction ?? undefined}
        onCategoryCreated={mergeCategory}
      />
    </div>
  );
}
