import { z } from "zod";

/**
 * Validated server-side environment variables.
 * Lazy getters avoid failing `next build` when `.env` is absent until a server
 * route that needs secrets is executed.
 */
const serverSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET should be at least 32 characters"),
  /** JWT `exp` and session cookie `maxAge` — single source of truth (seconds). */
  SESSION_MAX_AGE_SECONDS: z.coerce.number().positive().default(60 * 60 * 24 * 7),
});

const publicSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | null = null;

/** Call from API routes and server-only modules when secrets are required. */
export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    SESSION_MAX_AGE_SECONDS: process.env.SESSION_MAX_AGE_SECONDS,
  });
  if (!parsed.success) {
    console.error("Invalid server environment:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid server environment variables");
  }
  cached = parsed.data;
  return cached;
}

export function getPublicEnv() {
  return publicSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
}
