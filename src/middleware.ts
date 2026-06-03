import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { rateLimitRequest, rateLimitedJson, withSecurityHeaders } from "@/lib/security";

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const canonicalAuthUrl = process.env.NEXTAUTH_URL;
  const canonicalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sathicollege.com";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const methodAllowsCanonicalRedirect = req.method === "GET" || req.method === "HEAD";
  const isAuthSurface = pathname === "/login" || pathname === "/signup" || pathname.startsWith("/api/auth");
  const brandAliasPaths = new Set([
    "/sathi",
    "/sathi-college",
    "/sathicollege",
    "/sathi-college-official",
    "/sathicollege-official",
    "/sathi-college-course-finder"
  ]);

  if (methodAllowsCanonicalRedirect && brandAliasPaths.has(pathname.toLowerCase().replace(/\/$/, "") || "/")) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    return withSecurityHeaders(NextResponse.redirect(redirectUrl, 308), req);
  }

  if (methodAllowsCanonicalRedirect && pathname === "/privacy") {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/privacy-policy";
    return withSecurityHeaders(NextResponse.redirect(redirectUrl, 308), req);
  }

  if (methodAllowsCanonicalRedirect && pathname === "/terms") {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/terms-of-service";
    return withSecurityHeaders(NextResponse.redirect(redirectUrl, 308), req);
  }

  if (host && methodAllowsCanonicalRedirect && !isAuthSurface && !pathname.startsWith("/api") && !pathname.startsWith("/admin")) {
    const canonicalSite = new URL(canonicalSiteUrl);
    const currentHost = host.toLowerCase();
    const duplicateHosts = new Set(["www.sathicollege.com", "sathi-college-production.up.railway.app"]);
    if (currentHost !== canonicalSite.host && duplicateHosts.has(currentHost)) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.protocol = canonicalSite.protocol;
      redirectUrl.host = canonicalSite.host;
      redirectUrl.port = canonicalSite.port;
      return withSecurityHeaders(NextResponse.redirect(redirectUrl, 308), req);
    }
  }

  if (canonicalAuthUrl && host) {
    const canonical = new URL(canonicalAuthUrl);
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
