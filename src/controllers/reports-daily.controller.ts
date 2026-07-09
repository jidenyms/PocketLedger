import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { dailyFinancialSummary } from "@/services/report.service";

export async function dailyReportController() {
  const ctx = await requireAuth();
  const summary = await dailyFinancialSummary(ctx, new Date());
  return NextResponse.json({ summary });
}
