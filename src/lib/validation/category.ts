import { z } from "zod";
import { TransactionType } from "@prisma/client";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.nativeEnum(TransactionType),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
