import type { Metadata } from "next";
import { IncomePageClient } from "@/components/dashboard/income-page-client";

export const metadata: Metadata = {
  title: "Income",
};

export default function IncomePage() {
  return <IncomePageClient />;
}
