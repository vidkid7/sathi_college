import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { rateLimitRequest, rateLimitedJson, withSecurityHeaders } from "@/lib/security";

const Schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(24).regex(/^[+()0-9\s-]+$/),
  exam: z.string().trim().max(80).optional().nullable(),
  message: z.string().trim().max(2000).optional().nullable(),
  source: z.string().trim().max(80).optional().nullable()
});

export async function POST(req: NextRequest) {
  const limited = rateLimitRequest(req, "lead-submit", { limit: 6, windowMs: 60_000, blockMs: 5 * 60_000 });
  if (!limited.ok) return rateLimitedJson(limited);
  try {
    const body = await req.json();
    const data = Schema.parse(body);
    await db.lead.create({ data: { ...data, source: data.source ?? "contact-form" } });
    return withSecurityHeaders(NextResponse.json({ ok: true }), req);
  } catch {
    return withSecurityHeaders(NextResponse.json({ error: "Invalid input" }, { status: 400 }), req);
  }
}
