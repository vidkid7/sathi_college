import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { rateLimitRequest, rateLimitedJson, withSecurityHeaders } from "@/lib/security";

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const canonicalAuthUrl = process.env.NEXTAUTH_URL;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");

  if (canonicalAuthUrl && host) {
    const canonical = new URL(canonicalAuthUrl);
    const isAuthSurface = pathname === "/login" || pathname === "/signup" || pathname.startsWith("/api/auth");
    if (isAuthSurface && host !== canonical.host) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.protocol = canonical.protocol;
      redirectUrl.host = canonical.host;
      redirectUrl.port = canonical.port;
      return withSecurityHeaders(NextResponse.redirect(redirectUrl), req);
    }
  }

  if (pathname === "/api/auth/callback/credentials" && req.method === "POST") {
    const limit = rateLimitRequest(req, "auth-callback", {
      limit: 5,
      windowMs: 15 * 60 * 1000,
      blockMs: 20 * 60 * 1000
    });
    if (!limit.ok) return withSecurityHeaders(rateLimitedJson(limit), req);
  }

  const publicAdminPaths = pathname === "/admin/access" || pathname === "/admin/login";
  if (pathname.startsWith("/admin") && !publicAdminPaths) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const role = (token as any)?.role;
    if (role !== "ADMIN" && role !== "EDITOR") {
      const loginUrl = new URL("/admin/access", req.url);
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
      return withSecurityHeaders(NextResponse.redirect(loginUrl), req);
    }
  }

  return withSecurityHeaders(NextResponse.next(), req);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|assets/|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|xml|webmanifest)$).*)"
  ]
};
