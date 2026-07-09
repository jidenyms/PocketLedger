import type { TransactionType, User, Category, Transaction } from "@prisma/client";

export type { TransactionType, User, Category, Transaction };
export type { TenantContext } from "@/types/tenant";

/** Safe user shape for client / JWT payload (no password hash). */
export type PublicUser = Pick<
  User,
  "id" | "email" | "name" | "createdAt" | "preferredCurrency"
>;
