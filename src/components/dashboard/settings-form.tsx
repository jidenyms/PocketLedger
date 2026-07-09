"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  CURRENCY_LABELS,
  SUPPORTED_CURRENCIES,
} from "@/lib/format/currency";
import { useUserCurrency } from "@/contexts/currency-context";
import type { PublicUser } from "@/types";

const fin =
  "rounded-xl! border-[#1f2a33]! bg-[#0c1016]! text-white! placeholder:text-gray-500! focus:border-[#22c55e]/55! focus:ring-[#22c55e]/15!";

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 ${
        on ? "bg-[#22c55e]" : "bg-white/15"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-300 ${
          on ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function SettingsForm() {
  const { refresh: refreshCurrency } = useUserCurrency();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("UTC-05:00 Eastern");
  const [twoFactor, setTwoFactor] = useState(true);
  const [alertTx, setAlertTx] = useState(true);
  const [alertWeekly, setAlertWeekly] = useState(false);
  const [alertMarketing, setAlertMarketing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/settings", { credentials: "include" });
      if (!res.ok) {
        toast.error("Could not load settings");
        setLoading(false);
        return;
      }
      const data = (await res.json()) as { user: PublicUser };
      setUser(data.user);
      setName(data.user.name ?? "");
      setCurrency(data.user.preferredCurrency ?? "USD");
      setLoading(false);
    })();
  }, []);

  function resetLocal() {
    if (!user) return;
    setName(user.name ?? "");
    setCurrency(user.preferredCurrency ?? "USD");
    setBio("");
    setTimezone("UTC-05:00 Eastern");
    setTwoFactor(true);
    setAlertTx(true);
    setAlertWeekly(false);
    setAlertMarketing(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const body: { name?: string; preferredCurrency?: string } = {};
      if (name.trim() !== (user.name ?? "").trim()) {
        body.name = name.trim();
      }
      if (currency !== user.preferredCurrency) {
        body.preferredCurrency = currency;
      }
      if (Object.keys(body).length === 0) {
        toast.message("Profile & currency already up to date");
        return;
      }

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Could not save");
        return;
      }
      const u = data.user as PublicUser;
      setUser(u);
      toast.success("Saved · profile & currency");
      await refreshCurrency?.();
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-48 rounded-2xl bg-white/10" />
        <div className="h-48 rounded-2xl bg-white/10" />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#1f2a33] bg-[#0c1016]/90 p-6 shadow-xl shadow-black/25 backdrop-blur-md">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22c55e]/15 text-[#5af0b0]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <h2 className="text-lg font-bold text-white">Profile identity</h2>
            </div>
            <span className="rounded-full border border-[#22c55e]/35 bg-[#22c55e]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#86efac]">
              Public info
            </span>
          </div>
          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-linear-to-br from-[#22c55e]/20 to-transparent text-2xl font-bold text-white">
              {(name || user.email).slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 space-y-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
                  Full name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={120}
                  className={fin}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
                  Email address
                </label>
                <div
                  className={`${fin} cursor-not-allowed opacity-80 px-3.5 py-2.5 text-sm`}
                >
                  <span className="block truncate">{user.email}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
              Short bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="A line about your business…"
              className={`w-full resize-none rounded-xl border border-[#1f2a33] bg-[#0c1016] px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-[#22c55e]/55 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/15`}
            />
            <p className="mt-1 text-xs text-gray-600">
              Display-only for now — not stored on the server yet.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-[#1f2a33] bg-[#0c1016]/90 p-6 shadow-xl shadow-black/25 backdrop-blur-md">
          <div className="mb-5 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22c55e]/15 text-[#5af0b0]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-white">Preferences</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
                Default currency
              </label>
              <Select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={fin}
              >
                {SUPPORTED_CURRENCIES.map((code) => (
                  <option key={code} value={code}>
                    {CURRENCY_LABELS[code]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
                Time zone
              </label>
              <Select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className={fin}
              >
                <option value="UTC-05:00 Eastern">UTC-05:00 Eastern</option>
                <option value="UTC">UTC</option>
                <option value="UTC+01:00 Central Europe">UTC+01:00 CET</option>
              </Select>
              <p className="mt-1 text-xs text-gray-600">
                Visual only — reporting remains UTC-based until wired.
              </p>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">
                  Two-factor authentication
                </p>
                <p className="text-xs text-gray-500">Secure your vault</p>
              </div>
              <Toggle on={twoFactor} onChange={setTwoFactor} />
            </div>
            <p className="text-xs text-gray-600">
              2FA toggle is UI-only in this build.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-[#1f2a33] bg-[#0c1016]/90 p-6 shadow-xl shadow-black/25 backdrop-blur-md lg:col-span-1">
          <div className="mb-5 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22c55e]/15 text-[#5af0b0]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-white">Notifications</h2>
          </div>
          <ul className="space-y-4">
            <li className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">Transaction alerts</p>
                <p className="text-xs text-gray-500">Instant nudges on large moves</p>
              </div>
              <Toggle on={alertTx} onChange={setAlertTx} />
            </li>
            <li className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">
                  Weekly financial report
                </p>
                <p className="text-xs text-gray-500">Sunday summary email</p>
              </div>
              <Toggle on={alertWeekly} onChange={setAlertWeekly} />
            </li>
            <li className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">Product insights</p>
                <p className="text-xs text-gray-500">Tips & feature updates</p>
              </div>
              <Toggle on={alertMarketing} onChange={setAlertMarketing} />
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-[#1f2a33] bg-[#0c1016]/90 p-6 shadow-xl shadow-black/25 backdrop-blur-md lg:col-span-1">
          <div className="mb-5 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22c55e]/15 text-[#5af0b0]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-white">Active sessions</h2>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between rounded-2xl border border-[#22c55e]/25 bg-[#22c55e]/8 px-4 py-3">
              <span className="font-medium text-white">This browser</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#86efac]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]" />
                Active now
              </span>
            </li>
            <li className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-gray-400">
              <span>Mobile session</span>
              <span className="text-xs">Last sync · recent</span>
            </li>
          </ul>
          <button
            type="button"
            className="mt-4 text-xs font-semibold text-[#5af0b0] hover:underline"
            onClick={() =>
              toast.message("Use Log out in the header to end this session.")
            }
          >
            Log out of all devices →
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-[#1f2a33] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">
          <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
          All changes are encrypted in transit
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            className="border-white/20! bg-[#1a222c]! py-3! text-white! sm:min-w-32"
            onClick={resetLocal}
          >
            Discard
          </Button>
          <Button
            type="submit"
            variant="neon"
            loading={saving}
            className="py-3! font-bold sm:min-w-40"
          >
            Save changes
          </Button>
        </div>
      </div>
      <p className="pt-2 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-gray-600">
        PocketLedger — settings v2
      </p>
    </form>
  );
}
