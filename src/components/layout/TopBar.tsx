"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Input } from "@/components/ui/input";

export function TopBar({
  userEmail,
  searchPlaceholder = "Search transactions…",
  onOpenMobileNav,
}: {
  userEmail: string;
  searchPlaceholder?: string;
  onOpenMobileNav?: () => void;
}) {
  const router = useRouter();
  const clear = useAuthStore((s) => s.clear);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    clear();
    router.push("/login");
    router.refresh();
  }

  const displayName = userEmail.split("@")[0] ?? "Account";

  return (
    <header className="sticky top-0 z-100 border-b border-[#1d2730] bg-[#0B0F14]/90 shadow-sm shadow-black/20 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-3 sm:gap-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => onOpenMobileNav?.()}
          className="group shrink-0 rounded-xl p-2 text-gray-400 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95 lg:hidden"
          aria-label="Open navigation menu"
        >
          <svg
            className="h-6 w-6 transition-transform duration-300 group-hover:scale-105"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div className="relative hidden min-w-0 max-w-xl flex-1 sm:block">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <Input
            type="search"
            className="rounded-xl! border-[#1f2a33]! bg-[#0f141c]! py-2! pl-10! text-sm! text-white! placeholder:text-gray-500! focus:border-[#22c55e]/50! focus:ring-[#22c55e]/20!"
            placeholder={searchPlaceholder}
            aria-label="Search"
          />
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="relative rounded-xl p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Notifications"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#22c55e] ring-2 ring-[#0B0F14]" />
          </button>
          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <p className="text-sm font-medium text-white capitalize">
                {displayName}
              </p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-[#22c55e]/90">
                Member
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-[#22c55e]/40 to-white/10 text-sm font-semibold text-white ring-2 ring-white/10">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="hidden rounded-xl border border-white/10 px-2.5 py-2 text-[11px] font-medium text-gray-400 transition-all duration-300 hover:border-white/20 hover:text-white active:scale-95 sm:px-3 sm:text-xs lg:inline-flex"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
