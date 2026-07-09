"use client";

import type { ReactNode } from "react";

export type MetricVariant = "income" | "expense" | "profit";

type MetricCardProps = {
  title: string;
  amount: string;
  /** vs prior period; null hides the badge */
  changePercent: number | null;
  variant: MetricVariant;
  subtitle?: string;
  /** Second line under the pill, e.g. delta vs last month in dollars */
  footnote?: string;
  /** Small icon tile (top-right), matching dashboard mockups */
  icon?: ReactNode;
  /** Hero treatment: larger type, stronger border, extra lift on hover */
  featured?: boolean;
  className?: string;
};

export function MetricCard({
  title,
  amount,
  changePercent,
  variant,
  subtitle,
  footnote,
  icon,
  featured = false,
  className = "",
}: MetricCardProps) {
  const positiveIsGood = variant !== "expense";
  const hasChange = changePercent !== null && Number.isFinite(changePercent);
  const isUp = hasChange && (changePercent as number) > 0;
  const isFlat =
    hasChange && Math.abs(changePercent as number) < 0.5;
  const looksGood = positiveIsGood ? isUp && !isFlat : !isUp && !isFlat;

  const badgeClass = !hasChange || isFlat
    ? "bg-white/10 text-gray-400"
    : looksGood
      ? "bg-[#22c55e]/20 text-[#22c55e] ring-1 ring-[#22c55e]/30"
      : "bg-rose-500/15 text-rose-400 ring-1 ring-rose-400/25";

  const badgeLabel =
    !hasChange || isFlat
      ? "—"
      : `${(changePercent as number) >= 0 ? "+" : "−"}${Math.round(Math.abs(changePercent as number))}%`;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-5 shadow-lg shadow-black/25 backdrop-blur-sm transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#22c55e]/15 sm:p-6 ${featured ? "border-[#22c55e]/45 py-6 shadow-xl shadow-[#22c55e]/25 ring-1 ring-[#22c55e]/30 hover:border-[#22c55e]/60 hover:shadow-[#22c55e]/35 sm:py-8" : ""} ${className}`}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#22c55e]/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <p
          className={`font-semibold uppercase tracking-wider text-gray-500 ${featured ? "text-xs tracking-[0.15em]" : "text-[11px] tracking-widest"}`}
        >
          {title}
        </p>
        {icon ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0f141c] text-[#5af0b0] shadow-inner ring-1 ring-[#22c55e]/15">
            {icon}
          </span>
        ) : null}
      </div>
      <p
        className={`mt-3 font-mono font-bold tabular-nums tracking-tight text-white transition-all duration-300 group-hover:text-white ${featured ? "text-3xl sm:text-4xl lg:text-5xl" : "text-2xl sm:text-3xl lg:text-4xl"}`}
      >
        {amount}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold tabular-nums transition-colors duration-300 ${badgeClass}`}
        >
          {badgeLabel}
        </span>
        {subtitle ? (
          <span className="text-xs text-gray-500">{subtitle}</span>
        ) : null}
      </div>
      {footnote ? (
        <p className="mt-3 text-xs font-medium text-gray-400">{footnote}</p>
      ) : null}
    </div>
  );
}
