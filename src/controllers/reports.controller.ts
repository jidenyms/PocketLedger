import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/require-auth";
import { financialReport, monthlySummary } from "@/services/report.service";

const optionalDateQuery = z.preprocess(
  (val) => (val === "" || val == null ? undefined : val),
  z.coerce.date().optional(),
);

const reportsQuerySchema = z.object({
  from: optionalDateQuery,
  to: optionalDateQuery,
});

const monthlyQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

/** GET /api/reports — totals + transactions grouped by month (optional date range). */
export async function financialReportController(request: Request) {
  const ctx = await requireAuth();
  const url = new URL(request.url);
  const q = reportsQuerySchema.parse(
    Object.fromEntries(url.searchParams.entries()),
  );
  const report = await financialReport(ctx, { from: q.from, to: q.to });
  return NextResponse.json({ report });
}

export async function monthlyReportController(request: Request) {
  const ctx = await requireAuth();
  const url = new URL(request.url);
  const q = monthlyQuerySchema.parse(
    Object.fromEntries(url.searchParams.entries()),
  );
  const summary = await monthlySummary(ctx, q.year, q.month);
  return NextResponse.json({ summary });
}
