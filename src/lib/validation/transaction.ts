import { z } from "zod";
import { TransactionType } from "@prisma/client";

const amountSchema = z.union([
  z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),
  z.number().nonnegative(),
]);

export const createTransactionSchema = z.object({
  type: z.nativeEnum(TransactionType),
  amount: amountSchema,
  description: z.string().trim().max(500).optional(),
  date: z.coerce.date(),
  categoryId: z.string().cuid().optional().nullable(),
});

export const updateTransactionSchema = z.object({
  type: z.nativeEnum(TransactionType).optional(),
  amount: amountSchema.optional(),
  description: z.string().trim().max(500).optional().nullable(),
  date: z.coerce.date().optional(),
  categoryId: z.string().cuid().optional().nullable(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
