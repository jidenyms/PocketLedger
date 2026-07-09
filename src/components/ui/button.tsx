import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "neon";
  /** Shows spinner and disables the button. */
  loading?: boolean;
};

export const buttonBaseClass =
  "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 will-change-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-900/20 focus-visible:outline-emerald-600",
  secondary:
    "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
  ghost:
    "text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200/80 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:active:bg-zinc-800/80",
  neon:
    "bg-[#22c55e] font-semibold text-[#0B0F14] shadow-lg shadow-[#22c55e]/30 transition-all duration-300 hover:bg-[#4ade80] hover:shadow-[#22c55e]/45 focus-visible:outline-[#22c55e] active:shadow-[#22c55e]/25",
};

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function Button({
  className = "",
  variant = "primary",
  type = "button",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`${buttonBaseClass} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Spinner
          className={`mr-2 shrink-0 ${
            variant === "primary" || variant === "neon"
              ? "h-4 w-4 text-[#0B0F14]"
              : "h-4 w-4 text-current"
          }`}
        />
      ) : null}
      {children}
    </button>
  );
}

export function buttonVariantClass(
  variant: NonNullable<ButtonProps["variant"]> = "primary",
) {
  return `${buttonBaseClass} ${variants[variant]}`;
}
