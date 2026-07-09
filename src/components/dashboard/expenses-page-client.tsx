"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { utcCurrentMonthRange, utcPreviousMonthRange } from "@/lib/dashboard/month-ranges";
import { MetricCard } from "@/components/ui/MetricCard";
import {
  TransactionsTable,
  type TxRow,
} from "@/components/dashboard/transactions-table";
import { TransactionModal } from "@/components/dashboard/transaction-modal";
import { CreateFirstCategoryScreen } from "@/components/dashboard/create-first-category";
import { Button } from "@/components/ui/button";
import { useUserCurrency } from "@/contexts/currency-context";
import { usePlOpenAddTransaction } from "@/hooks/use-pl-open-add-transaction";
import { moneyDeltaNote } from "@/lib/format/money-delta-note";

type CategoryRow = { id: string; name: string; type: string; createdAt: string };

type ExpenseCatRow = { id: string | null; name: string; amount: string };

type ReportShape = {
  totals: { income: string; expenses: string; profit: string };
  transactionCount: number;
  expenseByCategory: ExpenseCatRow[];
};

type PaginatedMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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

export function ExpensesPageClient() {
  const { formatMoney } = useUserCurrency();
  const [report, setReport] = useState<ReportShape | null>(null);
  const [prevReport, setPrevReport] = useState<ReportShape | null>(null);
  const [items, setItems] = useState<TxRow[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { start, end, label } = useMemo(() => utcCurrentMonthRange(), []);
  const prevRange = useMemo(() => utcPreviousMonthRange(), []);

  const editTransaction = useMemo(
    () =>
      editingId ? (items.find((t) => t.id === editingId) ?? null) : null,
    [editingId, items],
  );

  const load = useCallback(async () => {
    setLoading(true);
    const fromStr = start.toISOString().slice(0, 10);
    const toStr = end.toISOString().slice(0, 10);
    const pFrom = prevRange.start.toISOString().slice(0, 10);
    const pTo = prevRange.end.toISOString().slice(0, 10);
    try {
      const q = new URLSearchParams({
        page: String(page),
        limit: "20",
        type: "EXPENSE",
        from: fromStr,
        to: toStr,
      });
      const [repRes, prevRes, txRes, catRes] = await Promise.all([
        fetch(`/api/reports?from=${fromStr}&to=${toStr}`, {
          credentials: "include",
        }),
        fetch(`/api/reports?from=${pFrom}&to=${pTo}`, {
          credentials: "include",
        }),
        fetch(`/api/transactions?${q}`, { credentials: "include" }),
        fetch("/api/categories", { credentials: "include" }),
      ]);
      if (!repRes.ok || !prevRes.ok || !txRes.ok || !catRes.ok) {
        toast.error("Could not load expenses");
        return;
      }
      const normalize = (r: {
        totals: ReportShape["totals"];
        transactionCount: number;
        expenseByCategory?: ExpenseCatRow[];
      }): ReportShape => ({
        totals: r.totals,
        transactionCount: r.transactionCount,
        expenseByCategory: r.expenseByCategory ?? [],
      });
      const repBody = await parseJson<{ report: ReportShape }>(repRes);
      const prevBody = await parseJson<{ report: ReportShape }>(prevRes);
      const txBody = await parseJson<{ items: TxRow[]; meta: PaginatedMeta }>(
        txRes,
      );
      const catBody = await parseJson<{ items: CategoryRow[] }>(catRes);
      setReport(repBody?.report ? normalize(repBody.report) : null);
      setPrevReport(prevBody?.report ? normalize(prevBody.report) : null);
      setItems(txBody?.items ?? []);
      setMeta(txBody?.meta ?? null);
      setCategories(catBody?.items ?? []);
    } finally {
      setLoading(false);
    }
  }, [start, end, prevRange.start, prevRange.end, page]);

  useEffect(() => {
    load();
  }, [load]);

  const openAddModal = useCallback(() => {
    setEditingId(null);
    setModalOpen(true);
  }, []);
  usePlOpenAddTransaction(openAddModal);

  const categoryLabel = useCallback(
    (id: string | null) => {
      if (!id) return "—";
      const c = categories.find((x) => x.id === id);
      return c?.name ?? id.slice(0, 8) + "…";
    },
    [categories],
  );

  const prevTotals = prevReport?.totals ?? { income: "0", expenses: "0", profit: "0" };

  const sortedExpenseCats = useMemo(() => {
    const list = [...(report?.expenseByCategory ?? [])];
    list.sort(
      (a, b) =>
        Number.parseFloat(b.amount) - Number.parseFloat(a.amount),
    );
    return list;
  }, [report]);

  const heroCat = sortedExpenseCats[0];
  const otherCats = sortedExpenseCats.slice(1, 5);

  const totalExpensesNum = report
    ? Number.parseFloat(report.totals.expenses) || 0
    : 0;

  const heroPct = heroCat && totalExpensesNum > 0
    ? Math.round(
        ((Number.parseFloat(heroCat.amount) || 0) / totalExpensesNum) *
          100,
      )
    : 0;

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
        toast.success("Deleted");
        await load();
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

  if (loading && categories.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-36 animate-pulse rounded-2xl bg-white/10" />
        <div className="h-80 animate-pulse rounded-2xl bg-white/10" />
      </div>
    );
  }

  if (categories.length === 0) {
    return <CreateFirstCategoryScreen onCreated={() => load()} />;
  }

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="pl-text-eyebrow">Expense intelligence</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Expenses analysis
          </h1>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-400">
            <span>
              <span className="text-gray-500">Period · </span>
              {label}{" "}
              <span className="text-gray-600">(UTC)</span>
            </span>
            {report ? (
              <span>
                <span className="text-gray-500">Recorded · </span>
                {formatMoney(report.totals.expenses)}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            variant="secondary"
            className="border-white/15! bg-white/5! text-gray-200!"
            onClick={() => {
              void fetch("/api/transactions/export", {
                credentials: "include",
              }).then(async (res) => {
                if (!res.ok) {
                  toast.error("Could not export CSV");
                  return;
                }
                try {
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `pocketledger-expenses-${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success("Export downloaded");
                } catch {
                  toast.error("Export failed");
                }
              });
            }}
          >
            Export CSV
          </Button>
          <Button variant="neon" onClick={openAddModal} className="font-semibold">
            + New expense
          </Button>
        </div>
      </div>

      {report ? (
        <>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {heroCat ? (
              <div className="relative overflow-hidden rounded-3xl border border-[#22c55e]/30 bg-linear-to-br from-[#22c55e]/12 via-[#0c1016] to-[#0c1016] p-6 shadow-xl shadow-[#22c55e]/15 ring-1 ring-[#22c55e]/20 lg:col-span-2">
                <div
                  className="pointer-events-none absolute -right-4 -bottom-6 opacity-[0.07]"
                  aria-hidden
                >
                  <svg
                    className="h-40 w-40 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M4 21h16v-2H4v2zm2-4h12V9H6v8zm2-6h8v2H8v-2zm-1-6h10V5H7v6z" />
                  </svg>
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#86efac]">
                  Heaviest category
                </p>
                <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                  {heroCat.name}
                </p>
                <p className="text-sm text-gray-400">
                  {heroPct}% of this period&apos;s spend
                </p>
                <p className="mt-4 font-mono text-4xl font-bold tabular-nums tracking-tight text-[#5af0b0] drop-shadow-[0_0_20px_rgba(34,197,94,0.35)]">
                  {formatMoney(heroCat.amount)}
                </p>
                <div className="mt-6 flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>
                    MoM ·{" "}
                    {prevReport
                      ? (() => {
                          const p = pctDelta(
                            report.totals.expenses,
                            prevTotals.expenses,
                          );
                          if (p === null) return "—";
                          if (Math.abs(p) < 0.5) return "Stable";
                          return `${p >= 0 ? "+" : "−"}${Math.round(Math.abs(p))}%`;
                        })()
                      : "—"}
                  </span>
                  {prevReport ? (
                    <span>
                      {moneyDeltaNote(
                        report.totals.expenses,
                        prevTotals.expenses,
                        formatMoney,
                      ) ?? ""}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}

            <MetricCard
              title="Monthly expenses"
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
              className={heroCat ? "" : "lg:col-span-3"}
            />
          </div>

          {otherCats.length > 0 ? (
            <div>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">
                Category breakdown
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {otherCats.map((c, i) => {
                  const amt = Number.parseFloat(c.amount) || 0;
                  const pct =
                    totalExpensesNum > 0
                      ? Math.min(
                          100,
                          Math.round((amt / totalExpensesNum) * 100),
                        )
                      : 0;
                  return (
                    <div
                      key={(c.id ?? "u") + c.name + i}
                      className="rounded-2xl border border-[#1f2a33] bg-[#0c1016]/90 p-4 shadow-lg shadow-black/25 transition-all duration-300 hover:border-[#22c55e]/25"
                    >
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        {c.name}
                      </p>
                      <p className="mt-2 text-lg font-bold tabular-nums text-white">
                        {formatMoney(c.amount)}
                      </p>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full ${i % 3 === 1 ? "bg-rose-400/90" : "bg-[#22c55e]"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-[#22c55e]/25 bg-[#0c1210]/90 p-4 text-sm text-gray-300 shadow-lg shadow-[#22c55e]/5 backdrop-blur-sm sm:p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#86efac]">
              Live system insight
            </p>
            <p className="mt-2 leading-relaxed">
              {heroCat
                ? `${heroCat.name} is your top spend lane this period. ${heroPct >= 35 ? "Consider reviewing recurring commitments in this bucket." : "Your spend looks reasonably distributed across categories."}`
                : "Add categorized expenses to unlock automatic spend insights."}
            </p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
              System status · optimal · secured session
            </p>
          </div>
        </>
      ) : null}

      <TransactionsTable
        items={items}
        categoryLabel={categoryLabel}
        onEdit={openEditModal}
        onDelete={handleDelete}
        disabled={deleting}
        deleteInProgress={deleting}
        onAddFirst={openAddModal}
      />

      {meta && meta.totalPages > 1 ? (
        <div className="flex justify-between border-t border-white/10 pt-4">
          <Button
            variant="secondary"
            className="!border-white/15 !bg-white/5 !text-gray-200"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            className="!border-white/15 !bg-white/5 !text-gray-200"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      ) : null}

      <TransactionModal
        open={modalOpen}
        onClose={closeModal}
        categories={expenseCategories}
        onSuccess={() => load()}
        editTransaction={editTransaction ?? undefined}
        onCategoryCreated={mergeCategory}
        defaultType="EXPENSE"
      />
    </div>
  );
}
