"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  TransactionsTable,
  type TxRow,
} from "@/components/dashboard/transactions-table";
import { TransactionModal } from "@/components/dashboard/transaction-modal";
import { CreateFirstCategoryScreen } from "@/components/dashboard/create-first-category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { usePlOpenAddTransaction } from "@/hooks/use-pl-open-add-transaction";

type CategoryRow = { id: string; name: string; type: string; createdAt: string };

type PaginatedMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

async function parseJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const inputFintech =
  "rounded-xl! border-[#1f2a33]! bg-[#0c1016]! py-2.5! text-white! placeholder:text-gray-500! focus:border-[#22c55e]/50! focus:ring-[#22c55e]/15!";

export function TransactionsPageClient() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [items, setItems] = useState<TxRow[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const editTransaction = useMemo(
    () =>
      editingId ? (items.find((t) => t.id === editingId) ?? null) : null,
    [editingId, items],
  );

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      const q = new URLSearchParams();
      q.set("page", String(page));
      q.set("limit", "20");
      if (from) q.set("from", from);
      if (to) q.set("to", to);
      if (categoryId) q.set("categoryId", categoryId);

      const [txRes, catRes] = await Promise.all([
        fetch(`/api/transactions?${q}`, { credentials: "include" }),
        fetch("/api/categories", { credentials: "include" }),
      ]);

      if (!txRes.ok || !catRes.ok) {
        setErr("Could not load transactions.");
        toast.error("Could not load data");
        return;
      }

      const txBody = await parseJson<{
        items: TxRow[];
        meta: PaginatedMeta;
      }>(txRes);
      const catBody = await parseJson<{ items: CategoryRow[] }>(catRes);
      setItems(txBody?.items ?? []);
      setMeta(txBody?.meta ?? null);
      setCategories(catBody?.items ?? []);
    } finally {
      setLoading(false);
    }
  }, [page, from, to, categoryId]);

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

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((t) =>
      (t.description ?? "").toLowerCase().includes(q),
    );
  }, [items, search]);

  const chipCategories = useMemo(
    () => categories.slice(0, 4),
    [categories],
  );

  const hasAny = (meta?.total ?? 0) > 0;

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
        await load();
      } else {
        toast.error("Could not delete");
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

  if (loading && categories.length === 0 && !err) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-56 animate-pulse rounded-xl bg-white/10" />
        <div className="h-12 animate-pulse rounded-xl bg-white/10" />
        <div className="h-96 animate-pulse rounded-2xl bg-white/10" />
      </div>
    );
  }

  if (categories.length === 0 && !loading) {
    if (err) {
      return (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center">
          <p className="text-sm text-gray-300">{err}</p>
          <Button variant="neon" className="mt-6" onClick={() => load()}>
            Retry
          </Button>
        </div>
      );
    }
    return <CreateFirstCategoryScreen onCreated={() => load()} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="pl-text-eyebrow">Ledger</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            History
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-400">
            Detailed breakdown of your financial footprint — search, slice, and
            export with one tap.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            variant="secondary"
            className="border-white/15! bg-white/5! text-gray-200!"
            loading={exporting}
            onClick={exportCsv}
          >
            Export CSV
          </Button>
          <Button variant="neon" onClick={openAddModal} className="font-semibold">
            Add transaction
          </Button>
        </div>
      </div>

      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <Input
          type="search"
          placeholder="Search transactions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputFintech} !pl-10`}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setCategoryId("");
            setPage(1);
          }}
          className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 active:scale-95 ${
            categoryId === ""
              ? "bg-[#22c55e] text-[#0B0F14] shadow-md shadow-[#22c55e]/25"
              : "bg-[#1a222c] text-gray-400 ring-1 ring-white/10 hover:bg-white/10 hover:text-white"
          }`}
        >
          All
        </button>
        {chipCategories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setCategoryId((prev) => (prev === c.id ? "" : c.id));
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 active:scale-95 ${
              categoryId === c.id
                ? "bg-[#22c55e] text-[#0B0F14] shadow-md shadow-[#22c55e]/25"
                : "bg-[#1a222c] text-gray-400 ring-1 ring-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid gap-3 rounded-2xl border border-[#1f2a33] bg-[#0c1016]/80 p-4 backdrop-blur-sm sm:grid-cols-2 lg:grid-cols-3">
        <Select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(1);
          }}
          className={`${inputFintech}`}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.type})
            </option>
          ))}
        </Select>
        <Input
          type="date"
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            setPage(1);
          }}
          className={`${inputFintech}`}
        />
        <Input
          type="date"
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
            setPage(1);
          }}
          className={`${inputFintech}`}
        />
      </div>

      {err ? (
        <p className="text-sm text-amber-200">{err}</p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
        {meta ? (
          <span>
            Page {meta.page} of {meta.totalPages} · {meta.total} total
          </span>
        ) : null}
        {search.trim() ? (
          <span>Showing {filteredItems.length} matches on this page</span>
        ) : null}
      </div>

      <TransactionsTable
        items={filteredItems}
        categoryLabel={categoryLabel}
        onEdit={openEditModal}
        onDelete={handleDelete}
        disabled={deleting}
        deleteInProgress={deleting}
        onAddFirst={hasAny ? undefined : openAddModal}
      />

      {meta && meta.totalPages > 1 ? (
        <div className="flex justify-between gap-3 border-t border-white/10 pt-4">
          <Button
            variant="secondary"
            className="!border-white/15 !bg-white/5 !text-gray-200"
            disabled={page <= 1 || deleting}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            className="!border-white/15 !bg-white/5 !text-gray-200"
            disabled={page >= meta.totalPages || deleting}
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      ) : null}

      <TransactionModal
        open={modalOpen}
        onClose={closeModal}
        categories={categories}
        onSuccess={() => load()}
        editTransaction={editTransaction ?? undefined}
        onCategoryCreated={mergeCategory}
      />
    </div>
  );
}
