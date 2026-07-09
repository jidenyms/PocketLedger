import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { utcIsoWeekRange } from "@/lib/dashboard/week-ranges";
import type { TenantContext } from "@/types/tenant";
import { decimalToString } from "@/lib/serialization/money";

export type FinancialReportOptions = {
  from?: Date;
  to?: Date;
};

export type MonthlyBreakdownRow = {
  year: number;
  month: number;
  key: string;
  label: string;
  income: string;
  expenses: string;
  profit: string;
};

/** Inclusive UTC date range for a calendar month (month is 1–12). */
export function monthRangeUtc(year: number, month1to12: number) {
  const m = month1to12 - 1;
  const start = new Date(Date.UTC(year, m, 1));
  const end = new Date(Date.UTC(year, m + 1, 0));
  return { start, end };
}

const zero = new Prisma.Decimal(0);

/**
 * Aggregates income / expense / profit for one month. Scoped by `userId` only.
 */
export async function monthlySummary(
  ctx: TenantContext,
  year: number,
  month: number,
) {
  const { start, end } = monthRangeUtc(year, month);

  const [rows, transactionCount] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["type"],
      where: {
        userId: ctx.userId,
        date: { gte: start, lte: end },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.count({
      where: {
        userId: ctx.userId,
        date: { gte: start, lte: end },
      },
    }),
  ]);

  const incomeRow = rows.find((r) => r.type === "INCOME");
  const expenseRow = rows.find((r) => r.type === "EXPENSE");
  const income = incomeRow?._sum.amount ?? zero;
  const expense = expenseRow?._sum.amount ?? zero;
  const profit = income.minus(expense);

  return {
    year,
    month,
    range: {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    },
    income: decimalToString(income)!,
    expenses: decimalToString(expense)!,
    profit: decimalToString(profit)!,
    transactionCount,
  };
}

function buildTransactionWhere(
  ctx: TenantContext,
  opts?: FinancialReportOptions,
): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = { userId: ctx.userId };
  if (opts?.from || opts?.to) {
    where.date = {};
    if (opts.from) where.date.gte = opts.from;
    if (opts.to) where.date.lte = opts.to;
  }
  return where;
}

/**
 * Totals (income, expenses, profit) plus per-calendar-month buckets (UTC).
 * All figures scoped to `ctx.userId`.
 */
export async function financialReport(
  ctx: TenantContext,
  opts?: FinancialReportOptions,
) {
  const where = buildTransactionWhere(ctx, opts);

  const expenseWhere: Prisma.TransactionWhereInput = {
    ...where,
    type: "EXPENSE",
  };

  const [typeAgg, txsForMonths, transactionCount, expenseCatAgg] =
    await Promise.all([
      prisma.transaction.groupBy({
        by: ["type"],
        where,
        _sum: { amount: true },
      }),
      prisma.transaction.findMany({
        where,
        select: { date: true, type: true, amount: true },
        orderBy: { date: "asc" },
      }),
      prisma.transaction.count({ where }),
      prisma.transaction.groupBy({
        by: ["categoryId"],
        where: expenseWhere,
        _sum: { amount: true },
      }),
    ]);

  const income = typeAgg.find((r) => r.type === "INCOME")?._sum.amount ?? zero;
  const expense = typeAgg.find((r) => r.type === "EXPENSE")?._sum.amount ?? zero;
  const profit = income.minus(expense);

  const monthMap = new Map<
    string,
    { income: Prisma.Decimal; expenses: Prisma.Decimal }
  >();

  for (const t of txsForMonths) {
    const d = t.date;
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const key = `${y}-${String(m).padStart(2, "0")}`;
    let bucket = monthMap.get(key);
    if (!bucket) {
      bucket = {
        income: new Prisma.Decimal(0),
        expenses: new Prisma.Decimal(0),
      };
      monthMap.set(key, bucket);
    }
    if (t.type === "INCOME") {
      bucket.income = bucket.income.plus(t.amount);
    } else {
      bucket.expenses = bucket.expenses.plus(t.amount);
    }
  }

  const byMonth: MonthlyBreakdownRow[] = Array.from(monthMap.entries())
    .map(([key, v]) => {
      const [ys, ms] = key.split("-");
      const year = Number(ys);
      const month = Number(ms);
      const label = new Date(Date.UTC(year, month - 1, 1)).toLocaleString(
        "en-US",
        { month: "short", year: "numeric" },
      );
      const prof = v.income.minus(v.expenses);
      return {
        year,
        month,
        key,
        label,
        income: decimalToString(v.income)!,
        expenses: decimalToString(v.expenses)!,
        profit: decimalToString(prof)!,
      };
    })
    .sort((a, b) => a.key.localeCompare(b.key));

  const catIds = expenseCatAgg
    .map((r) => r.categoryId)
    .filter((id): id is string => id != null);
  const catMeta =
    catIds.length > 0
      ? await prisma.category.findMany({
          where: { userId: ctx.userId, id: { in: catIds } },
          select: { id: true, name: true },
        })
      : [];
  const nameById = new Map(catMeta.map((c) => [c.id, c.name] as const));
  const expenseByCategory = expenseCatAgg
    .map((row) => {
      const amt = row._sum.amount ?? zero;
      const cid = row.categoryId ?? null;
      return {
        id: cid,
        name: cid ? (nameById.get(cid) ?? "Category") : "Uncategorized",
        amount: decimalToString(amt)!,
      };
    })
    .filter((x) => Number.parseFloat(x.amount) > 0)
    .sort(
      (a, b) => Number.parseFloat(b.amount) - Number.parseFloat(a.amount),
    );

  return {
    totals: {
      income: decimalToString(income)!,
      expenses: decimalToString(expense)!,
      profit: decimalToString(profit)!,
    },
    byMonth,
    transactionCount,
    expenseByCategory,
  };
}

export type FinancialReportPayload = Awaited<ReturnType<typeof financialReport>>;

/**
 * Totals for a single calendar day (UTC), scoped to the tenant.
 */
export async function dailyFinancialSummary(
  ctx: TenantContext,
  day: Date = new Date(),
) {
  const d = new Date(
    Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()),
  );

  const [incomeSum, expenseSum, transactionCount] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId: ctx.userId, date: d, type: "INCOME" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId: ctx.userId, date: d, type: "EXPENSE" },
      _sum: { amount: true },
    }),
    prisma.transaction.count({
      where: { userId: ctx.userId, date: d },
    }),
  ]);

  const earned = incomeSum._sum.amount ?? zero;
  const spent = expenseSum._sum.amount ?? zero;

  return {
    date: d.toISOString().slice(0, 10),
    earned: decimalToString(earned)!,
    spent: decimalToString(spent)!,
    transactionCount,
  };
}

/** Current vs previous ISO week (Mon–Sun, UTC), for dashboard comparison. */
export async function weeklyComparisonReport(ctx: TenantContext) {
  const cur = utcIsoWeekRange(0);
  const prev = utcIsoWeekRange(1);

  const [thisWeek, lastWeek] = await Promise.all([
    financialReport(ctx, { from: cur.start, to: cur.end }),
    financialReport(ctx, { from: prev.start, to: prev.end }),
  ]);

  return {
    currentWeek: {
      label: cur.label,
      start: cur.start.toISOString().slice(0, 10),
      end: cur.end.toISOString().slice(0, 10),
      totals: thisWeek.totals,
      transactionCount: thisWeek.transactionCount,
    },
    previousWeek: {
      label: prev.label,
      start: prev.start.toISOString().slice(0, 10),
      end: prev.end.toISOString().slice(0, 10),
      totals: lastWeek.totals,
      transactionCount: lastWeek.transactionCount,
    },
  };
}
