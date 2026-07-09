import { getServerEnv } from "@/lib/env";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

export type SessionCookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
};

/** Production-safe defaults: httpOnly, SameSite=Lax, Secure when deployed with HTTPS. */
export function getSessionCookieOptions(): SessionCookieOptions {
  const env = getServerEnv();
  const isProd = env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: env.SESSION_MAX_AGE_SECONDS,
  };
}

export function getClearSessionCookieOptions(): SessionCookieOptions {
  const env = getServerEnv();
  const isProd = env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  };
}

export { SESSION_COOKIE_NAME };
