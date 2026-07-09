import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notFound } from "@/lib/errors/http-error";
import type { TenantContext } from "@/types/tenant";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
} from "@/lib/validation/transaction";
import { requireCategoryForUser } from "@/services/category.service";
import { logUserAction } from "@/lib/observability/user-action-log";
import { decimalToString } from "@/lib/serialization/money";

function toAmount(value: string | number): Prisma.Decimal {
  const s = typeof value === "number" ? String(value) : value;
  return new Prisma.Decimal(s);
}

function serializeTransaction(row: {
  id: string;
  userId: string;
  categoryId: string | null;
  type: string;
  amount: Prisma.Decimal;
  description: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    categoryId: row.categoryId,
    type: row.type,
    amount: decimalToString(row.amount)!,
    description: row.description,
    date: row.date.toISOString().slice(0, 10),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export type ListTransactionFilters = {
  from?: Date;
  to?: Date;
  type?: "INCOME" | "EXPENSE";
  categoryId?: string;
};

export type PaginatedMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 20;
const EXPORT_CAP = 10_000;

function buildWhere(
  ctx: TenantContext,
  filters: ListTransactionFilters,
): Prisma.TransactionWhereInput {
  return {
    userId: ctx.userId,
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.from || filters.to
      ? {
          date: {
            ...(filters.from ? { gte: filters.from } : {}),
            ...(filters.to ? { lte: filters.to } : {}),
          },
        }
      : {}),
  };
}

/** Paginated list — caps page size for stable API performance. */
export async function listTransactionsPaginated(
  ctx: TenantContext,
  filters: ListTransactionFilters & { page?: number; limit?: number } = {},
) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(
    Math.max(1, filters.limit ?? DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  );
  const skip = (page - 1) * limit;
  const where = buildWhere(ctx, filters);

  const [total, rows] = await prisma.$transaction([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    }),
  ]);

  const meta: PaginatedMeta = {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };

  return {
    items: rows.map(serializeTransaction),
    meta,
  };
}

/** CSV export — single query, hard cap on rows. */
export async function listTransactionsForExport(ctx: TenantContext) {
  const rows = await prisma.transaction.findMany({
    where: { userId: ctx.userId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: EXPORT_CAP,
  });
  return rows.map(serializeTransaction);
}

export async function getTransactionById(ctx: TenantContext, id: string) {
  const row = await prisma.transaction.findFirst({
    where: { id, userId: ctx.userId },
  });
  if (!row) throw notFound("Transaction not found");
  return serializeTransaction(row);
}

export async function createTransaction(
  ctx: TenantContext,
  input: CreateTransactionInput,
) {
  const categoryId: string | null = input.categoryId ?? null;
  if (categoryId) {
    await requireCategoryForUser(ctx, categoryId, input.type);
  }

  const row = await prisma.transaction.create({
    data: {
      userId: ctx.userId,
      type: input.type,
      amount: toAmount(input.amount as string | number),
      description: input.description?.trim() || null,
      date: input.date,
      categoryId,
    },
  });
  logUserAction(ctx, {
    action: "TRANSACTION_CREATED",
    meta: {
      transactionId: row.id,
      type: input.type,
      date: row.date.toISOString().slice(0, 10),
    },
  });
  return serializeTransaction(row);
}

export async function updateTransaction(
  ctx: TenantContext,
  id: string,
  input: UpdateTransactionInput,
) {
  const existing = await prisma.transaction.findFirst({
    where: { id, userId: ctx.userId },
  });
  if (!existing) throw notFound("Transaction not found");

  const nextType = input.type ?? existing.type;
  const categoryId =
    input.categoryId !== undefined ? input.categoryId : existing.categoryId;

  if (categoryId) {
    await requireCategoryForUser(ctx, categoryId, nextType);
  }

  const row = await prisma.transaction.update({
    where: { id },
    data: {
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.amount !== undefined
        ? { amount: toAmount(input.amount as string | number) }
        : {}),
      ...(input.description !== undefined
        ? { description: input.description?.trim() || null }
        : {}),
      ...(input.date !== undefined ? { date: input.date } : {}),
      ...(input.categoryId !== undefined ? { categoryId } : {}),
    },
  });

  return serializeTransaction(row);
}

export async function deleteTransaction(ctx: TenantContext, id: string) {
  const existing = await prisma.transaction.findFirst({
    where: { id, userId: ctx.userId },
  });
  if (!existing) throw notFound("Transaction not found");

  await prisma.transaction.delete({ where: { id } });
  logUserAction(ctx, {
    action: "TRANSACTION_DELETED",
    meta: {
      transactionId: id,
      type: existing.type,
      date: existing.date.toISOString().slice(0, 10),
    },
  });
  return { ok: true as const };
}
