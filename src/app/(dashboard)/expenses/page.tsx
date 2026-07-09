import type { Metadata } from "next";
import { ExpensesPageClient } from "@/components/dashboard/expenses-page-client";

export const metadata: Metadata = {
  title: "Expenses",
};

export default function ExpensesPage() {
  return <ExpensesPageClient />;
}
