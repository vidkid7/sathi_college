import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getResource } from "@/lib/admin-resources";
import { withSecurityHeaders } from "@/lib/security";

async function ensureAdmin() {
  const s = await getServerSession(authOptions);
  if (!s) return null;
  if (s.user?.role !== "ADMIN" && s.user?.role !== "EDITOR") return null;
  return s;
}

export async function GET(req: NextRequest, { params }: { params: { resource: string } }) {
  const session = await ensureAdmin();
  if (!session) return withSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), req);
  const res = getResource(params.resource);
  if (!res) return withSecurityHeaders(NextResponse.json({ error: "Unknown resource" }, { status: 404 }), req);
  const items = await res.model.findMany({ orderBy: res.orderBy });
  return withSecurityHeaders(NextResponse.json({ items }), req);
}

export async function POST(req: NextRequest, { params }: { params: { resource: string } }) {
  const session = await ensureAdmin();
  if (!session) return withSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), req);
  const res = getResource(params.resource);
  if (!res) return withSecurityHeaders(NextResponse.json({ error: "Unknown resource" }, { status: 404 }), req);
  try {
    const body = await req.json();
    const parsed = res.schema.parse(body);
    const data = params.resource === "communityPosts"
      ? { ...parsed, authorId: session.user.id }
      : parsed;
    const created = await res.model.create({ data });
    return withSecurityHeaders(NextResponse.json({ item: created }), req);
  } catch (e: any) {
    return withSecurityHeaders(NextResponse.json({ error: e?.message ?? "Invalid" }, { status: 400 }), req);
  }
}
