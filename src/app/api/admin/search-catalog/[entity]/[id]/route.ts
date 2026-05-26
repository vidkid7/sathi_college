import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { withSecurityHeaders } from "@/lib/security";
import { Prisma } from "@prisma/client";

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

function programData(body: any) {
  const name = text(body.name);
  const universityName = text(body.universityName);
  const data: any = {
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
  data.searchText = text(body.searchText) || [data.name, data.universityName, data.universityCountry, data.studyLevel, data.entryRequirement, data.remarks].filter(Boolean).join(" ");
  return data;
}

function universityData(body: any) {
  return {
    name: text(body.name) || undefined,
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

function offeringData(body: any) {
  return {
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

export async function PUT(req: NextRequest, { params }: { params: { entity: string; id: string } }) {
  const session = await ensureAdmin();
  if (!session) return withSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), req);
  try {
    const id = decodeURIComponent(params.id);
    const body = await req.json();
    if (params.entity === "programs") {
      const item = await db.searchProgram.update({ where: { id }, data: programData(body) });
      return withSecurityHeaders(NextResponse.json({ item: plain(item) }), req);
    }
    if (params.entity === "universities") {
      const item = await db.searchUniversity.update({ where: { id }, data: universityData(body) });
      return withSecurityHeaders(NextResponse.json({ item: plain(item) }), req);
    }
    if (params.entity === "offerings") {
      const item = await db.searchProgramOffering.update({ where: { id }, data: offeringData(body) });
      return withSecurityHeaders(NextResponse.json({ item: plain(item) }), req);
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
    if (params.entity === "programs") await db.searchProgram.delete({ where: { id } });
    else if (params.entity === "universities") await db.searchUniversity.delete({ where: { id } });
    else if (params.entity === "offerings") await db.searchProgramOffering.delete({ where: { id } });
    else return withSecurityHeaders(NextResponse.json({ error: "Unknown entity" }, { status: 404 }), req);
    return withSecurityHeaders(NextResponse.json({ ok: true }), req);
  } catch (error: any) {
    return withSecurityHeaders(NextResponse.json({ error: error?.message || "Delete failed" }, { status: 400 }), req);
  }
}

export const runtime = "nodejs";
