import { NextResponse } from "next/server";
import { signupSchema, loginSchema } from "@/lib/validation/auth";
import {
  registerUser,
  authenticateUser,
  findUserById,
} from "@/services/auth.service";
import { signSessionToken } from "@/lib/auth/jwt";
import {
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
  getClearSessionCookieOptions,
} from "@/lib/auth/session-cookie";
import { requireAuth } from "@/lib/auth/require-auth";

export async function signupController(request: Request) {
  const body = signupSchema.parse(await request.json());
  const user = await registerUser(body);
  const token = await signSessionToken(user.id, user.email);
  const res = NextResponse.json({ user });
  res.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
  return res;
}

export async function loginController(request: Request) {
  const body = loginSchema.parse(await request.json());
  const user = await authenticateUser(body);
  const token = await signSessionToken(user.id, user.email);
  const res = NextResponse.json({ user });
  res.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
  return res;
}

export async function logoutController() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, "", getClearSessionCookieOptions());
  return res;
}

export async function meController() {
  const { userId } = await requireAuth();
  const user = await findUserById(userId);
  if (!user) {
    const res = NextResponse.json({ error: "User not found" }, { status: 401 });
    res.cookies.set(SESSION_COOKIE_NAME, "", getClearSessionCookieOptions());
    return res;
  }
  return NextResponse.json({ user });
}
