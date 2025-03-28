import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { UserRole } from "./auth";
import type { JWT } from "next-auth/jwt";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const isAuthPage =
    nextUrl.pathname.startsWith("/auth/signin") ||
    nextUrl.pathname.startsWith("/auth/signup") ||
    nextUrl.pathname.startsWith("/auth/store-signup");

  // Public routes that don't require authentication
  if (isAuthPage || nextUrl.pathname.startsWith("/shop")) {
    return null;
  }

  // Get the token from the session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If no token, redirect to sign in
  if (!token) {
    let from = nextUrl.pathname;
    if (nextUrl.search) {
      from += nextUrl.search;
    }
    return NextResponse.redirect(
      new URL(`/auth/signin?from=${encodeURIComponent(from)}`, nextUrl)
    );
  }

  const userRole = (token.role as UserRole) || "user";

  // Admin routes
  if (nextUrl.pathname.startsWith("/admin")) {
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/shop", nextUrl));
    }
  }

  // Delivery routes
  if (nextUrl.pathname.startsWith("/delivery")) {
    if (userRole !== "delivery") {
      return NextResponse.redirect(new URL("/shop", nextUrl));
    }
  }

  return null;
}

// Optionally configure middleware matcher
export const config = {
  matcher: [
    "/admin/:path*",
    "/delivery/:path*",
    "/shop/:path*",
    "/auth/:path*",
  ],
};
