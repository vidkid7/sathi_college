import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline";
import { Prisma, PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const DEFAULT_DATA_DIR = path.resolve(
  process.cwd(),
  "..",
  "scraper",
  "data",
  "coursefinder_full_20260526_184727"
);

const args = process.argv.slice(2);
const getArg = (name: string) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

const source = path.resolve(
  getArg("--source") ||
    process.env.COURSEFINDER_RAW_PATH ||
    path.join(process.env.COURSEFINDER_DATA_DIR || DEFAULT_DATA_DIR, "raw_courses.ndjson")
);
const reset = !args.includes("--no-reset");
const dryRun = args.includes("--dry-run");
const batchSize = Math.max(100, Number(getArg("--batch-size") || 500));

type UniversityRow = Prisma.SearchUniversityCreateManyInput & {
  programIds: Set<number>;
};

type ProgramRow = Prisma.SearchProgramCreateManyInput;

type OfferingRow = Prisma.SearchProgramOfferingCreateManyInput;

function toStringValue(value: unknown, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
}

function nullableText(value: unknown, max = 6000) {
  const text = toStringValue(value);
  if (!text) return null;
  return text.length > max ? text.slice(0, max) : text;
}

function shortText(value: unknown, max: number) {
  const text = toStringValue(value);
  if (!text) return null;
  return text.length > max ? text.slice(0, max) : text;
}

function toInt(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function toBool(value: unknown) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function toDecimal(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const normalized = String(value).replace(/,/g, "").trim();
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return null;
  return new Prisma.Decimal(parsed.toFixed(2));
}

function lowerDecimal(current: Prisma.Decimal | null | undefined, next: Prisma.Decimal | null) {
  if (!next) return current ?? null;
  if (!current) return next;
  return next.lessThan(current) ? next : current;
}

function appendUnique(current: string | null | undefined, next: unknown, max = 1400) {
  const values = new Set(
    toStringValue(current)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  );
  const additions = Array.isArray(next) ? next : toStringValue(next).split(",");
  for (const item of additions) {
    const normalized = toStringValue(item);
    if (normalized) values.add(normalized);
  }
  const merged = Array.from(values).slice(0, 32).join(", ");
  return merged.length > max ? merged.slice(0, max) : merged || null;
}

function buildSearchText(record: any) {
  return [
    record.Name,
    record.Concentration,
    record.universityName,
    record.universityCountry,
    record.universityState,
    record.universityCity,
    record.Campus,
    record.Studylvl,
    record.ApplicationMode,
    record.EntryRequirement,
    record.EntryRequirementTwelfth,
    record.EntryRequirementUG,
    record.Remarks
  ]
    .map((item) => nullableText(item, 800))
    .filter(Boolean)
    .join(" ")
    .slice(0, 12000);
}

function makeProgram(record: any): ProgramRow | null {
  const sourceId = toInt(record.Id);
  const universitySourceId = toInt(record.UniversityId);
  const name = shortText(record.Name, 500);
  const universityName = shortText(record.universityName, 255);
  if (!sourceId || !universitySourceId || !name || !universityName) return null;

  return {
    sourceId,
    name,
    concentration: shortText(record.Concentration, 255),
    universitySourceId,
    universityName,
    universityCountry: shortText(record.universityCountry, 120),
    universityState: shortText(record.universityState, 160),
    universityCity: shortText(record.universityCity, 160),
    studyLevel: shortText(record.Studylvl, 120),
    studyLevelId: toInt(record.StudyLevelId),
    categoryId: shortText(record.CategoryId, 40),
    subCategoryId: shortText(record.SubCategoryId, 40),
    durationMonths: toInt(record.Duration),
    campus: shortText(record.Campus, 255),
    currencyCode: shortText(record.CurrencyCode || record.TuitionFeeCurrency, 12),
    applicationMode: shortText(record.ApplicationMode, 80),
    highlights: shortText(record.Highlights, 255),
    intakesText: appendUnique(null, record.DisplayIntakes || record.Intakes),
    minTuitionAmount: toDecimal(record.Amount),
    tuitionFeeText: nullableText(record.TutionFee, 2000),
    applicationFeeAmount: toDecimal(record.ApplicationFeeAmt),
    applicationFeeText: shortText(record.ApplicationFee, 120),
    applicationFeeCurrency: shortText(record.ApplicationFeeCurrency, 12),
    appFeeWaiverAvailable: toBool(record.AppFeeWaiverAvailable),
    scholarshipAvailable: toBool(record.ScholarshipAvailable),
    internshipAvailable: toBool(record.InternshipAvailable),
    isOnline: toBool(record.IsOnlineCourse),
    isStem: toBool(record.IsStemCourse),
    withoutEnglishProficiency: toBool(record.WithoutEnglishProficiency),
    withoutMaths: toBool(record.WithoutMaths),
    eslAvailable: toBool(record.EslAvailable),
    elpAvailable: toBool(record.ElpAvailable),
    isMoiWaiver: toBool(record.IsMOIWaiver),
    fifteenYearsEducation: toBool(record.FifteenYearsEducation),
    pteRequired: toBool(record.PteRequired),
    toeflRequired: toBool(record.ToeflRequired),
    ieltsRequired: toBool(record.IeltsRequired),
    detRequired: toBool(record.DETRequired),
    satRequired: toBool(record.SatRequired),
    actRequired: toBool(record.ActRequired),
    greRequired: toBool(record.GreRequired),
    gmatRequired: toBool(record.GmatRequired),
    pteScore: shortText(record.PteScore, 60),
    toeflScore: shortText(record.ToeflScore, 60),
    ieltsOverall: shortText(record.IeltsOverall, 60),
    detScore: shortText(record.DETScore, 60),
    satScore: shortText(record.SatScore, 60),
    actScore: shortText(record.ActScore, 60),
    greScore: shortText(record.GreScore, 60),
    gmatScore: shortText(record.GmatScore, 60),
    entryRequirement: nullableText(record.EntryRequirement, 6000),
    entryRequirementTwelfth: nullableText(record.EntryRequirementTwelfth, 5000),
    entryRequirementUG: nullableText(record.EntryRequirementUG, 5000),
    scholarshipDetail: nullableText(record.ScholarshipDeatil, 5000),
    remarks: nullableText(record.Remarks, 6000),
    usNewsRanking: toInt(record.USNewsRanking),
    qsRanking: toInt(record.QSRanking),
    webometricsNationalRank: toInt(record.WebomatricsNationalRanking),
    webometricsWorldRank: toInt(record.WebomatricsWorldRanking),
    searchText: buildSearchText(record)
  };
}

function mergeProgram(current: ProgramRow, record: any) {
  current.minTuitionAmount = lowerDecimal(current.minTuitionAmount as Prisma.Decimal | null, toDecimal(record.Amount));
  current.applicationFeeAmount = lowerDecimal(current.applicationFeeAmount as Prisma.Decimal | null, toDecimal(record.ApplicationFeeAmt));
  current.intakesText = appendUnique(current.intakesText, record.DisplayIntakes || record.Intakes);
  current.scholarshipAvailable = current.scholarshipAvailable || toBool(record.ScholarshipAvailable);
  current.appFeeWaiverAvailable = current.appFeeWaiverAvailable || toBool(record.AppFeeWaiverAvailable);
  current.internshipAvailable = current.internshipAvailable || toBool(record.InternshipAvailable);
  current.isOnline = current.isOnline || toBool(record.IsOnlineCourse);
  current.isStem = current.isStem || toBool(record.IsStemCourse);
  current.withoutEnglishProficiency = current.withoutEnglishProficiency || toBool(record.WithoutEnglishProficiency);
  current.withoutMaths = current.withoutMaths || toBool(record.WithoutMaths);
  current.eslAvailable = current.eslAvailable || toBool(record.EslAvailable);
  current.elpAvailable = current.elpAvailable || toBool(record.ElpAvailable);
  current.isMoiWaiver = current.isMoiWaiver || toBool(record.IsMOIWaiver);
  current.fifteenYearsEducation = current.fifteenYearsEducation || toBool(record.FifteenYearsEducation);
  current.pteRequired = current.pteRequired || toBool(record.PteRequired);
  current.toeflRequired = current.toeflRequired || toBool(record.ToeflRequired);
  current.ieltsRequired = current.ieltsRequired || toBool(record.IeltsRequired);
  current.detRequired = current.detRequired || toBool(record.DETRequired);
  current.satRequired = current.satRequired || toBool(record.SatRequired);
  current.actRequired = current.actRequired || toBool(record.ActRequired);
  current.greRequired = current.greRequired || toBool(record.GreRequired);
  current.gmatRequired = current.gmatRequired || toBool(record.GmatRequired);
}

function makeOffering(record: any): OfferingRow | null {
  const programSourceId = toInt(record.Id);
  const universitySourceId = toInt(record.UniversityId);
  const extractionYear = toInt(record.extractionYear);
  if (!programSourceId || !universitySourceId || !extractionYear) return null;

  return {
    programSourceId,
    universitySourceId,
    extractionYear,
    extractionCountryFilterId: toInt(record.extractionCountryFilterId) ?? 0,
    extractionCountryFilterLabel: shortText(record.extractionCountryFilterLabel, 120),
    extractionProgramLevelFilterId: shortText(record.extractionProgramLevelFilterId, 40),
    extractionProgramLevelFilterLabel: shortText(record.extractionProgramLevelFilterLabel, 120),
    applicationDeadline: shortText(record.ApplicationDeadline, 255),
    applicationDeadlineDetails: nullableText(record.ApplicationDeadlineDetails, 2000),
    intakes: nullableText(record.Intakes, 2000),
    displayIntakes: Array.isArray(record.DisplayIntakes) ? record.DisplayIntakes : Prisma.JsonNull,
    intakesAndDeadlines: nullableText(record.IntakesAndDeadlines, 3000),
    upcomingIntakeDeadlines: nullableText(record.UpcomingIntakeDeadLines, 3000),
    intakesClosed: nullableText(record.IntakesClosed, 3000),
    tuitionFee: nullableText(record.TutionFee, 2000),
    amount: toDecimal(record.Amount),
    tuitionFeeCurrency: shortText(record.TuitionFeeCurrency || record.CurrencyCode, 12),
    applicationFee: shortText(record.ApplicationFee, 120),
    applicationFeeAmount: toDecimal(record.ApplicationFeeAmt),
    applicationFeeCurrency: shortText(record.ApplicationFeeCurrency, 12)
  };
}

async function streamRecords(onRecord: (record: any, lineNumber: number) => Promise<void> | void) {
  const input = createReadStream(source, { encoding: "utf8" });
  const reader = createInterface({ input, crlfDelay: Infinity });
  let lineNumber = 0;
  for await (const line of reader) {
    if (!line.trim()) continue;
    lineNumber += 1;
    await onRecord(JSON.parse(line), lineNumber);
  }
  return lineNumber;
}

async function insertBatches<T>(label: string, rows: T[], insert: (chunk: T[]) => Promise<unknown>) {
  let inserted = 0;
  for (let index = 0; index < rows.length; index += batchSize) {
    const chunk = rows.slice(index, index + batchSize);
    if (!dryRun) await insert(chunk);
    inserted += chunk.length;
    if (inserted % 25000 < batchSize || inserted === rows.length) {
      console.log(`${label}: ${inserted.toLocaleString("en-IN")} / ${rows.length.toLocaleString("en-IN")}`);
    }
  }
}

async function main() {
  if (!existsSync(source)) {
    throw new Error(`CourseFinder raw data not found: ${source}`);
  }

  console.log(`Source: ${source}`);
  console.log(`Reset search tables: ${reset ? "yes" : "no"}`);
  console.log(`Batch size: ${batchSize}`);

  if (reset && !dryRun) {
    await db.searchProgramOffering.deleteMany();
    await db.searchProgram.deleteMany();
    await db.searchUniversity.deleteMany();
  }

  const universities = new Map<number, UniversityRow>();
  const programs = new Map<number, ProgramRow>();
  let skipped = 0;

  console.log("Pass 1: reading universities and unique programs...");
  const lines = await streamRecords((record, lineNumber) => {
    const program = makeProgram(record);
    const universitySourceId = toInt(record.UniversityId);
    if (!program || !universitySourceId) {
      skipped += 1;
      return;
    }

    if (!universities.has(universitySourceId)) {
      universities.set(universitySourceId, {
        sourceId: universitySourceId,
        name: program.universityName,
        country: shortText(record.universityCountry, 120),
        state: shortText(record.universityState, 160),
        city: shortText(record.universityCity, 160),
        countryId: toInt(record.CountryId),
        currencyCode: shortText(record.CurrencyCode, 12),
        logoExtension: shortText(record.universityLogoExtension, 20),
        displayOrder: toInt(record.UniversityOrder),
        programCount: 0,
        offeringCount: 0,
        programIds: new Set<number>()
      });
    }

    const university = universities.get(universitySourceId)!;
    university.offeringCount = (university.offeringCount ?? 0) + 1;
    university.programIds.add(program.sourceId);

    const existing = programs.get(program.sourceId);
    if (existing) mergeProgram(existing, record);
    else programs.set(program.sourceId, program);

    if (lineNumber % 50000 === 0) {
      console.log(
        `read ${lineNumber.toLocaleString("en-IN")} rows, ${programs.size.toLocaleString("en-IN")} programs, ${universities.size.toLocaleString("en-IN")} universities`
      );
    }
  });

  for (const university of universities.values()) {
    university.programCount = university.programIds.size;
    delete (university as Partial<UniversityRow>).programIds;
  }

  console.log(
    `Pass 1 complete: ${lines.toLocaleString("en-IN")} rows, ${programs.size.toLocaleString("en-IN")} programs, ${universities.size.toLocaleString("en-IN")} universities, ${skipped.toLocaleString("en-IN")} skipped`
  );

  await insertBatches("universities", Array.from(universities.values()), (chunk) =>
    db.searchUniversity.createMany({ data: chunk, skipDuplicates: true })
  );
  await insertBatches("programs", Array.from(programs.values()), (chunk) =>
    db.searchProgram.createMany({ data: chunk, skipDuplicates: true })
  );

  console.log("Pass 2: importing program offerings...");
  let offerBatch: OfferingRow[] = [];
  let offersRead = 0;
  let offersWritten = 0;
  let offerSkipped = 0;

  await streamRecords(async (record) => {
    const offering = makeOffering(record);
    if (!offering) {
      offerSkipped += 1;
      return;
    }
    offersRead += 1;
    offerBatch.push(offering);
    if (offerBatch.length >= batchSize) {
      if (!dryRun) await db.searchProgramOffering.createMany({ data: offerBatch, skipDuplicates: true });
      offersWritten += offerBatch.length;
      offerBatch = [];
      if (offersWritten % 50000 < batchSize) {
        console.log(`offerings: ${offersWritten.toLocaleString("en-IN")} written`);
      }
    }
  });

  if (offerBatch.length) {
    if (!dryRun) await db.searchProgramOffering.createMany({ data: offerBatch, skipDuplicates: true });
    offersWritten += offerBatch.length;
  }

  const counts = dryRun
    ? {
        universities: universities.size,
        programs: programs.size,
        offerings: offersWritten
      }
    : {
        universities: await db.searchUniversity.count(),
        programs: await db.searchProgram.count(),
        offerings: await db.searchProgramOffering.count()
      };

  console.log(
    `Import complete: ${counts.universities.toLocaleString("en-IN")} universities, ${counts.programs.toLocaleString("en-IN")} programs, ${counts.offerings.toLocaleString("en-IN")} offerings.`
  );
  if (offerSkipped) console.log(`Skipped offerings: ${offerSkipped.toLocaleString("en-IN")}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
