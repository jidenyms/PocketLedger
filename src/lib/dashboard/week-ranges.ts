/** Monday 00:00:00.000 UTC of the ISO week that contains `ref`. */
export function startOfUtcIsoWeek(ref: Date = new Date()): Date {
  const d = new Date(
    Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate()),
  );
  const day = d.getUTCDay(); // 0 Sun … 6 Sat
  const toMonday = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + toMonday);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/** Sunday (calendar date) of the week that starts on `mondayUtc`. Uses @db.Date semantics. */
export function endDateOfUtcIsoWeek(mondayUtc: Date): Date {
  const e = new Date(mondayUtc);
  e.setUTCDate(mondayUtc.getUTCDate() + 6);
  e.setUTCHours(0, 0, 0, 0);
  return e;
}

/**
 * @param weeksAgo 0 = current ISO week (Mon–Sun UTC), 1 = previous week, etc.
 */
export function utcIsoWeekRange(weeksAgo: number): {
  start: Date;
  end: Date;
  /** Short label e.g. "Apr 7–Apr 13, 2025" */
  label: string;
} {
  const thisMonday = startOfUtcIsoWeek();
  const start = new Date(thisMonday);
  start.setUTCDate(thisMonday.getUTCDate() - weeksAgo * 7);
  const end = endDateOfUtcIsoWeek(start);

  const fmt = (x: Date) =>
    x.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  const y = start.getUTCFullYear();
  const label =
    weeksAgo === 0
      ? `This week (UTC) · ${fmt(start)}–${fmt(end)}, ${y}`
      : weeksAgo === 1
        ? `Last week (UTC) · ${fmt(start)}–${fmt(end)}, ${y}`
        : `${fmt(start)}–${fmt(end)}, ${y}`;

  return { start, end, label };
}
