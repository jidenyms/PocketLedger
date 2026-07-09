"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PL_OPEN_ADD_TX } from "@/lib/ui/pl-events";

const links = [
  { href: "/dashboard", label: "Ledger", icon: "grid" as const },
  { href: "/transactions", label: "History", icon: "list" as const },
  { href: "/reports", label: "Reports", icon: "chart" as const },
];

function Icon({ type }: { type: "grid" | "list" | "plus" | "chart" }) {
  const c = "h-5 w-5";
  if (type === "grid") {
    return (
      <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
          d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 3h7v4h-7v-4z"
        />
      </svg>
    );
  }
  if (type === "list") {
    return (
      <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
          d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"
        />
      </svg>
    );
  }
  if (type === "plus") {
    return (
      <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M12 5v14m-7-7h14"
        />
      </svg>
    );
  }
  return (
    <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.6}
        d="M4 19h16M7 16V8m5 8V5m5 11v-6"
      />
    </svg>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-safe fixed inset-x-3 bottom-2 z-95 rounded-2xl border border-white/10 bg-[#0e1219]/95 px-1 py-2 shadow-2xl shadow-black/40 backdrop-blur-xl lg:hidden">
      <ul className="grid grid-cols-4 gap-1">
        {links.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-medium transition-all duration-300 active:scale-95 ${
                  active
                    ? "bg-[#22c55e]/14 text-[#5af0b0] ring-1 ring-[#22c55e]/28"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`}
              >
                <Icon type={item.icon} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new CustomEvent(PL_OPEN_ADD_TX))
            }
            className="flex w-full flex-col items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-semibold text-[#08120e] transition-all duration-300 active:scale-95"
          >
            <span className="rounded-full bg-[#5af0b0] p-1.5 pl-glow-neon shadow-lg shadow-[#22c55e]/30 ring-2 ring-[#22c55e]/40">
              <Icon type="plus" />
            </span>
            <span className="text-[#5af0b0]">Add</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
