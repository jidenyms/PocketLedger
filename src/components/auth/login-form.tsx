"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Login failed");
        return;
      }
      if (data.user) setUser(data.user);
      const next = searchParams.get("next");
      router.push(
        next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard",
      );
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-7 flex flex-col gap-4">
      {error ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/15 px-3 py-2.5 text-sm text-red-100">
          {error}
        </p>
      ) : null}
      <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-200">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-white/12 bg-white/4 px-3.5 py-2.5 text-white outline-none transition-all duration-200 placeholder:text-gray-500 focus:border-[#22c55e]/60 focus:bg-white/6 focus:ring-2 focus:ring-[#22c55e]/25"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-200">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl border border-white/12 bg-white/4 px-3.5 py-2.5 text-white outline-none transition-all duration-200 placeholder:text-gray-500 focus:border-[#22c55e]/60 focus:bg-white/6 focus:ring-2 focus:ring-[#22c55e]/25"
        />
      </label>
      <Button type="submit" loading={pending} variant="neon" className="mt-3 w-full py-3">
        Sign in
      </Button>
      <p className="text-center text-sm text-gray-400">
        No account?{" "}
        <Link href="/signup" className="font-medium text-[#86efac] hover:text-[#bbf7d0]">
          Sign up
        </Link>
      </p>
    </form>
  );
}
