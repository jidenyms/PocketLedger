import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { DashboardProviders } from "@/components/layout/dashboard-providers";
import { AppLayout } from "@/components/layout/AppLayout";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let ctx;
  try {
    ctx = await requireAuth();
  } catch {
    redirect("/login");
  }

  return (
    <DashboardProviders>
      <AppLayout userEmail={ctx.email}>{children}</AppLayout>
    </DashboardProviders>
  );
}
