import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
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
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number.parseInt(req.nextUrl.searchParams.get("pageSize") || "20", 10) || 20)
  );
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  return { page, pageSize, skip: (page - 1) * pageSize, q };
}

function toInt(value: unknown, fallback: number | null = null) {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toDecimal(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? new Prisma.Decimal(parsed.toFixed(2)) : null;
}

function text(value: unknown, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
}

function nullableText(value: unknown) {
  const normalized = text(value);
  return normalized ? normalized : null;
}

function bool(value: unknown) {
  return value === true || value === "true" || value === "on" || value === 1 || value === "1";
}

function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function programData(body: any, creating: boolean) {
  const name = text(body.name);
  const universityName = text(body.universityName);
  const sourceId = toInt(body.sourceId);
  const universitySourceId = toInt(body.universitySourceId);
  if (creating && (!sourceId || !universitySourceId || !name || !universityName)) {
    throw new Error("sourceId, universitySourceId, name and universityName are required.");
  }
  const data: any = {
    ...(creating ? { sourceId, universitySourceId, name, universityName } : {}),
    name: name || undefined,
    concentration: nullableText(body.concentration),
    universityName: universityName || undefined,
    universityCountry: nullableText(body.universityCountry),
    universityState: nullableText(body.universityState),
    universityCity: nullableText(body.universityCity),
    studyLevel: nullableText(body.studyLevel),
    studyLevelId: toInt(body.studyLevelId),
    categoryId: nullableText(body.categoryId),
    subCategoryId: nullableText(body.subCategoryId),
    durationMonths: toInt(body.durationMonths),
    campus: nullableText(body.campus),
    currencyCode: nullableText(body.currencyCode),
    applicationMode: nullableText(body.applicationMode),
    highlights: nullableText(body.highlights),
    intakesText: nullableText(body.intakesText),
    minTuitionAmount: toDecimal(body.minTuitionAmount),
    tuitionFeeText: nullableText(body.tuitionFeeText),
    applicationFeeAmount: toDecimal(body.applicationFeeAmount),
    applicationFeeText: nullableText(body.applicationFeeText),
    applicationFeeCurrency: nullableText(body.applicationFeeCurrency),
    appFeeWaiverAvailable: bool(body.appFeeWaiverAvailable),
    scholarshipAvailable: bool(body.scholarshipAvailable),
    internshipAvailable: bool(body.internshipAvailable),
    isOnline: bool(body.isOnline),
    isStem: bool(body.isStem),
    withoutEnglishProficiency: bool(body.withoutEnglishProficiency),
    withoutMaths: bool(body.withoutMaths),
    eslAvailable: bool(body.eslAvailable),
    elpAvailable: bool(body.elpAvailable),
    pteRequired: bool(body.pteRequired),
    toeflRequired: bool(body.toeflRequired),
    ieltsRequired: bool(body.ieltsRequired),
    detRequired: bool(body.detRequired),
    satRequired: bool(body.satRequired),
    actRequired: bool(body.actRequired),
    greRequired: bool(body.greRequired),
    gmatRequired: bool(body.gmatRequired),
    pteScore: nullableText(body.pteScore),
    toeflScore: nullableText(body.toeflScore),
    ieltsOverall: nullableText(body.ieltsOverall),
    detScore: nullableText(body.detScore),
    satScore: nullableText(body.satScore),
    actScore: nullableText(body.actScore),
    greScore: nullableText(body.greScore),
    gmatScore: nullableText(body.gmatScore),
    entryRequirement: nullableText(body.entryRequirement),
    scholarshipDetail: nullableText(body.scholarshipDetail),
    remarks: nullableText(body.remarks)
  };
  data.searchText = text(body.searchText) || [data.name || name, data.universityName || universityName, data.universityCountry, data.studyLevel, data.entryRequirement, data.remarks].filter(Boolean).join(" ");
  return data;
}

function universityData(body: any, creating: boolean): any {
  const sourceId = toInt(body.sourceId);
  const name = text(body.name);
  if (creating && (!sourceId || !name)) throw new Error("sourceId and name are required.");
  return {
    ...(creating ? { sourceId, name } : {}),
    name: name || undefined,
    country: nullableText(body.country),
    state: nullableText(body.state),
    city: nullableText(body.city),
    countryId: toInt(body.countryId),
    currencyCode: nullableText(body.currencyCode),
    logoExtension: nullableText(body.logoExtension),
    displayOrder: toInt(body.displayOrder),
    programCount: toInt(body.programCount, 0) ?? 0,
    offeringCount: toInt(body.offeringCount, 0) ?? 0
  };
}

function offeringData(body: any, creating: boolean): any {
  const programSourceId = toInt(body.programSourceId);
  const universitySourceId = toInt(body.universitySourceId);
  const extractionYear = toInt(body.extractionYear);
  if (creating && (!programSourceId || !universitySourceId || !extractionYear)) {
    throw new Error("programSourceId, universitySourceId and extractionYear are required.");
  }
  return {
    ...(creating ? { programSourceId, universitySourceId, extractionYear } : {}),
    extractionCountryFilterId: toInt(body.extractionCountryFilterId, 0) ?? 0,
    extractionCountryFilterLabel: nullableText(body.extractionCountryFilterLabel),
    extractionProgramLevelFilterId: nullableText(body.extractionProgramLevelFilterId),
    extractionProgramLevelFilterLabel: nullableText(body.extractionProgramLevelFilterLabel),
    applicationDeadline: nullableText(body.applicationDeadline),
    applicationDeadlineDetails: nullableText(body.applicationDeadlineDetails),
    intakes: nullableText(body.intakes),
    intakesAndDeadlines: nullableText(body.intakesAndDeadlines),
    upcomingIntakeDeadlines: nullableText(body.upcomingIntakeDeadlines),
    intakesClosed: nullableText(body.intakesClosed),
    tuitionFee: nullableText(body.tuitionFee),
    amount: toDecimal(body.amount),
    tuitionFeeCurrency: nullableText(body.tuitionFeeCurrency),
    applicationFee: nullableText(body.applicationFee),
    applicationFeeAmount: toDecimal(body.applicationFeeAmount),
    applicationFeeCurrency: nullableText(body.applicationFeeCurrency)
  };
}

export async function GET(req: NextRequest, { params }: { params: { entity: string } }) {
  const session = await ensureAdmin();
  if (!session) return withSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), req);
  const { page, pageSize, skip, q } = pageParams(req);

  try {
    if (params.entity === "programs") {
      const where = q
        ? {
            OR: [
              { name: { contains: q } },
              { universityName: { contains: q } },
              { universityCountry: { contains: q } },
              { studyLevel: { contains: q } },
              { searchText: { contains: q } }
            ]
          }
        : {};
      const [items, total] = await Promise.all([
        db.searchProgram.findMany({ where, orderBy: { sourceId: "desc" }, skip, take: pageSize }),
        db.searchProgram.count({ where })
      ]);
      return withSecurityHeaders(NextResponse.json({ items: plain(items), total, page, pageSize, totalPages: Math.ceil(total / pageSize) }), req);
    }

    if (params.entity === "universities") {
      const where = q
        ? { OR: [{ name: { contains: q } }, { country: { contains: q } }, { state: { contains: q } }, { city: { contains: q } }] }
        : {};
      const [items, total] = await Promise.all([
        db.searchUniversity.findMany({ where, orderBy: [{ programCount: "desc" }, { name: "asc" }], skip, take: pageSize }),
        db.searchUniversity.count({ where })
      ]);
      return withSecurityHeaders(NextResponse.json({ items: plain(items), total, page, pageSize, totalPages: Math.ceil(total / pageSize) }), req);
    }

    if (params.entity === "offerings") {
      const numeric = toInt(q);
      const where = q
        ? {
            OR: [
              ...(numeric ? [{ programSourceId: numeric }, { universitySourceId: numeric }, { extractionYear: numeric }] : []),
              { extractionCountryFilterLabel: { contains: q } },
              { intakes: { contains: q } },
              { applicationDeadline: { contains: q } },
              { tuitionFee: { contains: q } }
            ]
          }
        : {};
      const [items, total] = await Promise.all([
        db.searchProgramOffering.findMany({ where, orderBy: [{ extractionYear: "desc" }, { createdAt: "desc" }], skip, take: pageSize }),
        db.searchProgramOffering.count({ where })
      ]);
      return withSecurityHeaders(NextResponse.json({ items: plain(items), total, page, pageSize, totalPages: Math.ceil(total / pageSize) }), req);
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
    if (params.entity === "programs") {
      const item = await db.searchProgram.create({ data: programData(body, true) });
      return withSecurityHeaders(NextResponse.json({ item: plain(item) }), req);
    }
    if (params.entity === "universities") {
      const item = await db.searchUniversity.create({ data: universityData(body, true) });
      return withSecurityHeaders(NextResponse.json({ item: plain(item) }), req);
    }
    if (params.entity === "offerings") {
      const item = await db.searchProgramOffering.create({ data: offeringData(body, true) });
      return withSecurityHeaders(NextResponse.json({ item: plain(item) }), req);
    }
    return withSecurityHeaders(NextResponse.json({ error: "Unknown entity" }, { status: 404 }), req);
  } catch (error: any) {
    return withSecurityHeaders(NextResponse.json({ error: error?.message || "Save failed" }, { status: 400 }), req);
  }
}

export const runtime = "nodejs";
