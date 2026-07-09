/** UTC calendar helpers for dashboard reporting and insights. */

export function utcMonthBounds(year: number, month1to12: number) {
  const start = new Date(Date.UTC(year, month1to12 - 1, 1));
  const end = new Date(Date.UTC(year, month1to12, 0));
  return { start, end };
}

export function utcCurrentMonthRange() {
  const n = new Date();
  const y = n.getUTCFullYear();
  const m = n.getUTCMonth() + 1;
  const { start, end } = utcMonthBounds(y, m);
  const label = start.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return { start, end, label: `${label} (UTC)` };
}

export function utcPreviousMonthRange() {
  const n = new Date();
  let y = n.getUTCFullYear();
  let m = n.getUTCMonth(); // 0-based
  if (m === 0) {
    y -= 1;
    m = 12;
  }
  const { start, end } = utcMonthBounds(y, m);
  return { start, end };
}
