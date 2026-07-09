import { cookies } from "next/headers";
import { unauthorized } from "@/lib/errors/http-error";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { verifySessionToken } from "@/lib/auth/jwt";
import type { TenantContext } from "@/types/tenant";

export type AuthContext = TenantContext & { email: string };

/**
 * Resolve the current user from the httpOnly session cookie.
 * All tenant-scoped APIs should call this (or equivalent) before services.
 */
export async function requireAuth(): Promise<AuthContext> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) throw unauthorized();

  try {
    const { sub, email } = await verifySessionToken(raw);
    return { userId: sub, email };
  } catch {
    throw unauthorized("Session expired or invalid");
  }
}
