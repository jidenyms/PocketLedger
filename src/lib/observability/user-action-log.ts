import type { TenantContext } from "@/types/tenant";

export type UserActionType =
  | "TRANSACTION_CREATED"
  | "TRANSACTION_DELETED"
  | "EXPORT_TRIGGERED";

type LogPayload = {
  action: UserActionType;
  userId: string;
  meta?: Record<string, unknown>;
};

/**
 * Structured server-side logs for key user actions (ingest via your host or APM).
 */
export function logUserAction(ctx: TenantContext, payload: Omit<LogPayload, "userId">) {
  const entry = {
    ts: new Date().toISOString(),
    userId: ctx.userId,
    ...payload,
  };
  console.info("[PocketLedger:user-action]", JSON.stringify(entry));
}
