import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buttonVariantClass } from "@/components/ui/button";

const heroBullets = [
  "Secure sessions — your data stays private",
  "No bank connection required to start",
  "Simple by default — complexity only when you need it",
];

const highlights = [
  {
    title: "Real-time liquidity",
    body: "Track incoming and outgoing cash in one quiet dashboard built for daily decisions.",
  },
  {
    title: "AI expense insights",
    body: "Detect where your money drifts, then act before small leaks become monthly issues.",
  },
  {
    title: "Automated tax-aware views",
    body: "Keep categories and summaries ready for accountants without spreadsheet cleanup.",
  },
];

const miniStats = [
  { label: "Avg monthly inflow", value: "$14.5K" },
  { label: "Expense variance", value: "-12%" },
  { label: "Net position", value: "$8.4K" },
];

export function LandingPage() {
  return (
    <div
      data-pl-landing="v2"
      className="min-h-screen bg-black text-white antialiased"
    >
      <div className="bg-[radial-gradient(80%_50%_at_50%_0%,rgba(34,197,94,0.18),transparent_55%)]">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
            <Logo href="/" />
            <nav className="flex items-center gap-3">
              <Link
                href="/login"
                className={`${buttonVariantClass("ghost")} px-3 py-2 text-sm text-gray-300 hover:text-white`}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={`${buttonVariantClass("neon")} py-2 text-sm`}
              >
                Sign up free
              </Link>
            </nav>
          </div>
        </header>

        <main className="pb-16">
          <section className="mx-auto max-w-5xl px-4 pb-14 pt-12 sm:px-6 sm:pt-16">
            <p className="pl-text-eyebrow text-[#22c55e]">
              Profit clarity for small business
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl sm:leading-[1.08]">
              Know what you keep — not just what moves through your account.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-gray-400 sm:text-lg">
              PocketLedger turns income and expenses into a clear profit picture,
              so you can decide with confidence — without a spreadsheet after
              hours.
            </p>
            <ul className="mt-8 flex flex-col gap-3 text-sm text-gray-400 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-2">
              {heroBullets.map((line) => (
                <li key={line} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#22c55e] shadow-[0_0_10px_rgba(34,197,94,0.75)]" />
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className={`${buttonVariantClass("neon")} w-full justify-center px-8 py-3.5 text-center sm:w-auto`}
              >
                Get clarity — free to start
              </Link>
              <Link
                href="/login"
                className={`${buttonVariantClass("secondary")} w-full justify-center border-white/15! bg-transparent! py-3.5 text-center text-gray-100! ring-1 ring-white/20 hover:bg-white/5! sm:w-auto`}
              >
                I already have an account
              </Link>
            </div>
          </section>

          <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
            <p className="text-center text-xl font-bold tracking-tight text-white sm:text-2xl">
              Built for owners who need answers, not another product to tame.
            </p>
          </section>

          <section className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-[#1f2a33] bg-linear-to-b from-[#0f151d] to-[#080c12] p-6 shadow-xl shadow-black/30">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                  Live dashboard
                </p>
                <p className="mt-3 font-mono text-4xl font-bold tracking-tight text-white">
                  $142,500<span className="text-xl text-gray-500">.24</span>
                </p>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {miniStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-white/10 bg-[#0b1016] p-3"
                    >
                      <p className="text-[10px] uppercase tracking-wide text-gray-500">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-sm font-bold text-[#5af0b0]">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 h-28 overflow-hidden rounded-xl border border-white/10 bg-[#0a0f14] p-3">
                  <div className="flex h-full items-end gap-2">
                    {[20, 32, 24, 40, 28, 48, 36, 52].map((h, i) => (
                      <div
                        key={h + i}
                        className={`w-full rounded-sm ${i % 2 === 0 ? "bg-[#22c55e]/85" : "bg-[#22c55e]/35"}`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-[#1f2a33] bg-[#0a0f14] p-5 shadow-xl shadow-black/25">
                <div className="mx-auto max-w-[260px] rounded-4xl border border-white/10 bg-[#05090d] p-4 shadow-[0_0_50px_rgba(34,197,94,0.12)]">
                  <div className="rounded-2xl border border-[#22c55e]/30 bg-[#101820] p-4">
                    <p className="text-xs text-gray-400">Balance</p>
                    <p className="mt-1 text-2xl font-bold text-[#5af0b0]">
                      $8,400
                    </p>
                    <div className="mt-4 flex h-14 items-end gap-1.5">
                      {[30, 24, 38, 20, 44, 34].map((h, i) => (
                        <span
                          key={h + i}
                          className="block w-4 rounded-sm bg-[#22c55e]/80"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <div className="mt-4 w-full rounded-lg bg-[#22c55e] py-2 text-center text-xs font-bold text-[#0a0f14]">
                      Analyze
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Your entire financial footprint in one place.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
              PocketLedger combines transaction tracking, business insights, and
              reporting in a layout optimized for speed and focus.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-[#1f2a33] bg-[#0b1016]/90 p-5 shadow-lg shadow-black/25"
                >
                  <div className="h-8 w-8 rounded-lg bg-[#22c55e]/20" />
                  <h3 className="mt-4 text-base font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
            <div className="rounded-3xl border border-[#22c55e]/30 bg-linear-to-br from-[#22c55e]/10 via-[#0b1016] to-[#0b1016] p-7 text-center shadow-[0_0_40px_rgba(34,197,94,0.12)] sm:p-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#86efac]">
                Ready to scale your ledger?
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-4xl">
                Start tracking today.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-gray-300 sm:text-base">
                Set up your account in minutes and get an instant snapshot of your
                cash flow.
              </p>
              <Link
                href="/signup"
                className={`${buttonVariantClass("neon")} mt-7 inline-flex px-8 py-3`}
              >
                Sign up free
              </Link>
              <p className="mt-4 text-xs text-gray-500">
                No credit card required to explore.
              </p>
            </div>
          </section>

          <footer className="mx-auto mt-8 max-w-5xl border-t border-white/10 px-4 py-8 text-sm text-gray-500 sm:px-6">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <Logo href="/" />
              <div className="flex items-center gap-5">
                <Link href="/login" className="hover:text-gray-300">
                  Log in
                </Link>
                <Link href="/signup" className="hover:text-gray-300">
                  Sign up
                </Link>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
