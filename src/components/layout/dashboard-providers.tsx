"use client";

import { CurrencyProvider } from "@/contexts/currency-context";

export function DashboardProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CurrencyProvider>{children}</CurrencyProvider>;
}
