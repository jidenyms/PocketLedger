/** Inclusive UTC calendar bounds for a rolling ~12‑month window. */
export function rollingTwelveMonthUtcRange() {
  const to = new Date();
  const y = to.getUTCFullYear();
  const m = to.getUTCMonth();
  const from = new Date(Date.UTC(y - 1, m, 1));
  const end = new Date(Date.UTC(y, m + 1, 0));
  return {
    from,
    to: end,
    subtitle: "Rolling 12 months (UTC)" as const,
  };
}
