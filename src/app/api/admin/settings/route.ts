import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/settings";
import { withSecurityHeaders } from "@/lib/security";

async function ensureAdmin() {
  const s = await getServerSession(authOptions);
  if (!s) return null;
  if (s.user?.role !== "ADMIN" && s.user?.role !== "EDITOR") return null;
  return s;
}

export async function GET(req: NextRequest) {
  const session = await ensureAdmin();
  if (!session) return withSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), req);
  const settings = await getSettings();
  return withSecurityHeaders(NextResponse.json({ settings }), req);
}

export async function PUT(req: NextRequest) {
  const session = await ensureAdmin();
  if (!session) return withSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), req);
  try {
    const body = await req.json();
    const settings = await saveSettings(body);
    return withSecurityHeaders(NextResponse.json({ settings }), req);
  } catch (e: any) {
    return withSecurityHeaders(NextResponse.json({ error: e?.message ?? "Invalid" }, { status: 400 }), req);
  }
}
