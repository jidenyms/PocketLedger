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

type ReportShape = {
  totals: { income: string; expenses: string; profit: string };
  transactionCount: number;
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

export function IncomePageClient() {
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
        type: "INCOME",
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
        toast.error("Could not load income data");
        return;
      }
      const repBody = await parseJson<{ report: ReportShape }>(repRes);
      const prevBody = await parseJson<{ report: ReportShape }>(prevRes);
      const txBody = await parseJson<{ items: TxRow[]; meta: PaginatedMeta }>(
        txRes,
      );
      const catBody = await parseJson<{ items: CategoryRow[] }>(catRes);
      setReport(repBody?.report ?? null);
      setPrevReport(prevBody?.report ?? null);
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

  const progressToGoal = useMemo(() => {
    if (!report) return 66;
    const goal =
      (Number.parseFloat(prevTotals.income) || 0) * 1.15 || 1;
    const cur = Number.parseFloat(report.totals.income) || 0;
    return Math.min(100, Math.round((cur / goal) * 100));
  }, [report, prevTotals.income]);

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

  const incomeCategories = categories.filter((c) => c.type === "INCOME");

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="pl-text-eyebrow">Revenue desk</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Income overview
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
            Track incoming cash with the same clarity as your outflows — know
            what landed, when, and how it stacks vs last month.
          </p>
          <p className="mt-2 text-xs text-gray-600">{label} (UTC)</p>
        </div>
        <Button variant="neon" onClick={openAddModal} className="shrink-0 font-semibold">
          + Add new income
        </Button>
      </div>

      {report ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MetricCard
              title="Total income this month"
              amount={formatMoney(report.totals.income)}
              changePercent={
                prevReport
                  ? pctDelta(report.totals.income, prevTotals.income)
                  : null
              }
              variant="income"
              subtitle="MoM %"
              featured
              footnote={
                prevReport
                  ? moneyDeltaNote(
                      report.totals.income,
                      prevTotals.income,
                      formatMoney,
                    ) ?? undefined
                  : undefined
              }
            />
          </div>
          <div className="rounded-3xl border border-[#1f2a33] bg-[#0c1016]/95 p-5 shadow-xl shadow-black/30 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#22c55e]/30 bg-[#22c55e]/10 text-[#5af0b0]">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Live revenue stream
                </p>
                <p className="text-sm text-gray-300">
                  Real-time tracking of incoming payments.
                </p>
              </div>
            </div>
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-xs font-semibold text-gray-400">
                <span>Progress vs stretch goal</span>
                <span className="text-[#5af0b0]">{progressToGoal}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-linear-to-r from-[#22c55e] to-[#4ade80] shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                  style={{ width: `${progressToGoal}%` }}
                />
              </div>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-[#86efac]">
                Active · synced
              </p>
            </div>
          </div>
        </div>
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
        categories={incomeCategories}
        onSuccess={() => load()}
        editTransaction={editTransaction ?? undefined}
        onCategoryCreated={mergeCategory}
        defaultType="INCOME"
      />
    </div>
  );
}
