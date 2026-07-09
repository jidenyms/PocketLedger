import { jwtVerify } from "jose";

/**
 * Edge middleware only — avoids importing `getServerEnv()` (which requires DB URL).
 */
export async function verifySessionTokenEdge(token: string): Promise<{
  sub: string;
  email: string;
}> {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("Invalid server configuration");
  }
  const key = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
  const sub = payload.sub;
  const email = payload.email;
  if (typeof sub !== "string" || typeof email !== "string") {
    throw new Error("Invalid token payload");
  }
  return { sub, email };
}
