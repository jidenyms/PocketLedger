"use client";

import { useState } from "react";
import { useUserCurrency } from "@/contexts/currency-context";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export type TxRow = {
  id: string;
  type: string;
  amount: string;
  description: string | null;
  date: string;
  categoryId: string | null;
};

export function TransactionsTable({
  items,
  categoryLabel,
  onEdit,
  onDelete,
  disabled,
  onAddFirst,
  deleteInProgress = false,
}: {
  items: TxRow[];
  categoryLabel: (categoryId: string | null) => string;
  onEdit?: (row: TxRow) => void;
  onDelete: (id: string) => void | Promise<void>;
  disabled?: boolean;
  onAddFirst?: () => void;
  deleteInProgress?: boolean;
}) {
  const { formatMoney } = useUserCurrency();
  const [pendingDelete, setPendingDelete] = useState<TxRow | null>(null);

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await Promise.resolve(onDelete(pendingDelete.id));
    } finally {
      setPendingDelete(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-12 text-center backdrop-blur-sm sm:px-6 sm:py-16">
        <p className="text-sm font-semibold text-white">
          Every sale and bill in one trusted timeline
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-400">
          Start tracking your income and expenses to see your real profit. Add
          your first entry — weekly views, exports, and category breakdowns come
          alive once data is here.
        </p>
        {onAddFirst ? (
          <div className="mt-6">
            <Button type="button" variant="neon" onClick={onAddFirst}>
              Add your first transaction
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  const del = pendingDelete;
  const deleteDescription = del
    ? `You’re about to remove a ${del.type === "INCOME" ? "income" : "expense"} entry dated ${del.date} for ${formatMoney(del.amount)}${
        del.description ? ` (“${del.description}”)` : ""
      }. This cannot be undone, and your totals will update immediately.`
    : "";

  return (
    <>
      <div className="space-y-3 sm:hidden">
        {items.map((row) => (
          <div
            key={row.id}
            className="rounded-2xl border border-white/10 bg-white/4 p-4 shadow-lg shadow-black/20 ring-1 ring-white/5 transition-all duration-300 hover:border-white/15"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-gray-500">{row.date}</p>
                <p className="mt-1 text-sm font-medium text-gray-200">
                  {categoryLabel(row.categoryId)}
                </p>
                {row.description ? (
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">
                    {row.description}
                  </p>
                ) : null}
              </div>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                  row.type === "INCOME"
                    ? "bg-[#22c55e]/20 text-[#4ade80] ring-1 ring-[#22c55e]/30"
                    : "bg-white/10 text-gray-300"
                }`}
              >
                {row.type === "INCOME" ? "Income" : "Expense"}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
              <p
                className={`text-base font-semibold tabular-nums ${
                  row.type === "INCOME" ? "text-[#4ade80]" : "text-gray-100"
                }`}
              >
                {row.type === "INCOME" ? "+" : "−"}
                {formatMoney(row.amount)}
              </p>
              <div className="flex items-center gap-1">
                {onEdit ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="px-2.5! py-1.5! text-gray-400! hover:bg-white/10! hover:text-white!"
                    disabled={disabled}
                    onClick={() => onEdit(row)}
                  >
                    Edit
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  className="px-2.5! py-1.5! text-xs! text-rose-400! hover:bg-rose-500/10!"
                  disabled={disabled}
                  onClick={() => setPendingDelete(row)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden -mx-1 max-h-[min(55vh,420px)] overflow-hidden rounded-2xl border border-white/10 bg-white/4 shadow-lg shadow-black/20 ring-1 ring-white/5 sm:mx-0 sm:block sm:max-h-none">
        <div className="overflow-x-auto overflow-y-auto overscroll-x-contain sm:overflow-y-visible">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-white/10 bg-[#0B0F14]/95 backdrop-blur-md">
                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold text-gray-400 sm:px-5 sm:py-3.5 sm:text-sm">
                  Date
                </th>
                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold text-gray-400 sm:px-5 sm:py-3.5 sm:text-sm">
                  Type
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400 sm:px-5 sm:py-3.5 sm:text-sm">
                  Category
                </th>
                <th className="hidden px-5 py-3.5 text-left text-sm font-semibold text-gray-400 sm:table-cell">
                  Note
                </th>
                <th className="whitespace-nowrap px-3 py-3 text-right text-xs font-semibold text-gray-400 sm:px-5 sm:py-3.5 sm:text-sm">
                  Amount
                </th>
                <th className="w-[100px] px-2 py-3 sm:w-36 sm:px-3" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors duration-300 hover:bg-white/4"
                >
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums text-gray-300 sm:px-5 sm:py-3.5">
                    {row.date}
                  </td>
                  <td className="px-3 py-3 sm:px-5 sm:py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        row.type === "INCOME"
                          ? "bg-[#22c55e]/20 text-[#4ade80] ring-1 ring-[#22c55e]/30"
                          : "bg-white/10 text-gray-300"
                      }`}
                    >
                      <span className="sm:hidden">
                        {row.type === "INCOME" ? "In" : "Out"}
                      </span>
                      <span className="hidden sm:inline">
                        {row.type === "INCOME" ? "Income" : "Expense"}
                      </span>
                    </span>
                  </td>
                  <td className="max-w-[100px] truncate px-3 py-3 text-gray-400 sm:max-w-[140px] sm:px-5 sm:py-3.5">
                    {categoryLabel(row.categoryId)}
                  </td>
                  <td className="hidden max-w-[200px] truncate px-5 py-3.5 text-gray-400 sm:table-cell">
                    {row.description || "—"}
                  </td>
                  <td
                    className={`whitespace-nowrap px-3 py-3 text-right text-sm font-medium tabular-nums sm:px-5 sm:py-3.5 sm:text-base ${
                      row.type === "INCOME"
                        ? "text-[#4ade80]"
                        : "text-gray-100"
                    }`}
                  >
                    {row.type === "INCOME" ? "+" : "−"}
                    {formatMoney(row.amount)}
                  </td>
                  <td className="px-2 py-2 sm:px-3 sm:py-3.5">
                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-end sm:gap-1">
                      {onEdit ? (
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-2! py-1.5! text-gray-400! hover:bg-white/10! hover:text-white!"
                          disabled={disabled}
                          onClick={() => onEdit(row)}
                        >
                          Edit
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="ghost"
                        className="px-2! py-1.5! text-xs! text-rose-400! hover:bg-rose-500/10!"
                        disabled={disabled}
                        onClick={() => setPendingDelete(row)}
                      >
                        <span className="sm:hidden">Del</span>
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => !deleteInProgress && setPendingDelete(null)}
        title="Delete this transaction?"
        description={deleteDescription}
        confirmLabel="Yes, delete"
        cancelLabel="Keep it"
        variant="danger"
        loading={deleteInProgress}
        onConfirm={confirmDelete}
      />
    </>
  );
}
