import { SignJWT, jwtVerify } from "jose";
import { getServerEnv } from "@/lib/env";

function secretKey() {
  const { JWT_SECRET } = getServerEnv();
  return new TextEncoder().encode(JWT_SECRET);
}

export type SessionPayload = {
  sub: string;
  email: string;
};

/**
 * Issue a signed JWT for the session cookie. Uses `jose` so the same verification
 * runs in Node route handlers and Edge middleware.
 */
export async function signSessionToken(userId: string, email: string) {
  const env = getServerEnv();
  const exp = Math.floor(Date.now() / 1000) + env.SESSION_MAX_AGE_SECONDS;

  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(secretKey());
}

/** Returns payload or throws — callers map to 401. */
export async function verifySessionToken(token: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, secretKey(), {
    algorithms: ["HS256"],
  });
  const sub = payload.sub;
  const email = payload.email;
  if (typeof sub !== "string" || typeof email !== "string") {
    throw new Error("Invalid token payload");
  }
  return { sub, email };
}
