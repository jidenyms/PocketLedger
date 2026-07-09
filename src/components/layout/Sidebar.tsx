"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function NavIcon({
  name,
  className = "h-5 w-5",
}: {
  name: "dashboard" | "transactions" | "income" | "expenses" | "reports" | "settings";
  className?: string;
}) {
  const common = `${className} shrink-0`;
  switch (name) {
    case "dashboard":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case "transactions":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
    case "income":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );
    case "expenses":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      );
    case "reports":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case "settings":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return null;
  }
}

function NavItem({
  href,
  icon,
  label,
  onNavigate,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active =
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={() => onNavigate?.()}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
        active
          ? "bg-[#22c55e]/15 text-[#22c55e] shadow-lg shadow-[#22c55e]/10 ring-1 ring-[#22c55e]/30"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span
        className={
          active
            ? "text-[#22c55e]"
            : "text-gray-500 transition-colors group-hover:text-[#22c55e]/80"
        }
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}

type SidebarProps = {
  /** When true on small screens, sidebar is visible (drawer). Ignored on lg+. */
  mobileOpen?: boolean;
  /** Called after a nav link is chosen (e.g. close mobile drawer). */
  onNavigate?: () => void;
};

export function Sidebar({ mobileOpen = false, onNavigate }: SidebarProps) {
  return (
    <aside
      className={`fixed left-0 z-90 flex w-[min(18rem,85vw)] flex-col border-r border-[#1f2a33] bg-[#090d12]/95 shadow-2xl shadow-black/40 backdrop-blur-xl transition-transform duration-300 ease-out motion-reduce:transition-none lg:w-72 lg:shadow-none ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } top-16 h-[calc(100dvh-4rem)] lg:top-0 lg:h-screen lg:translate-x-0`}
    >
      <div className="flex h-16 items-center gap-2 border-b border-[#1f2a33] px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-[#22c55e]/35 to-transparent text-lg font-bold text-[#5af0b0] shadow-lg shadow-[#22c55e]/25">
          P
        </span>
        <span className="text-[1.35rem] font-semibold tracking-[0.08em] text-[#6af7be]">
          PocketLedger
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          Menu
        </p>
        <NavItem
          href="/dashboard"
          label="Dashboard"
          icon={<NavIcon name="dashboard" />}
          onNavigate={onNavigate}
        />
        <NavItem
          href="/transactions"
          label="Transactions"
          icon={<NavIcon name="transactions" />}
          onNavigate={onNavigate}
        />
        <NavItem
          href="/income"
          label="Income"
          icon={<NavIcon name="income" />}
          onNavigate={onNavigate}
        />
        <NavItem
          href="/expenses"
          label="Expenses"
          icon={<NavIcon name="expenses" />}
          onNavigate={onNavigate}
        />
        <NavItem
          href="/reports"
          label="Reports"
          icon={<NavIcon name="reports" />}
          onNavigate={onNavigate}
        />
        <NavItem
          href="/settings"
          label="Settings"
          icon={<NavIcon name="settings" />}
          onNavigate={onNavigate}
        />
      </nav>
      <div className="border-t border-[#1f2a33] p-4">
        <div className="rounded-2xl border border-[#23303a] bg-[#121821] p-4 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#22c55e]">
            Premium
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Unlock deeper analytics when you&apos;re ready.
          </p>
          <button
            type="button"
            className="mt-3 w-full rounded-xl bg-[#22c55e] py-2.5 text-sm font-semibold text-[#0B0F14] shadow-lg shadow-[#22c55e]/25 transition-all duration-300 hover:bg-[#4ade80]"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </aside>
  );
}
