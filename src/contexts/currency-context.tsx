"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PublicUser } from "@/types";
import { formatMoney as formatMoneyUtil } from "@/lib/format/currency";

type CurrencyContextValue = {
  currency: string;
  /** Sync from login / signup / settings response. */
  syncFromUser: (user: PublicUser) => void;
  /** Refetch /api/auth/me (e.g. after settings save). */
  refresh: () => Promise<void>;
  formatMoney: (amount: string | number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState("USD");

  const refresh = useCallback(async () => {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (!res.ok) return;
    const data = (await res.json()) as { user?: PublicUser };
    if (data.user?.preferredCurrency) {
      setCurrency(data.user.preferredCurrency);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const syncFromUser = useCallback((user: PublicUser) => {
    if (user.preferredCurrency) setCurrency(user.preferredCurrency);
  }, []);

  const formatMoney = useCallback(
    (amount: string | number) => formatMoneyUtil(amount, currency),
    [currency],
  );

  const value = useMemo(
    () => ({ currency, syncFromUser, refresh, formatMoney }),
    [currency, syncFromUser, refresh, formatMoney],
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

/** Falls back to USD when used outside `CurrencyProvider`. */
export function useUserCurrency() {
  const ctx = useContext(CurrencyContext);
  const currency = ctx?.currency ?? "USD";
  const formatMoney = useCallback(
    (amount: string | number) => formatMoneyUtil(amount, currency),
    [currency],
  );
  return { currency, formatMoney, refresh: ctx?.refresh, syncFromUser: ctx?.syncFromUser };
}
