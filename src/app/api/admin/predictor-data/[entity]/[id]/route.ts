import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { withSecurityHeaders } from "@/lib/security";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  if (session.user?.role !== "ADMIN" && session.user?.role !== "EDITOR") return null;
  return session;
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

function splitCompoundId(id: string) {
  const [collegeId, examId] = id.split("__");
  if (!collegeId || !examId) throw new Error("Invalid mapping id.");
  return { collegeId, examId };
}

export async function PUT(req: NextRequest, { params }: { params: { entity: string; id: string } }) {
  const session = await ensureAdmin();
  if (!session) return withSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), req);
  try {
    const body = await req.json();
    const id = decodeURIComponent(params.id);
    if (params.entity === "cutoffs") {
      const item = await db.cutoff.update({
        where: { id },
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
    if (params.entity === "rank-predictions") {
      const item = await db.rankPrediction.update({
        where: { id },
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
    if (params.entity === "college-exams") {
      return withSecurityHeaders(NextResponse.json({ error: "Edit mappings by deleting and creating a new pair." }, { status: 400 }), req);
    }
    return withSecurityHeaders(NextResponse.json({ error: "Unknown entity" }, { status: 404 }), req);
  } catch (error: any) {
    return withSecurityHeaders(NextResponse.json({ error: error?.message || "Update failed" }, { status: 400 }), req);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { entity: string; id: string } }) {
  const session = await ensureAdmin();
  if (!session) return withSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), req);
  try {
    const id = decodeURIComponent(params.id);
    if (params.entity === "cutoffs") await db.cutoff.delete({ where: { id } });
    else if (params.entity === "rank-predictions") await db.rankPrediction.delete({ where: { id } });
    else if (params.entity === "college-exams") {
      const { collegeId, examId } = splitCompoundId(id);
      await db.collegeExam.delete({ where: { collegeId_examId: { collegeId, examId } } });
    } else return withSecurityHeaders(NextResponse.json({ error: "Unknown entity" }, { status: 404 }), req);
    return withSecurityHeaders(NextResponse.json({ ok: true }), req);
  } catch (error: any) {
    return withSecurityHeaders(NextResponse.json({ error: error?.message || "Delete failed" }, { status: 400 }), req);
  }
}

export const runtime = "nodejs";
