import { Prisma } from "@prisma/client";
// Relative path so `npx prisma db seed` (tsx) resolves without Next.js path aliases.
import { prisma } from "../lib/prisma";

function utcDate(daysAgo: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

/**
 * Idempotent demo data — Salary (income) + Food, Transport, Utilities, Misc (expenses).
 * Skips if the user already has any categories.
 */
export async function seedDemoDataForUser(userId: string) {
  const existing = await prisma.category.count({ where: { userId } });
  if (existing > 0) return;

  const salary = await prisma.category.create({
    data: { userId, name: "Salary", type: "INCOME" },
  });
  const food = await prisma.category.create({
    data: { userId, name: "Food", type: "EXPENSE" },
  });
  const transport = await prisma.category.create({
    data: { userId, name: "Transport", type: "EXPENSE" },
  });
  const utilities = await prisma.category.create({
    data: { userId, name: "Utilities", type: "EXPENSE" },
  });
  const misc = await prisma.category.create({
    data: { userId, name: "Misc", type: "EXPENSE" },
  });

  const txs: Prisma.TransactionCreateManyInput[] = [
    {
      userId,
      type: "INCOME",
      amount: new Prisma.Decimal("5200.00"),
      description: "Payroll — biweekly deposit",
      date: utcDate(4),
      categoryId: salary.id,
    },
    {
      userId,
      type: "INCOME",
      amount: new Prisma.Decimal("5200.00"),
      description: "Payroll — biweekly deposit",
      date: utcDate(18),
      categoryId: salary.id,
    },
    {
      userId,
      type: "INCOME",
      amount: new Prisma.Decimal("850.00"),
      description: "Freelance invoice #1042",
      date: utcDate(11),
      categoryId: salary.id,
    },
    {
      userId,
      type: "EXPENSE",
      amount: new Prisma.Decimal("124.50"),
      description: "Groceries",
      date: utcDate(1),
      categoryId: food.id,
    },
    {
      userId,
      type: "EXPENSE",
      amount: new Prisma.Decimal("342.80"),
      description: "Team lunch & supplies",
      date: utcDate(3),
      categoryId: food.id,
    },
    {
      userId,
      type: "EXPENSE",
      amount: new Prisma.Decimal("88.20"),
      description: "Coffee & snacks",
      date: utcDate(6),
      categoryId: food.id,
    },
    {
      userId,
      type: "EXPENSE",
      amount: new Prisma.Decimal("48.00"),
      description: "Transit pass top-up",
      date: utcDate(2),
      categoryId: transport.id,
    },
    {
      userId,
      type: "EXPENSE",
      amount: new Prisma.Decimal("127.40"),
      description: "Fuel",
      date: utcDate(9),
      categoryId: transport.id,
    },
    {
      userId,
      type: "EXPENSE",
      amount: new Prisma.Decimal("215.00"),
      description: "Electric + internet",
      date: utcDate(5),
      categoryId: utilities.id,
    },
    {
      userId,
      type: "EXPENSE",
      amount: new Prisma.Decimal("74.99"),
      description: "Parking ticket",
      date: utcDate(12),
      categoryId: misc.id,
    },
    {
      userId,
      type: "EXPENSE",
      amount: new Prisma.Decimal("199.00"),
      description: "Software license",
      date: utcDate(7),
      categoryId: misc.id,
    },
  ];

  await prisma.transaction.createMany({ data: txs });
}
