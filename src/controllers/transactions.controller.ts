import { NextResponse } from "next/server";
import { z } from "zod";
import { TransactionType } from "@prisma/client";
import { requireAuth } from "@/lib/auth/require-auth";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "@/lib/validation/transaction";
import * as transactionService from "@/services/transaction.service";

const optionalDateQuery = z.preprocess(
  (val) => (val === "" || val == null ? undefined : val),
  z.coerce.date().optional(),
);

const listQuerySchema = z.object({
  from: optionalDateQuery,
  to: optionalDateQuery,
  type: z.nativeEnum(TransactionType).optional(),
  categoryId: z.string().cuid().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export async function listTransactionsController(request: Request) {
  const ctx = await requireAuth();
  const url = new URL(request.url);
  const raw = Object.fromEntries(url.searchParams.entries());
  const q = listQuerySchema.parse(raw);
  const result = await transactionService.listTransactionsPaginated(ctx, {
    from: q.from,
    to: q.to,
    type: q.type,
    categoryId: q.categoryId,
    page: q.page,
    limit: q.limit,
  });
  return NextResponse.json(result);
}

export async function createTransactionController(request: Request) {
  const ctx = await requireAuth();
  const body = createTransactionSchema.parse(await request.json());
  const item = await transactionService.createTransaction(ctx, body);
  return NextResponse.json({ item }, { status: 201 });
}

export async function getTransactionController(
  _request: Request,
  id: string,
) {
  const ctx = await requireAuth();
  const item = await transactionService.getTransactionById(ctx, id);
  return NextResponse.json({ item });
}

export async function updateTransactionController(
  request: Request,
  id: string,
) {
  const ctx = await requireAuth();
  const body = updateTransactionSchema.parse(await request.json());
  const item = await transactionService.updateTransaction(ctx, id, body);
  return NextResponse.json({ item });
}

export async function deleteTransactionController(
  _request: Request,
  id: string,
) {
  const ctx = await requireAuth();
  await transactionService.deleteTransaction(ctx, id);
  return new NextResponse(null, { status: 204 });
}
