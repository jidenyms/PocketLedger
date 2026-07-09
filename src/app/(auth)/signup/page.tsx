import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  return (
    <div className="relative mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-14 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-12 top-10 h-28 rounded-full bg-[#22c55e]/20 blur-3xl"
      />
      <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-white/5 p-7 shadow-2xl shadow-black/35 ring-1 ring-white/10 backdrop-blur-xl sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#86efac]">
          Get started
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
          Create account
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-400">
          Set up your workspace in minutes and start tracking profit with clear,
          simple numbers.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Need to review your public page?{" "}
          <Link href="/" className="font-medium text-[#86efac] hover:text-[#bbf7d0]">
            Home
          </Link>
        </p>
        <SignupForm />
      </div>
    </div>
  );
}
