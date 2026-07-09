"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active =
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      }`}
    >
      {children}
    </Link>
  );
}

export function DashboardHeader() {
  const router = useRouter();
  const clear = useAuthStore((s) => s.clear);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    clear();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo href="/dashboard" />
        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink href="/dashboard">Overview</NavLink>
          <NavLink href="/dashboard/reports">Reports</NavLink>
          <NavLink href="/dashboard/settings">Settings</NavLink>
          <Button type="button" variant="ghost" className="!py-2" onClick={() => logout()}>
            Log out
          </Button>
        </nav>
      </div>
    </header>
  );
}
