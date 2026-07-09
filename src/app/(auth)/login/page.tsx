import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <div className="relative mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-14 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-12 top-10 h-28 rounded-full bg-[#22c55e]/20 blur-3xl"
      />
      <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-white/5 p-7 shadow-2xl shadow-black/35 ring-1 ring-white/10 backdrop-blur-xl sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#86efac]">
          Welcome back
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
          Log in
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-400">
          Access your business dashboard and get instant clarity on your income,
          expenses, and profit.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Need to review your public page?{" "}
          <Link href="/" className="font-medium text-[#86efac] hover:text-[#bbf7d0]">
            Home
          </Link>
        </p>
        <Suspense fallback={<p className="mt-8 text-sm text-gray-500">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
