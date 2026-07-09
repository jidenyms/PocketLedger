import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notFound } from "@/lib/errors/http-error";
import type { TenantContext } from "@/types/tenant";
import type { UpdateSettingsInput } from "@/lib/validation/settings";
import type { PublicUser } from "@/types";

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

export async function getUserSettings(ctx: TenantContext): Promise<PublicUser> {
  const user = await prisma.user.findFirst({
    where: { id: ctx.userId },
    select: {
      id: true,
      email: true,
      name: true,
      preferredCurrency: true,
      createdAt: true,
    },
  });
  if (!user) throw notFound("User not found");
  return toPublicUser(user);
}

export async function updateUserSettings(
  ctx: TenantContext,
  input: UpdateSettingsInput,
): Promise<PublicUser> {
  const data: Prisma.UserUpdateInput = {};
  if (input.name !== undefined) {
    data.name = input.name.trim() || null;
  }
  if (input.preferredCurrency !== undefined) {
    data.preferredCurrency = input.preferredCurrency;
  }

  const user = await prisma.user.update({
    where: { id: ctx.userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      preferredCurrency: true,
      createdAt: true,
    },
  });
  return toPublicUser(user);
}
