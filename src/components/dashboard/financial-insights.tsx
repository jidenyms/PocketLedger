"use client";

export function FinancialInsights({ messages }: { messages: string[] }) {
  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-4 text-sm text-gray-400 backdrop-blur-sm transition-all duration-500 ease-out hover:border-white/20 hover:shadow-lg sm:px-5">
        <p className="font-medium text-white">Your month-over-month story appears here</p>
        <p className="mt-2 leading-relaxed">
          Log income and expenses in{" "}
          <span className="font-medium text-gray-300">this month and last month</span>{" "}
          to see trends — like whether spend is creeping up or if sales weeks
          are stronger — without building a spreadsheet model.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#22c55e]/25 bg-gradient-to-br from-[#22c55e]/10 to-transparent px-4 py-4 shadow-lg shadow-[#22c55e]/5 backdrop-blur-sm ring-1 ring-white/5 transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#22c55e]/10 sm:px-5 sm:py-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#22c55e]">
        Insights · vs last month
      </p>
      <ul className="mt-3 space-y-2.5">
        {messages.map((msg, i) => (
          <li
            key={i}
            className="flex gap-2.5 text-sm leading-relaxed text-gray-200"
          >
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#22c55e]"
              aria-hidden
            />
            {msg}
          </li>
        ))}
      </ul>
    </div>
  );
}
