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

export async function PUT(req: NextRequest, { params }: { params: { resource: string; id: string } }) {
  const session = await ensureAdmin();
  if (!session) return withSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), req);
  const res = getResource(params.resource);
  if (!res) return withSecurityHeaders(NextResponse.json({ error: "Unknown resource" }, { status: 404 }), req);
  try {
    const body = await req.json();
    const data = res.schema.partial().parse(body);
    const updated = await res.model.update({ where: { id: params.id }, data });
    return withSecurityHeaders(NextResponse.json({ item: updated }), req);
  } catch (e: any) {
    return withSecurityHeaders(NextResponse.json({ error: e?.message ?? "Invalid" }, { status: 400 }), req);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { resource: string; id: string } }) {
  const session = await ensureAdmin();
  if (!session) return withSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), req);
  const res = getResource(params.resource);
  if (!res) return withSecurityHeaders(NextResponse.json({ error: "Unknown resource" }, { status: 404 }), req);
  await res.model.delete({ where: { id: params.id } });
  return withSecurityHeaders(NextResponse.json({ ok: true }), req);
}
