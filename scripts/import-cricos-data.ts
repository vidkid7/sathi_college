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
  "public_sources",
  "cricos_20260501"
);

const CRICOS_UNIVERSITY_MIN = -900000000;
const CRICOS_UNIVERSITY_MAX = -700000000;
const CRICOS_PROGRAM_MIN = -1800000000;
const CRICOS_PROGRAM_MAX = -900000000;

const args = process.argv.slice(2);
const getArg = (name: string) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

const dataDir = path.resolve(getArg("--data-dir") || process.env.CRICOS_DATA_DIR || DEFAULT_DATA_DIR);
const coursesCsv = path.resolve(getArg("--courses") || path.join(dataDir, "cricos-courses.csv"));
const institutionsCsv = path.resolve(getArg("--institutions") || path.join(dataDir, "cricos-institutions.csv"));
const courseLocationsCsv = path.resolve(getArg("--course-locations") || path.join(dataDir, "cricos-course-locations.csv"));
const batchSize = Math.max(100, Number(getArg("--batch-size") || 1000));
const reset = !args.includes("--no-reset");
const dryRun = args.includes("--dry-run");

type CsvRow = Record<string, string>;

type Institution = {
  sourceId: number;
  providerCode: string;
  name: string;
  tradingName: string | null;
  type: string | null;
  capacity: number | null;
  website: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
};

type LocationInfo = {
  names: Set<string>;
  cities: Set<string>;
  states: Set<string>;
};

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }

  cells.push(cell);
  return cells;
}

async function streamCsv(filePath: string, onRow: (row: CsvRow, lineNumber: number) => Promise<void> | void) {
  const input = createReadStream(filePath, { encoding: "utf8" });
  const reader = createInterface({ input, crlfDelay: Infinity });
  let headers: string[] | null = null;
  let lineNumber = 0;

  for await (const rawLine of reader) {
    if (!rawLine.trim()) continue;
    const cells = parseCsvLine(rawLine);
    if (!headers) {
      headers = cells.map((header) => header.replace(/^\uFEFF/, "").trim());
      continue;
    }

    lineNumber += 1;
    const row: CsvRow = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] || "";
    });
    await onRow(row, lineNumber);
  }

  return lineNumber;
}

function toStringValue(value: unknown, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
}

function shortText(value: unknown, max: number) {
  const text = toStringValue(value);
  if (!text || text === "NULL" || text === "NA") return null;
  return text.length > max ? text.slice(0, max) : text;
}

function longText(value: unknown, max = 6000) {
  return shortText(value, max);
}

function toInt(value: unknown) {
  const text = toStringValue(value).replace(/,/g, "");
  if (!text || text === "NULL" || text === "NA") return null;
  const parsed = Number.parseInt(text, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function toDecimal(value: unknown) {
  const text = toStringValue(value).replace(/[$,]/g, "");
  if (!text || text === "NULL" || text === "NA") return null;
  const parsed = Number(text);
  if (!Number.isFinite(parsed)) return null;
  return new Prisma.Decimal(parsed.toFixed(2));
}

function stableId(parts: string[], modulo: number) {
  let hash = 2166136261;
  const input = parts.join("|").toLowerCase();
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (Math.abs(hash) % modulo) + 1;
}

function uniqueNegativeId(base: number, offset: number, floor: number, used: Set<number>) {
  let id = base - offset;
  while (used.has(id)) id -= 1;
  if (id <= floor) throw new Error(`CRICOS source ID range exhausted around ${id}`);
  used.add(id);
  return id;
}

function makeUniversitySourceId(providerCode: string, used: Set<number>) {
  return uniqueNegativeId(CRICOS_UNIVERSITY_MAX, stableId(["cricos-provider", providerCode], 199000000), CRICOS_UNIVERSITY_MIN, used);
}

function makeProgramSourceId(providerCode: string, courseCode: string, used: Set<number>) {
  return uniqueNegativeId(CRICOS_PROGRAM_MAX, stableId(["cricos-course", providerCode, courseCode], 899000000), CRICOS_PROGRAM_MIN, used);
}

function locationKey(providerCode: string, courseCode: string) {
  return `${providerCode}::${courseCode}`;
}

function joinSet(values: Set<string>, maxItems: number, maxLength: number) {
  const text = Array.from(values).filter(Boolean).slice(0, maxItems).join(", ");
  return text.length > maxLength ? text.slice(0, maxLength) : text || null;
}

function levelFilterId(level: string | null) {
  if (!level) return null;
  const normalized = level.toLowerCase();
  if (normalized.includes("doctor")) return "doctorate";
  if (normalized.includes("master")) return "masters";
  if (normalized.includes("bachelor")) return "bachelors";
  if (normalized.includes("graduate")) return "graduate";
  if (normalized.includes("diploma")) return "diploma";
  if (normalized.includes("certificate")) return "certificate";
  return normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || null;
}

function fieldCode(value: string | null) {
  return value?.split("-")[0]?.trim().slice(0, 40) || null;
}

function isStemField(...values: Array<string | null>) {
  return values
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .match(/information technology|engineering|natural and physical sciences|architecture|agriculture|environment|health|mathematics|statistics|computer|science/) !== null;
}

function tuitionText(tuition: Prisma.Decimal | null, nonTuition: Prisma.Decimal | null, total: Prisma.Decimal | null) {
  const parts: string[] = [];
  if (tuition) parts.push(`Tuition fee: AUD ${tuition.toFixed(2)}`);
  if (nonTuition) parts.push(`Non-tuition fee: AUD ${nonTuition.toFixed(2)}`);
  if (total) parts.push(`Estimated total course cost: AUD ${total.toFixed(2)}`);
  return parts.join("; ") || null;
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

async function loadInstitutions() {
  const institutions = new Map<string, Institution>();
  const usedUniversityIds = new Set<number>();

  await streamCsv(institutionsCsv, (row) => {
    const providerCode = shortText(row["CRICOS Provider Code"], 20);
    const name = shortText(row["Institution Name"], 255);
    if (!providerCode || !name) return;

    institutions.set(providerCode, {
      sourceId: makeUniversitySourceId(providerCode, usedUniversityIds),
      providerCode,
      name,
      tradingName: shortText(row["Trading Name"], 255),
      type: shortText(row["Institution Type"], 120),
      capacity: toInt(row["Institution Capacity"]),
      website: shortText(row.Website, 255),
      city: shortText(row["Postal Address City"], 160),
      state: shortText(row["Postal Address State"], 160),
      postcode: shortText(row["Postal Address Postcode"], 40)
    });
  });

  return institutions;
}

async function loadLocations() {
  const locations = new Map<string, LocationInfo>();
  if (!existsSync(courseLocationsCsv)) return locations;

  await streamCsv(courseLocationsCsv, (row) => {
    const providerCode = shortText(row["CRICOS Provider Code"], 20);
    const courseCode = shortText(row["CRICOS Course Code"], 20);
    if (!providerCode || !courseCode) return;
    const key = locationKey(providerCode, courseCode);
    const current = locations.get(key) || { names: new Set<string>(), cities: new Set<string>(), states: new Set<string>() };
    const name = shortText(row["Location Name"], 255);
    const city = shortText(row["Location City"], 160);
    const state = shortText(row["Location State"], 160);
    if (name) current.names.add(name);
    if (city) current.cities.add(city);
    if (state) current.states.add(state);
    locations.set(key, current);
  });

  return locations;
}

async function main() {
  if (!existsSync(coursesCsv)) throw new Error(`CRICOS courses CSV not found: ${coursesCsv}`);
  if (!existsSync(institutionsCsv)) throw new Error(`CRICOS institutions CSV not found: ${institutionsCsv}`);

  console.log(`Courses: ${coursesCsv}`);
  console.log(`Institutions: ${institutionsCsv}`);
  console.log(`Course locations: ${courseLocationsCsv}`);
  console.log(`Reset CRICOS rows: ${reset ? "yes" : "no"}`);
  console.log(`Batch size: ${batchSize}`);

  if (reset && !dryRun) {
    await db.searchProgramOffering.deleteMany({
      where: { programSourceId: { gt: CRICOS_PROGRAM_MIN, lte: CRICOS_PROGRAM_MAX } }
    });
    await db.searchProgram.deleteMany({
      where: { sourceId: { gt: CRICOS_PROGRAM_MIN, lte: CRICOS_PROGRAM_MAX } }
    });
    await db.searchUniversity.deleteMany({
      where: { sourceId: { gt: CRICOS_UNIVERSITY_MIN, lte: CRICOS_UNIVERSITY_MAX } }
    });
  }

  const institutions = await loadInstitutions();
  const locations = await loadLocations();
  const programRows: Prisma.SearchProgramCreateManyInput[] = [];
  const offeringRows: Prisma.SearchProgramOfferingCreateManyInput[] = [];
  const programCounts = new Map<string, number>();
  const usedProgramIds = new Set<number>();
  let read = 0;
  let skipped = 0;
  let expired = 0;

  await streamCsv(coursesCsv, (row) => {
    read += 1;
    if (toStringValue(row.Expired).toLowerCase() === "yes") {
      expired += 1;
      return;
    }

    const providerCode = shortText(row["CRICOS Provider Code"], 20);
    const courseCode = shortText(row["CRICOS Course Code"], 20);
    const courseName = shortText(row["Course Name"], 500);
    if (!providerCode || !courseCode || !courseName) {
      skipped += 1;
      return;
    }

    const institution = institutions.get(providerCode);
    if (!institution) {
      skipped += 1;
      return;
    }

    const courseLevel = shortText(row["Course Level"], 120);
    const broadField = shortText(row["Field of Education 1 Broad Field"], 120);
    const narrowField = shortText(row["Field of Education 1 Narrow Field"], 120);
    const detailedField = shortText(row["Field of Education 1 Detailed Field"], 120);
    const durationWeeks = toInt(row["Duration (Weeks)"]);
    const tuition = toDecimal(row["Tuition Fee"]);
    const nonTuition = toDecimal(row["Non Tuition Fee"]);
    const totalCost = toDecimal(row["Estimated Total Course Cost"]);
    const courseLocation = locations.get(locationKey(providerCode, courseCode));
    const campus = courseLocation ? joinSet(courseLocation.names, 8, 255) : null;
    const city = courseLocation ? joinSet(courseLocation.cities, 4, 160) : institution.city;
    const state = courseLocation ? joinSet(courseLocation.states, 4, 160) : institution.state;
    const sourceId = makeProgramSourceId(providerCode, courseCode, usedProgramIds);
    const searchText = [
      courseName,
      courseCode,
      institution.name,
      institution.tradingName,
      city,
      state,
      courseLevel,
      broadField,
      narrowField,
      detailedField,
      row["Course Language"],
      row["VET National Code"],
      "CRICOS",
      "Australian Government Department of Education"
    ]
      .filter(Boolean)
      .join(" ")
      .slice(0, 12000);
    const feeText = tuitionText(tuition, nonTuition, totalCost);

    programRows.push({
      sourceId,
      name: courseName,
      concentration: shortText(row["VET National Code"], 255),
      universitySourceId: institution.sourceId,
      universityName: institution.name,
      universityCountry: "Australia",
      universityState: state,
      universityCity: city,
      studyLevel: courseLevel,
      categoryId: fieldCode(broadField),
      subCategoryId: fieldCode(detailedField || narrowField),
      durationMonths: durationWeeks ? Math.ceil((durationWeeks * 7) / 30) : null,
      campus,
      currencyCode: "AUD",
      applicationMode: "CRICOS public register",
      highlights: shortText(`${courseCode}${institution.type ? `, ${institution.type}` : ""}`, 255),
      minTuitionAmount: tuition || totalCost,
      tuitionFeeText: feeText,
      applicationFeeAmount: nonTuition,
      applicationFeeText: nonTuition ? `Non-tuition fee: AUD ${nonTuition.toFixed(2)}` : null,
      applicationFeeCurrency: nonTuition ? "AUD" : null,
      isStem: isStemField(broadField, narrowField, detailedField, courseName),
      entryRequirement: longText(`CRICOS course code: ${courseCode}. Course language: ${shortText(row["Course Language"], 120) || "not supplied"}. Work component: ${shortText(row["Work Component"], 80) || "not supplied"}.`),
      remarks: longText(
        `Source: Australian Government CRICOS export updated 01/05/2026. Provider code: ${providerCode}. This official public register confirms courses available to overseas students on Australian student visas; intake dates and live application deadlines are not supplied in this CSV export.`
      ),
      searchText
    });

    offeringRows.push({
      programSourceId: sourceId,
      universitySourceId: institution.sourceId,
      extractionYear: 2026,
      extractionCountryFilterId: 36,
      extractionCountryFilterLabel: "Australia",
      extractionProgramLevelFilterId: levelFilterId(courseLevel),
      extractionProgramLevelFilterLabel: courseLevel,
      applicationDeadlineDetails: "CRICOS CSV does not provide live application deadlines.",
      intakes: null,
      intakesAndDeadlines: null,
      tuitionFee: feeText,
      amount: tuition || totalCost,
      tuitionFeeCurrency: tuition || totalCost ? "AUD" : null,
      applicationFee: nonTuition ? `AUD ${nonTuition.toFixed(2)}` : null,
      applicationFeeAmount: nonTuition,
      applicationFeeCurrency: nonTuition ? "AUD" : null,
      displayIntakes: Prisma.JsonNull
    });

    programCounts.set(providerCode, (programCounts.get(providerCode) || 0) + 1);
  });

  const universityRows: Prisma.SearchUniversityCreateManyInput[] = Array.from(institutions.values())
    .filter((institution) => programCounts.has(institution.providerCode))
    .map((institution) => {
      const programCount = programCounts.get(institution.providerCode) || 0;
      return {
        sourceId: institution.sourceId,
        name: institution.name,
        country: "Australia",
        state: institution.state,
        city: institution.city,
        countryId: 36,
        currencyCode: "AUD",
        displayOrder: institution.capacity,
        programCount,
        offeringCount: programCount
      };
    });

  await insertBatches("cricos universities", universityRows, (chunk) =>
    db.searchUniversity.createMany({ data: chunk, skipDuplicates: true })
  );
  await insertBatches("cricos programs", programRows, (chunk) =>
    db.searchProgram.createMany({ data: chunk, skipDuplicates: true })
  );
  await insertBatches("cricos offerings", offeringRows, (chunk) =>
    db.searchProgramOffering.createMany({ data: chunk, skipDuplicates: true })
  );

  const countsAfter = dryRun
    ? {
        universities: universityRows.length,
        programs: programRows.length,
        offerings: offeringRows.length
      }
    : {
        universities: await db.searchUniversity.count(),
        programs: await db.searchProgram.count(),
        offerings: await db.searchProgramOffering.count()
      };

  console.log(
    `CRICOS import complete: ${read.toLocaleString("en-IN")} course rows read, ${programRows.length.toLocaleString("en-IN")} active programs, ${universityRows.length.toLocaleString("en-IN")} universities, ${offeringRows.length.toLocaleString("en-IN")} offerings, ${expired.toLocaleString("en-IN")} expired skipped, ${skipped.toLocaleString("en-IN")} invalid skipped.`
  );
  console.log(
    `Search totals now: ${countsAfter.universities.toLocaleString("en-IN")} universities, ${countsAfter.programs.toLocaleString("en-IN")} programs, ${countsAfter.offerings.toLocaleString("en-IN")} offerings.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
