import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAuth, type AuthContext } from "@/lib/auth/require-auth";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  let ctx: AuthContext;
  try {
    ctx = await requireAuth();
  } catch {
    redirect("/login");
  }
  return <DashboardClient email={ctx.email} />;
}
