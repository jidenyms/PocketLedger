import { prisma } from "@/lib/prisma";
import { badRequest, conflict, notFound } from "@/lib/errors/http-error";
import type { TenantContext } from "@/types/tenant";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validation/category";
import type { TransactionType } from "@prisma/client";

function serializeCategory<T extends { id: string; name: string; type: TransactionType; createdAt: Date }>(
  c: T,
) {
  return {
    id: c.id,
    name: c.name,
    type: c.type,
    createdAt: c.createdAt.toISOString(),
  };
}

/** List categories for this tenant only. */
export async function listCategories(
  ctx: TenantContext,
  filters?: { type?: TransactionType },
) {
  const rows = await prisma.category.findMany({
    where: {
      userId: ctx.userId,
      ...(filters?.type ? { type: filters.type } : {}),
    },
    orderBy: { name: "asc" },
  });
  return rows.map(serializeCategory);
}

export async function createCategory(ctx: TenantContext, input: CreateCategoryInput) {
  try {
    const row = await prisma.category.create({
      data: {
        userId: ctx.userId,
        name: input.name.trim(),
        type: input.type,
      },
    });
    return serializeCategory(row);
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      throw conflict("A category with this name already exists for this type");
    }
    throw e;
  }
}

export async function updateCategory(
  ctx: TenantContext,
  categoryId: string,
  input: UpdateCategoryInput,
) {
  const existing = await prisma.category.findFirst({
    where: { id: categoryId, userId: ctx.userId },
  });
  if (!existing) throw notFound("Category not found");

  try {
    const row = await prisma.category.update({
      where: { id: categoryId },
      data: { name: input.name.trim() },
    });
    return serializeCategory(row);
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      throw conflict("A category with this name already exists for this type");
    }
    throw e;
  }
}

export async function deleteCategory(ctx: TenantContext, categoryId: string) {
  const existing = await prisma.category.findFirst({
    where: { id: categoryId, userId: ctx.userId },
    include: {
      _count: { select: { transactions: true } },
    },
  });
  if (!existing) throw notFound("Category not found");

  await prisma.category.delete({
    where: { id: categoryId },
  });

  return { ok: true as const, unlinkedTransactions: existing._count.transactions };
}

/** Resolve category owned by tenant, or throw. Used by transaction service. */
export async function requireCategoryForUser(
  ctx: TenantContext,
  categoryId: string,
  expectedType: TransactionType,
) {
  const cat = await prisma.category.findFirst({
    where: { id: categoryId, userId: ctx.userId, type: expectedType },
  });
  if (!cat) throw badRequest("Category not found or type does not match transaction");
  return cat;
}
