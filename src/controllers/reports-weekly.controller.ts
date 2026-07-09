import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { weeklyComparisonReport } from "@/services/report.service";

export async function weeklyReportController() {
  const ctx = await requireAuth();
  const comparison = await weeklyComparisonReport(ctx);
  return NextResponse.json({ comparison });
}
