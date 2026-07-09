import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAuth, type AuthContext } from "@/lib/auth/require-auth";
import { rollingTwelveMonthUtcRange } from "@/lib/reports/default-range";
import { financialReport } from "@/services/report.service";
import { ReportsPageClient } from "@/components/dashboard/reports-page-client";

export const metadata: Metadata = {
  title: "Reports",
};

export default async function ReportsPage() {
  let ctx: AuthContext;
  try {
    ctx = await requireAuth();
  } catch {
    redirect("/login");
  }
  const range = rollingTwelveMonthUtcRange();
  const report = await financialReport(ctx, { from: range.from, to: range.to });
  return (
    <ReportsPageClient initialReport={report} subtitle={range.subtitle} />
  );
}
