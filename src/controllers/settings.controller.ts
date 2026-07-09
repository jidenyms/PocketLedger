import { NextResponse } from "next/server";
import { updateSettingsSchema } from "@/lib/validation/settings";
import { requireAuth } from "@/lib/auth/require-auth";
import {
  getUserSettings,
  updateUserSettings,
} from "@/services/user-settings.service";

export async function getSettingsController() {
  const ctx = await requireAuth();
  const user = await getUserSettings(ctx);
  return NextResponse.json({ user });
}

export async function patchSettingsController(request: Request) {
  const ctx = await requireAuth();
  const body = updateSettingsSchema.parse(await request.json());
  const user = await updateUserSettings(ctx, body);
  return NextResponse.json({ user });
}
