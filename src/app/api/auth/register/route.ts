import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimitRequest, rateLimitedJson, withSecurityHeaders } from "@/lib/security";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128)
});

export async function POST(req: NextRequest) {
  const limited = rateLimitRequest(req, "register", { limit: 5, windowMs: 15 * 60_000, blockMs: 20 * 60_000 });
  if (!limited.ok) return withSecurityHeaders(rateLimitedJson(limited), req);

  try {
    const data = registerSchema.parse(await req.json());
    const email = data.email.toLowerCase();
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return withSecurityHeaders(NextResponse.json({ error: "An account with this email already exists." }, { status: 409 }), req);
    }

    const password = await bcrypt.hash(data.password, 10);
    await db.user.create({
      data: {
        email,
        name: data.name,
        password,
        role: "USER"
      }
    });
    return withSecurityHeaders(NextResponse.json({ ok: true }), req);
  } catch (error: any) {
    return withSecurityHeaders(NextResponse.json({ error: error?.message || "Invalid signup details" }, { status: 400 }), req);
  }
}
