import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { normalizeExamSlug } from "@/lib/exam-catalog";
import { rateLimitRequest, rateLimitedJson, withSecurityHeaders } from "@/lib/security";

const Schema = z.object({
  exam: z.string().trim().min(1).max(80),
  marks: z.coerce.number().min(0).max(720),
  category: z.string().trim().min(1).max(40)
});

// Heuristic rank-band mapping. Replace with real ML / cutoff-trend data.
const profiles: Record<string, { max: number; total: number; cap: number }> = {
  "jee-main": { max: 300, total: 300, cap: 1100000 },
  "jee-advanced": { max: 360, total: 360, cap: 250000 },
  "ap-eamcet": { max: 160, total: 160, cap: 200000 },
  "ts-eamcet": { max: 160, total: 160, cap: 220000 },
  "kcet": { max: 180, total: 180, cap: 200000 },
  "mht-cet": { max: 200, total: 200, cap: 350000 },
  "keam": { max: 480, total: 480, cap: 90000 },
  "tnea": { max: 200, total: 200, cap: 150000 },
  "wbjee": { max: 200, total: 200, cap: 120000 }
};

const categoryFactor: Record<string, number> = {
  General: 1, OBC: 0.85, EWS: 0.9, SC: 0.55, ST: 0.45
};

export async function POST(req: NextRequest) {
  const limited = rateLimitRequest(req, "rank-predictor", { limit: 40, windowMs: 60_000, blockMs: 5 * 60_000 });
  if (!limited.ok) return rateLimitedJson(limited);
  try {
    const body = await req.json();
    const data = Schema.parse(body);
    const examSlug = normalizeExamSlug(data.exam);
    const p = profiles[examSlug] || profiles["jee-main"];
    const ratio = Math.max(0, Math.min(1, data.marks / p.total));
    const baseRank = Math.round(p.cap * Math.pow(1 - ratio, 1.6) + 1);
    const factor = categoryFactor[data.category] ?? 1;
    const predicted = Math.max(1, Math.round(baseRank * factor));

    await db.rankPrediction.create({
      data: {
        exam: examSlug,
        marks: data.marks,
        category: data.category,
        predicted
      }
    }).catch(() => {});

    return withSecurityHeaders(NextResponse.json({ predicted }), req);
  } catch (e) {
    return withSecurityHeaders(NextResponse.json({ error: "Invalid request" }, { status: 400 }), req);
  }
}
