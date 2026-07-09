import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { conflict, unauthorized } from "@/lib/errors/http-error";
import type { PublicUser } from "@/types";
import type { LoginInput, SignupInput } from "@/lib/validation/auth";
import { seedDemoDataForUser } from "@/services/seed-demo.service";

const SALT_ROUNDS = 12;

function toPublicUser(user: {
  id: string;
  email: string;
  name: string | null;
  preferredCurrency: string;
  createdAt: Date;
}): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    preferredCurrency: user.preferredCurrency,
    createdAt: user.createdAt,
  };
}

export async function registerUser(input: SignupInput): Promise<PublicUser> {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw conflict("Email already registered");

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: input.name?.trim() || null,
    },
  });
  try {
    await seedDemoDataForUser(user.id);
  } catch (e) {
    console.error("[signup] demo seed failed", e);
  }
  return toPublicUser(user);
}

export async function authenticateUser(input: LoginInput): Promise<PublicUser> {
  const email = input.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw unauthorized("Invalid email or password");

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) throw unauthorized("Invalid email or password");

  return toPublicUser(user);
}

export async function findUserById(userId: string): Promise<PublicUser | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  return toPublicUser(user);
}
