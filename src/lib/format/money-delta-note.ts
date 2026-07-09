/** e.g. "↑ $1,234 from last month" for dashboard KPI footnotes */
export function moneyDeltaNote(
  current: string,
  previous: string,
  formatMoney: (amount: string | number) => string,
): string | null {
  const c = Number.parseFloat(current);
  const p = Number.parseFloat(previous);
  if (!Number.isFinite(c) || !Number.isFinite(p)) return null;
  const d = c - p;
  if (Math.abs(d) < 0.005) return "Flat vs last month";
  const up = d > 0;
  return `${up ? "↑" : "↓"} ${formatMoney(Math.abs(d))} from last month`;
}
