"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

export function SignupForm() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          ...(name.trim() ? { name: name.trim() } : {}),
        }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not sign up");
        return;
      }
      if (data.user) setUser(data.user);
      router.push("/dashboard");
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
        Name (optional)
        <input
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-white/12 bg-white/4 px-3.5 py-2.5 text-white outline-none transition-all duration-200 placeholder:text-gray-500 focus:border-[#22c55e]/60 focus:bg-white/6 focus:ring-2 focus:ring-[#22c55e]/25"
        />
      </label>
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
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl border border-white/12 bg-white/4 px-3.5 py-2.5 text-white outline-none transition-all duration-200 placeholder:text-gray-500 focus:border-[#22c55e]/60 focus:bg-white/6 focus:ring-2 focus:ring-[#22c55e]/25"
        />
      </label>
      <p className="text-xs text-gray-500">Use at least 8 characters.</p>
      <Button type="submit" loading={pending} variant="neon" className="mt-3 w-full py-3">
        Create account
      </Button>
      <p className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#86efac] hover:text-[#bbf7d0]">
          Log in
        </Link>
      </p>
    </form>
  );
}
