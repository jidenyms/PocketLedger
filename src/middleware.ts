import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { verifySessionTokenEdge } from "@/lib/auth/jwt-edge";

function clearSessionCookie(res: NextResponse) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const protectedRoots = [
    "/dashboard",
    "/transactions",
    "/income",
    "/expenses",
    "/reports",
    "/settings",
  ];
  const isProtected = protectedRoots.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    try {
      await verifySessionTokenEdge(token);
    } catch {
      const res = NextResponse.redirect(new URL("/login", request.url));
      clearSessionCookie(res);
      return res;
    }
  }

  if (isAuthPage && token) {
    try {
      await verifySessionTokenEdge(token);
      const next = request.nextUrl.searchParams.get("next");
      const dest =
        next && next.startsWith("/") && !next.startsWith("//")
          ? next
          : "/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    } catch {
      const res = NextResponse.next();
      clearSessionCookie(res);
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions",
    "/transactions/:path*",
    "/income",
    "/income/:path*",
    "/expenses",
    "/expenses/:path*",
    "/reports",
    "/reports/:path*",
    "/settings",
    "/settings/:path*",
    "/login",
    "/signup",
  ],
};
