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
  "college_scorecard_20260323"
);

const args = process.argv.slice(2);
const getArg = (name: string) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

const institutionCsv = path.resolve(
  getArg("--institutions") ||
    path.join(DEFAULT_DATA_DIR, "institution", "Most-Recent-Cohorts-Institution.csv")
);
const fieldCsv = path.resolve(
  getArg("--fields") ||
    path.join(DEFAULT_DATA_DIR, "field", "Most-Recent-Cohorts-Field-of-Study.csv")
);
const batchSize = Math.max(100, Number(getArg("--batch-size") || 1000));
const reset = !args.includes("--no-reset");
const dryRun = args.includes("--dry-run");
const SCORECARD_PROGRAM_MIN = -3000000;
const SCORECARD_PROGRAM_MAX = -2000000;
const SCORECARD_UNIVERSITY_MIN = -700000000;

type CsvRow = Record<string, string>;

type Institution = {
  unitId: number;
  name: string;
  city: string | null;
  state: string | null;
  url: string | null;
  tuitionInState: Prisma.Decimal | null;
  tuitionOutState: Prisma.Decimal | null;
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
  if (!text || text === "NULL" || text === "NA" || text === "PS") return null;
  return text.length > max ? text.slice(0, max) : text;
}

function longText(value: unknown, max = 6000) {
  return shortText(value, max);
}

function toInt(value: unknown) {
  const text = toStringValue(value);
  if (!text || text === "NULL" || text === "NA" || text === "PS") return null;
  const parsed = Number.parseInt(text, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function toDecimal(value: unknown) {
  const text = toStringValue(value).replace(/,/g, "");
  if (!text || text === "NULL" || text === "NA" || text === "PS") return null;
  const parsed = Number(text);
  if (!Number.isFinite(parsed)) return null;
  return new Prisma.Decimal(parsed.toFixed(2));
}

function cleanProgramTitle(value: string) {
  return value.replace(/\.+$/, "").trim();
}

function makeSourceProgramId(lineNumber: number) {
  return -2000000 - lineNumber;
}

function makeUniversitySourceId(unitId: number) {
  return -unitId;
}

function tuitionText(amount: Prisma.Decimal | null) {
  return amount ? `Estimated annual tuition: USD ${amount.toFixed(0)}` : null;
}

async function loadInstitutions() {
  const institutions = new Map<number, Institution>();
  await streamCsv(institutionCsv, (row) => {
    const unitId = toInt(row.UNITID);
    const name = shortText(row.INSTNM, 255);
    if (!unitId || !name) return;

    institutions.set(unitId, {
      unitId,
      name,
      city: shortText(row.CITY, 160),
      state: shortText(row.STABBR, 160),
      url: shortText(row.INSTURL, 255),
      tuitionInState: toDecimal(row.TUITIONFEE_IN),
      tuitionOutState: toDecimal(row.TUITIONFEE_OUT)
    });
  });
  return institutions;
}

async function buildProgramCounts() {
  const counts = new Map<number, number>();
  await streamCsv(fieldCsv, (row) => {
    const unitId = toInt(row.UNITID);
    const cip = shortText(row.CIPCODE, 20);
    const credential = shortText(row.CREDDESC, 120);
    if (!unitId || !cip || !credential) return;
    counts.set(unitId, (counts.get(unitId) || 0) + 1);
  });
  return counts;
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
  if (!existsSync(institutionCsv)) throw new Error(`Institution CSV not found: ${institutionCsv}`);
  if (!existsSync(fieldCsv)) throw new Error(`Field-of-study CSV not found: ${fieldCsv}`);

  console.log(`Institutions: ${institutionCsv}`);
  console.log(`Fields: ${fieldCsv}`);
  console.log(`Reset College Scorecard rows: ${reset ? "yes" : "no"}`);
  console.log(`Batch size: ${batchSize}`);

  if (reset && !dryRun) {
    await db.searchProgramOffering.deleteMany({
      where: { programSourceId: { gt: SCORECARD_PROGRAM_MIN, lt: SCORECARD_PROGRAM_MAX } }
    });
    await db.searchProgram.deleteMany({
      where: { sourceId: { gt: SCORECARD_PROGRAM_MIN, lt: SCORECARD_PROGRAM_MAX } }
    });
    await db.searchUniversity.deleteMany({
      where: { sourceId: { gt: SCORECARD_UNIVERSITY_MIN, lt: 0 } }
    });
  }

  const institutions = await loadInstitutions();
  const counts = await buildProgramCounts();

  const universityRows: Prisma.SearchUniversityCreateManyInput[] = Array.from(counts.entries()).flatMap(
    ([unitId, programCount]) => {
      const institution = institutions.get(unitId);
      if (!institution) return [];
      return {
        sourceId: makeUniversitySourceId(unitId),
        name: institution.name,
        country: "United States of America",
        state: institution.state,
        city: institution.city,
        countryId: 840,
        currencyCode: "USD",
        programCount,
        offeringCount: programCount
      };
    }
  );

  await insertBatches("scorecard universities", universityRows, (chunk) =>
    db.searchUniversity.createMany({ data: chunk, skipDuplicates: true })
  );

  let programBatch: Prisma.SearchProgramCreateManyInput[] = [];
  let offeringBatch: Prisma.SearchProgramOfferingCreateManyInput[] = [];
  let programsRead = 0;
  let programsWritten = 0;
  let offeringsWritten = 0;
  let skipped = 0;

  async function flush() {
    if (!programBatch.length) return;
    if (!dryRun) {
      await db.searchProgram.createMany({ data: programBatch, skipDuplicates: true });
      await db.searchProgramOffering.createMany({ data: offeringBatch, skipDuplicates: true });
    }
    programsWritten += programBatch.length;
    offeringsWritten += offeringBatch.length;
    programBatch = [];
    offeringBatch = [];
    if (programsWritten % 25000 < batchSize) {
      console.log(`scorecard programs: ${programsWritten.toLocaleString("en-IN")} written`);
    }
  }

  await streamCsv(fieldCsv, async (row, lineNumber) => {
    const unitId = toInt(row.UNITID);
    const institution = unitId ? institutions.get(unitId) : null;
    const cipDescription = shortText(row.CIPDESC, 255);
    const credentialDescription = shortText(row.CREDDESC, 120);
    const cipCode = shortText(row.CIPCODE, 20);
    if (!unitId || !institution || !cipDescription || !credentialDescription || !cipCode) {
      skipped += 1;
      return;
    }

    programsRead += 1;
    const sourceId = makeSourceProgramId(lineNumber);
    const universitySourceId = makeUniversitySourceId(unitId);
    const tuition = institution.tuitionOutState || institution.tuitionInState;
    const programName = `${credentialDescription} in ${cleanProgramTitle(cipDescription)}`;
    const searchText = [
      programName,
      cipDescription,
      credentialDescription,
      institution.name,
      institution.city,
      institution.state,
      "College Scorecard",
      "U.S. Department of Education"
    ]
      .filter(Boolean)
      .join(" ")
      .slice(0, 12000);

    programBatch.push({
      sourceId,
      name: programName.slice(0, 500),
      universitySourceId,
      universityName: institution.name,
      universityCountry: "United States of America",
      universityState: institution.state,
      universityCity: institution.city,
      studyLevel: credentialDescription,
      studyLevelId: toInt(row.CREDLEV),
      categoryId: cipCode.slice(0, 2),
      subCategoryId: cipCode,
      currencyCode: "USD",
      applicationMode: "Public federal dataset",
      highlights: "College Scorecard",
      minTuitionAmount: tuition,
      tuitionFeeText: tuitionText(tuition),
      remarks: longText(
        `Source: U.S. Department of Education College Scorecard field-of-study data updated March 23, 2026. Institution URL: ${institution.url || "not provided"}. Federal field-of-study rows are useful for discovery and outcomes research, but this source does not provide live admission deadlines, intakes, or agent-specific eligibility rules.`
      ),
      searchText
    });

    offeringBatch.push({
      programSourceId: sourceId,
      universitySourceId,
      extractionYear: 2026,
      extractionCountryFilterId: 840,
      extractionCountryFilterLabel: "United States of America",
      tuitionFee: tuitionText(tuition),
      amount: tuition,
      tuitionFeeCurrency: "USD",
      displayIntakes: Prisma.JsonNull
    });

    if (programBatch.length >= batchSize) await flush();
  });

  await flush();

  const countsAfter = dryRun
    ? {
        universities: universityRows.length,
        programs: programsWritten,
        offerings: offeringsWritten
      }
    : {
        universities: await db.searchUniversity.count(),
        programs: await db.searchProgram.count(),
        offerings: await db.searchProgramOffering.count()
      };

  console.log(
    `College Scorecard import complete: ${programsRead.toLocaleString("en-IN")} rows read, ${programsWritten.toLocaleString("en-IN")} programs, ${offeringsWritten.toLocaleString("en-IN")} offerings, ${skipped.toLocaleString("en-IN")} skipped.`
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
