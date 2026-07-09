type Totals = { income: string; expenses: string };

function num(s: string) {
  const n = Number.parseFloat(s);
  return Number.isNaN(n) ? 0 : n;
}

/** Percent change; null when previous period is zero (no meaningful baseline). */
export function incomeChangePercent(current: Totals, previous: Totals): number | null {
  const c = num(current.income);
  const p = num(previous.income);
  if (p === 0) return null;
  return ((c - p) / p) * 100;
}

export function spendingChangePercent(
  current: Totals,
  previous: Totals,
): number | null {
  const c = num(current.expenses);
  const p = num(previous.expenses);
  if (p === 0) return null;
  return ((c - p) / p) * 100;
}

/**
 * Human-readable week-over-week lines (current vs immediately prior ISO week, UTC).
 */
export function buildWeekOverWeekInsights(
  current: Totals,
  previous: Totals,
): string[] {
  const ci = num(current.income);
  const ce = num(current.expenses);
  const pi = num(previous.income);
  const pe = num(previous.expenses);

  const out: string[] = [];

  if (ce > 0 || pe > 0) {
    if (pe <= 0 && ce > 0) {
      out.push("You recorded spending this week after almost none last week.");
    } else if (pe > 0) {
      const ch = ((ce - pe) / pe) * 100;
      if (ch >= 1) {
        out.push(`Spending is up ${Math.round(ch)}% vs last week.`);
      } else if (ch <= -1) {
        out.push(
          `Spending is down ${Math.round(Math.abs(ch))}% vs last week.`,
        );
      }
    }
  }

  if (ci > 0 || pi > 0) {
    if (pi <= 0 && ci > 0) {
      out.push("Income landed this week — last week had none on the books.");
    } else if (pi > 0) {
      const ch = ((ci - pi) / pi) * 100;
      if (ch >= 1) {
        out.push(`Income is up ${Math.round(ch)}% vs last week.`);
      } else if (ch <= -1) {
        out.push(
          `Income is down ${Math.round(Math.abs(ch))}% vs last week.`,
        );
      }
    }
  }

  if (out.length === 0) {
    out.push(
      "Record activity this week and last week to unlock week-over-week trends.",
    );
  }

  return out.slice(0, 4);
}
