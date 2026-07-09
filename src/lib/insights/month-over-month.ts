type Totals = { income: string; expenses: string; profit: string };

function num(s: string) {
  const n = Number.parseFloat(s);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Human-readable month-over-month copy for the dashboard strip.
 */
export function buildMonthOverMonthInsights(
  current: Totals,
  previous: Totals,
): string[] {
  const ci = num(current.income);
  const ce = num(current.expenses);
  const cp = num(current.profit);
  const pi = num(previous.income);
  const pe = num(previous.expenses);
  const pp = num(previous.profit);

  const out: string[] = [];

  if (ce > 0 || pe > 0) {
    if (pe <= 0 && ce > 0) {
      out.push("You're recording expenses for the first time this month.");
    } else if (pe > 0) {
      const ch = ((ce - pe) / pe) * 100;
      if (ch >= 1) {
        out.push(`You spent ${Math.round(ch)}% more this month than last month.`);
      } else if (ch <= -1) {
        out.push(
          `You spent ${Math.round(Math.abs(ch))}% less this month than last month.`,
        );
      }
    }
  }

  if (ci > 0 || pi > 0) {
    if (pi <= 0 && ci > 0) {
      out.push("Income started flowing this month — nice work.");
    } else if (pi > 0) {
      const ch = ((ci - pi) / pi) * 100;
      if (ch >= 1) {
        out.push(`Income is up ${Math.round(ch)}% vs last month.`);
      } else if (ch <= -1) {
        out.push(`Income is down ${Math.round(Math.abs(ch))}% vs last month.`);
      }
    }
  }

  const hadProfitBefore = Math.abs(pp) > 0.0001;
  if (!hadProfitBefore && Math.abs(cp) > 0.0001) {
    out.push(
      cp >= 0
        ? "Your profit is positive this month."
        : "You're tracking a loss this month — adjust spend to recover.",
    );
  } else if (hadProfitBefore) {
    const ch = ((cp - pp) / Math.abs(pp)) * 100;
    if (ch >= 1) {
      out.push(`Your profit increased by ${Math.round(ch)}% vs last month.`);
    } else if (ch <= -1) {
      out.push(
        `Your profit decreased by ${Math.round(Math.abs(ch))}% vs last month.`,
      );
    }
  }

  return out.slice(0, 4);
}
