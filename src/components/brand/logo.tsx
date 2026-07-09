import Link from "next/link";

type LogoProps = {
  href?: string;
  className?: string;
  size?: "sm" | "md";
};

/** Consistent wordmark — use in marketing and app chrome. */
export function Logo({ href = "/", className = "", size = "md" }: LogoProps) {
  const text =
    size === "sm"
      ? "text-base font-semibold tracking-tight"
      : "text-lg font-semibold tracking-tight";
  const inner = (
    <span
      className={`inline-flex items-baseline gap-0.5 ${text} text-zinc-900 dark:text-white ${className}`}
    >
      <span className="font-bold text-emerald-600 dark:text-emerald-400">Pocket</span>
      <span className="font-semibold">Ledger</span>
    </span>
  );
  if (!href) return inner;
  return (
    <Link href={href} className="outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 rounded-md">
      {inner}
    </Link>
  );
}
