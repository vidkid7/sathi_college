import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { normalizeExamSlug } from "@/lib/exam-catalog";
import { realImageOr, universityCampusImage } from "@/lib/real-images";
import { rateLimitRequest, rateLimitedJson, withSecurityHeaders } from "@/lib/security";

const Schema = z.object({
  exam: z.string().trim().min(1).max(80),
  rank: z.coerce.number().int().min(1).max(10_000_000),
  category: z.string().trim().min(1).max(40)
});

const fallbackColleges = [
  { name: "Sathi Global University", city: "Global", state: "Program Match", type: "Database fallback", rating: 4.7 },
  { name: "Sathi Institute of Technology", city: "Global", state: "Technology", type: "Database fallback", rating: 4.5 },
  { name: "Sathi School of Business", city: "Global", state: "Business", type: "Database fallback", rating: 4.4 },
  { name: "Sathi College of Applied Sciences", city: "Global", state: "Applied Sciences", type: "Database fallback", rating: 4.3 },
  { name: "Sathi Career Pathway College", city: "Global", state: "Career Pathway", type: "Database fallback", rating: 4.2 }
];

function fallbackCollegeResults(examSlug: string, rank: number) {
  const start = rank <= 25_000 ? 0 : rank <= 100_000 ? 1 : 2;
  return fallbackColleges.slice(start, start + 3).map((college, index) => ({
    id: `fallback-${examSlug}-${start + index}`,
    slug: `fallback-${examSlug}-${start + index}`,
    ...college,
    fees: 0,
    description: "Temporary recommendation shown when the predictor database is unavailable.",
    heroImage: universityCampusImage(),
    featured: index === 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
}

export async function POST(req: NextRequest) {
  const limited = rateLimitRequest(req, "college-predictor", { limit: 40, windowMs: 60_000, blockMs: 5 * 60_000 });
  if (!limited.ok) return rateLimitedJson(limited);
  try {
    const body = await req.json();
    const data = Schema.parse(body);
    const examSlug = normalizeExamSlug(data.exam);

    let results;
    try {
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

      results = collegeIds.length
        ? await db.college.findMany({ where: { id: { in: collegeIds } }, orderBy: { rating: "desc" } })
        : await db.college.findMany({ orderBy: [{ featured: "desc" }, { rating: "desc" }], take: 12 });
    } catch {
      results = fallbackCollegeResults(examSlug, data.rank);
    }

    const normalizedResults = results.map((college: any) => ({
      ...college,
      heroImage: realImageOr(college.heroImage, universityCampusImage())
    }));
    return withSecurityHeaders(NextResponse.json({ results: normalizedResults }), req);
  } catch (e) {
    return withSecurityHeaders(NextResponse.json({ error: "Invalid request" }, { status: 400 }), req);
  }
}
