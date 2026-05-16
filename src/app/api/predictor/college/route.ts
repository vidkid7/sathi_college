import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { normalizeExamSlug } from "@/lib/exam-catalog";
import { rateLimitRequest, rateLimitedJson, withSecurityHeaders } from "@/lib/security";

const Schema = z.object({
  exam: z.string().trim().min(1).max(80),
  rank: z.coerce.number().int().min(1).max(10_000_000),
  category: z.string().trim().min(1).max(40)
});

export async function POST(req: NextRequest) {
  const limited = rateLimitRequest(req, "college-predictor", { limit: 40, windowMs: 60_000, blockMs: 5 * 60_000 });
  if (!limited.ok) return rateLimitedJson(limited);
  try {
    const body = await req.json();
    const data = Schema.parse(body);
    const examSlug = normalizeExamSlug(data.exam);

    const exam = await db.exam.findUnique({ where: { slug: examSlug } });

    let collegeIds: string[] = [];
    if (exam) {
      const cutoffs = await db.cutoff.findMany({
        where: {
          examId: exam.id,
          category: data.category,
          closingRank: { gte: data.rank }
        },
        orderBy: { closingRank: "asc" },
        take: 60
      });
      collegeIds = Array.from(new Set(cutoffs.map((c) => c.collegeId)));
    }

    let results = collegeIds.length
      ? await db.college.findMany({ where: { id: { in: collegeIds } }, orderBy: { rating: "desc" } })
      : await db.college.findMany({ orderBy: [{ featured: "desc" }, { rating: "desc" }], take: 12 });

    return withSecurityHeaders(NextResponse.json({ results }), req);
  } catch (e) {
    return withSecurityHeaders(NextResponse.json({ error: "Invalid request" }, { status: 400 }), req);
  }
}
