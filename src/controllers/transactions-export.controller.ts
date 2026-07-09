import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { logUserAction } from "@/lib/observability/user-action-log";
import { listTransactionsForExport } from "@/services/transaction.service";

function escapeCsvCell(value: string | null | undefined): string {
  const s = value ?? "";
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function exportTransactionsCsvController() {
  const ctx = await requireAuth();
  const rows = await listTransactionsForExport(ctx);
  logUserAction(ctx, {
    action: "EXPORT_TRIGGERED",
    meta: { rowCount: rows.length, format: "csv" },
  });

  const header = [
    "date",
    "type",
    "amount",
    "category_id",
    "description",
    "id",
    "created_at",
  ];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        escapeCsvCell(r.date),
        escapeCsvCell(r.type),
        escapeCsvCell(r.amount),
        escapeCsvCell(r.categoryId),
        escapeCsvCell(r.description),
        escapeCsvCell(r.id),
        escapeCsvCell(r.createdAt),
      ].join(","),
    ),
  ];

  const csv = "\uFEFF" + lines.join("\r\n");
  const filename = `pocketledger-transactions-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
