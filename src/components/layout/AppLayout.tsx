"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { PL_OPEN_ADD_TX } from "@/lib/ui/pl-events";

type AppLayoutProps = {
  children: ReactNode;
  userEmail: string;
  topBarSearchPlaceholder?: string;
};

/**
 * Premium fintech shell: fixed sidebar, top bar, global “N” shortcut for add transaction.
 */
export function AppLayout({
  children,
  userEmail,
  topBarSearchPlaceholder,
}: AppLayoutProps) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== "n") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (
        el?.closest(
          'input, textarea, select, [contenteditable="true"], [role="textbox"]',
        )
      ) {
        return;
      }
      e.preventDefault();
      window.dispatchEvent(new CustomEvent(PL_OPEN_ADD_TX));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white antialiased">
      <div className="flex min-h-screen">
        {navOpen ? (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 top-16 z-80 bg-black/65 pl-animate-backdrop backdrop-blur-sm lg:hidden"
            onClick={() => setNavOpen(false)}
          />
        ) : null}
        <Sidebar
          mobileOpen={navOpen}
          onNavigate={() => setNavOpen(false)}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col pl-0 lg:pl-72">
          <TopBar
            userEmail={userEmail}
            searchPlaceholder={topBarSearchPlaceholder}
            onOpenMobileNav={() => setNavOpen(true)}
          />
          <main className="pb-safe relative flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
            <div
              className="pointer-events-none absolute inset-0 bg-linear-to-br from-[#22c55e]/6 via-transparent to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[36px_36px] opacity-35"
              aria-hidden
            />
            <div className="relative z-10 mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
