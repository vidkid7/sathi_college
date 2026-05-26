import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { withSecurityHeaders } from "@/lib/security";

const MAX_PAGE_SIZE = 100;

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  if (session.user?.role !== "ADMIN" && session.user?.role !== "EDITOR") return null;
  return session;
}

function pageParams(req: NextRequest) {
  const page = Math.max(1, Number.parseInt(req.nextUrl.searchParams.get("page") || "1", 10) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.parseInt(req.nextUrl.searchParams.get("pageSize") || "20", 10) || 20));
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  return { page, pageSize, skip: (page - 1) * pageSize, q };
}

function toInt(value: unknown, fallback: number | null = null) {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toFloat(value: unknown, fallback: number | null = null) {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function text(value: unknown, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
}

function normalizeCollegeExam(item: any) {
  return {
    __adminId: `${item.collegeId}__${item.examId}`,
    collegeId: item.collegeId,
    examId: item.examId,
    collegeName: item.college?.name || "",
    examName: item.exam?.name || ""
  };
}

export async function GET(req: NextRequest, { params }: { params: { entity: string } }) {
  const session = await ensureAdmin();
  if (!session) return withSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), req);
  const { page, pageSize, skip, q } = pageParams(req);

  try {
    if (params.entity === "cutoffs") {
      const where = q
        ? {
            OR: [
              { branch: { contains: q } },
              { category: { contains: q } },
              { exam: { name: { contains: q } } },
              { college: { name: { contains: q } } }
            ]
          }
        : {};
      const [rows, total] = await Promise.all([
        db.cutoff.findMany({ where, include: { exam: { select: { name: true } }, college: { select: { name: true } } }, orderBy: [{ year: "desc" }, { closingRank: "asc" }], skip, take: pageSize }),
        db.cutoff.count({ where })
      ]);
      const items = rows.map((row) => ({ ...row, examName: row.exam.name, collegeName: row.college.name }));
      return withSecurityHeaders(NextResponse.json({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }), req);
    }

    if (params.entity === "college-exams") {
      const where = q
        ? {
            OR: [
              { exam: { name: { contains: q } } },
              { college: { name: { contains: q } } }
            ]
          }
        : {};
      const [rows, total] = await Promise.all([
        db.collegeExam.findMany({ where, include: { exam: { select: { name: true } }, college: { select: { name: true } } }, orderBy: [{ college: { name: "asc" } }, { exam: { name: "asc" } }], skip, take: pageSize }),
        db.collegeExam.count({ where })
      ]);
      return withSecurityHeaders(NextResponse.json({ items: rows.map(normalizeCollegeExam), total, page, pageSize, totalPages: Math.ceil(total / pageSize) }), req);
    }

    if (params.entity === "rank-predictions") {
      const where = q ? { OR: [{ exam: { contains: q } }, { category: { contains: q } }] } : {};
      const [items, total] = await Promise.all([
        db.rankPrediction.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: pageSize }),
        db.rankPrediction.count({ where })
      ]);
      return withSecurityHeaders(NextResponse.json({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }), req);
    }

    return withSecurityHeaders(NextResponse.json({ error: "Unknown entity" }, { status: 404 }), req);
  } catch (error: any) {
    return withSecurityHeaders(NextResponse.json({ error: error?.message || "Could not load records" }, { status: 500 }), req);
  }
}

export async function POST(req: NextRequest, { params }: { params: { entity: string } }) {
  const session = await ensureAdmin();
  if (!session) return withSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), req);
  try {
    const body = await req.json();
    if (params.entity === "cutoffs") {
      const item = await db.cutoff.create({
        data: {
          examId: text(body.examId),
          collegeId: text(body.collegeId),
          branch: text(body.branch),
          category: text(body.category),
          year: toInt(body.year, new Date().getFullYear())!,
          closingRank: toInt(body.closingRank, 1)!
        }
      });
      return withSecurityHeaders(NextResponse.json({ item }), req);
    }
    if (params.entity === "college-exams") {
      const item = await db.collegeExam.create({ data: { collegeId: text(body.collegeId), examId: text(body.examId) } });
      return withSecurityHeaders(NextResponse.json({ item: normalizeCollegeExam(item) }), req);
    }
    if (params.entity === "rank-predictions") {
      const item = await db.rankPrediction.create({
        data: {
          exam: text(body.exam),
          marks: toFloat(body.marks, 0)!,
          category: text(body.category),
          predicted: toInt(body.predicted, 1)!,
          meta: text(body.meta) || null
        }
      });
      return withSecurityHeaders(NextResponse.json({ item }), req);
    }
    return withSecurityHeaders(NextResponse.json({ error: "Unknown entity" }, { status: 404 }), req);
  } catch (error: any) {
    return withSecurityHeaders(NextResponse.json({ error: error?.message || "Save failed" }, { status: 400 }), req);
  }
}

export const runtime = "nodejs";
