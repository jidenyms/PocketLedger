"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { TxRow } from "@/components/dashboard/transactions-table";

type CategoryRow = { id: string; name: string; type: string; createdAt: string };

type Props = {
  open: boolean;
  onClose: () => void;
  categories: CategoryRow[];
  onSuccess: () => void;
  /** When set, modal edits this transaction (PATCH). */
  editTransaction?: TxRow | null;
  onCategoryCreated?: (cat: CategoryRow) => void;
  /** Default tab for new transactions (ignored when editing). */
  defaultType?: "INCOME" | "EXPENSE";
};

export function TransactionModal({
  open,
  onClose,
  categories,
  onSuccess,
  editTransaction,
  onCategoryCreated,
  defaultType = "EXPENSE",
}: Props) {
  const isEdit = Boolean(editTransaction?.id);

  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);

  const [newCatName, setNewCatName] = useState("");
  const [newCatPending, setNewCatPending] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);

  const formKey = editTransaction?.id ?? "__add__";
  useEffect(() => {
    if (!open) return;
    setShowNewCategory(false);
    setNewCatName("");
    if (editTransaction) {
      setType(editTransaction.type as "INCOME" | "EXPENSE");
      setAmount(editTransaction.amount);
      setDate(editTransaction.date);
      setCategoryId(editTransaction.categoryId ?? "");
      setDescription(editTransaction.description ?? "");
    } else {
      setType(defaultType);
      setAmount("");
      setDate(new Date().toISOString().slice(0, 10));
      setCategoryId("");
      setDescription("");
    }
  }, [open, formKey, editTransaction, defaultType]);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type],
  );

  async function createInlineCategory() {
    const name = newCatName.trim();
    if (!name) {
      toast.error("Enter a category name");
      return;
    }
    setNewCatPending(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, type }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Could not create");
        return;
      }
      const item = data.item as CategoryRow | undefined;
      if (item) {
        onCategoryCreated?.(item);
        setCategoryId(item.id);
        toast.success("Category added");
        setNewCatName("");
        setShowNewCategory(false);
      }
    } finally {
      setNewCatPending(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const body = {
        type,
        amount,
        date: new Date(date + "T12:00:00.000Z").toISOString(),
        description: description.trim() || undefined,
        categoryId: categoryId || null,
      };

      const url = isEdit
        ? `/api/transactions/${editTransaction!.id}`
        : "/api/transactions";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(
          typeof data.error === "string" ? data.error : "Could not save transaction",
        );
        return;
      }
      toast.success(isEdit ? "Transaction updated" : "Transaction added");
      onSuccess();
      onClose();
    } finally {
      setPending(false);
    }
  }

  const fin =
    "rounded-xl! border-[#1f2a33]! bg-[#0c1016]! text-white! placeholder:text-gray-500! focus:border-[#22c55e]/55! focus:ring-[#22c55e]/20!";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit transaction" : "New transaction"}
    >
      <form
        onSubmit={onSubmit}
        className="flex max-h-[min(78dvh,560px)] flex-col gap-4 overflow-y-auto pb-1 pr-1 sm:max-h-[min(70vh,520px)]"
      >
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
            Description
          </label>
          <Input
            placeholder="e.g. Monthly coffee subscription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={fin}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
            Type
          </label>
          <Select
            value={type}
            onChange={(e) => {
              setType(e.target.value as "INCOME" | "EXPENSE");
              setCategoryId("");
            }}
            className={fin}
          >
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </Select>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
              Amount ($)
            </label>
            <Input
              inputMode="decimal"
              placeholder="0.00"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={fin}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
              Date
            </label>
            <Input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={fin}
            />
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
              Category
            </label>
            <button
              type="button"
              className="text-xs font-semibold text-[#5af0b0] hover:underline"
              onClick={() => setShowNewCategory((s) => !s)}
            >
              {showNewCategory ? "Hide new category" : "+ New category"}
            </button>
          </div>
          {showNewCategory ? (
            <div className="mb-3 flex flex-col gap-2 rounded-xl border border-[#22c55e]/25 bg-[#22c55e]/8 p-3">
              <Input
                placeholder="Category name"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className={fin}
              />
              <Button
                type="button"
                variant="secondary"
                className="w-full border-white/15! bg-white/5! text-gray-200!"
                loading={newCatPending}
                onClick={() => createInlineCategory()}
              >
                Create & select
              </Button>
            </div>
          ) : null}
          <Select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={fin}
          >
            <option value="">Select category</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="rounded-2xl border border-dashed border-white/15 bg-[#0a0e14] px-4 py-8 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-sm text-gray-400">
            Drop receipt image or{" "}
            <span className="cursor-default font-semibold text-[#5af0b0] underline decoration-[#22c55e]/50">
              browse
            </span>
          </p>
          <p className="mt-1 text-xs text-gray-600">
            Attachments coming soon — visuals only for now.
          </p>
        </div>
        <div className="grid grid-cols-5 gap-3 border-t border-[#1f2a33] pt-5">
          <Button
            type="button"
            variant="secondary"
            className="col-span-2 border-white/20! bg-[#1a222c]! py-3! text-white! hover:bg-white/10!"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="neon"
            loading={pending}
            className="col-span-3 py-3! font-bold"
          >
            {isEdit ? "Save changes" : "Save transaction"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
