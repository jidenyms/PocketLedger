export type ExpenseCat = { name: string; amount: string };

function num(s: string) {
  const n = Number.parseFloat(s);
  return Number.isNaN(n) ? 0 : n;
}

export function profitChangePercent(currentProfit: string, previousProfit: string): number | null {
  const c = num(currentProfit);
  const p = num(previousProfit);
  if (p === 0) return c === 0 ? null : null;
  return ((c - p) / Math.abs(p)) * 100;
}

/** Largest expense bucket as % of total categorized expenses this period. */
export function topExpenseShare(
  expenseByCategory: ExpenseCat[],
): { name: string; pct: number } | null {
  if (!expenseByCategory.length) return null;
  const total = expenseByCategory.reduce((s, c) => s + num(c.amount), 0);
  if (total <= 0) return null;
  const top = expenseByCategory[0];
  return {
    name: top.name,
    pct: Math.round((num(top.amount) / total) * 100),
  };
}

/**
 * One-line insight for the dashboard hero card.
 */
export function buildProfitInsightCopy(
  currentProfit: string,
  previousProfit: string,
  expenseByCategory: ExpenseCat[],
): string {
  const ch = profitChangePercent(currentProfit, previousProfit);
  const top = topExpenseShare(expenseByCategory);

  const profitBit =
    ch === null || Math.abs(ch) < 0.5
      ? "Profit is steady vs last month."
      : ch > 0
        ? `Your profit increased by ${Math.round(Math.abs(ch))}% vs last month.`
        : `Your profit decreased by ${Math.round(Math.abs(ch))}% vs last month.`;

  const expenseBit = top
    ? ` Your biggest expense category is ${top.name} (${top.pct}% of spending this month).`
    : " Add expenses with categories to see spending focus.";

  return profitBit + expenseBit;
}
