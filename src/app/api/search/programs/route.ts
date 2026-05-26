import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { withSecurityHeaders } from "@/lib/security";

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 36;
const DEFAULT_SEARCH_YEAR = 2026;
const FACET_CACHE_TTL_MS = 5 * 60 * 1000;
const INTAKES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Spring",
  "Summer",
  "Fall",
  "Winter"
];

type FacetRow = { value: string | number | null; count: bigint | number | null };
type CountRow = { count: bigint | number | null };
type QuickCountRow = {
  scholarship: bigint | number | null;
  feeWaiver: bigint | number | null;
  stem: bigint | number | null;
  online: bigint | number | null;
  internship: bigint | number | null;
  englishWaiver: bigint | number | null;
  esl: bigint | number | null;
};

type CachedFacets = Awaited<ReturnType<typeof buildFacets>>;

let facetCache: { expiresAt: number; value: CachedFacets } | null = null;

type ProgramQueryRow = {
  id: string;
  sourceId: number;
  name: string;
  universitySourceId: number;
  universityName: string;
  universityCountry: string | null;
  universityState: string | null;
  universityCity: string | null;
  studyLevel: string | null;
  durationMonths: number | null;
  campus: string | null;
  currencyCode: string | null;
  intakesText: string | null;
  minTuitionAmount: Prisma.Decimal | number | string | null;
  tuitionFeeText: string | null;
  applicationFeeAmount: Prisma.Decimal | number | string | null;
  applicationFeeText: string | null;
  applicationFeeCurrency: string | null;
  appFeeWaiverAvailable: boolean | number;
  scholarshipAvailable: boolean | number;
  internshipAvailable: boolean | number;
  isOnline: boolean | number;
  isStem: boolean | number;
  withoutEnglishProficiency: boolean | number;
  withoutMaths: boolean | number;
  eslAvailable: boolean | number;
  elpAvailable: boolean | number;
  isMoiWaiver: boolean | number;
  pteRequired: boolean | number;
  toeflRequired: boolean | number;
  ieltsRequired: boolean | number;
  detRequired: boolean | number;
  satRequired: boolean | number;
  actRequired: boolean | number;
  greRequired: boolean | number;
  gmatRequired: boolean | number;
  pteScore: string | null;
  toeflScore: string | null;
  ieltsOverall: string | null;
  detScore: string | null;
  satScore: string | null;
  actScore: string | null;
  greScore: string | null;
  gmatScore: string | null;
  entryRequirement: string | null;
  scholarshipDetail: string | null;
  remarks: string | null;
  usNewsRanking: number | null;
  qsRanking: number | null;
  webometricsNationalRank: number | null;
  webometricsWorldRank: number | null;
};

function numberParam(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function decimalParam(value: string | null) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function normalizeText(value: string | null) {
  return (value || "").trim();
}

const SEARCH_ALIASES: Record<string, string[]> = {
  btech: ["b tech", "b.tech", "bachelor of technology", "bachelor technology", "engineering"],
  "b.tech": ["b tech", "btech", "bachelor of technology", "bachelor technology", "engineering"],
  mtech: ["m tech", "m.tech", "master of technology", "master technology", "engineering"],
  "m.tech": ["m tech", "mtech", "master of technology", "master technology", "engineering"],
  mba: ["master of business administration", "business administration", "management"],
  bba: ["bachelor of business administration", "business administration", "management"],
  cs: ["computer science", "computing", "software"],
  cse: ["computer science", "computer science engineering", "software engineering"],
  ai: ["artificial intelligence", "machine learning"],
  ml: ["machine learning", "artificial intelligence"],
  it: ["information technology", "computing"],
  nursing: ["nursing"],
  medical: ["medicine", "health science", "healthcare"],
  law: ["law", "legal studies"],
  scholarship: ["scholarship", "financial aid", "funding"],
  waiver: ["waiver", "fee waiver", "english waiver", "moi waiver"],
  ielts: ["ielts", "english proficiency"],
  toefl: ["toefl", "english proficiency"],
  pte: ["pte", "english proficiency"]
};

const SEARCH_STOP_WORDS = new Set([
  "a",
  "about",
  "after",
  "an",
  "and",
  "at",
  "available",
  "best",
  "between",
  "compare",
  "find",
  "for",
  "from",
  "give",
  "in",
  "list",
  "me",
  "near",
  "of",
  "on",
  "please",
  "recommend",
  "show",
  "suggest",
  "tell",
  "the",
  "to",
  "top",
  "versus",
  "vs",
  "with"
]);
const SEARCH_GENERIC_WORDS = new Set(["college", "colleges", "course", "courses", "degree", "degrees", "program", "programs", "school", "schools", "university", "universities"]);
const INVALID_COUNTRIES = ["Search and Selection (Non-Tie-up)"];
const COUNTRY_QUERY_ALIASES: Array<[string, string[]]> = [
  ["United States of America", ["united states of america", "united states", "usa", "u.s.a", "u.s.", "america", "us"]],
  ["United Kingdom", ["united kingdom", "uk", "u.k.", "england", "britain", "great britain"]],
  ["United Arab Emirates", ["united arab emirates", "uae", "u.a.e.", "dubai"]],
  ["South Korea", ["south korea", "korea"]],
  ["New Zealand", ["new zealand"]],
  ["Sri Lanka", ["sri lanka"]],
  ["Australia", ["australia"]],
  ["Canada", ["canada"]],
  ["Ireland", ["ireland"]],
  ["Malaysia", ["malaysia"]],
  ["Germany", ["germany"]],
  ["Singapore", ["singapore"]],
  ["France", ["france"]],
  ["Hungary", ["hungary"]],
  ["Finland", ["finland"]],
  ["Netherlands", ["netherlands", "holland"]],
  ["Italy", ["italy"]],
  ["Turkey", ["turkey"]],
  ["Spain", ["spain"]],
  ["India", ["india"]],
  ["Malta", ["malta"]],
  ["Switzerland", ["switzerland"]],
  ["Sweden", ["sweden"]],
  ["Cyprus", ["cyprus"]],
  ["China", ["china"]],
  ["Lithuania", ["lithuania"]],
  ["Vietnam", ["vietnam"]],
  ["Austria", ["austria"]],
  ["Georgia", ["georgia"]],
  ["Mauritius", ["mauritius"]],
  ["Poland", ["poland"]],
  ["Thailand", ["thailand"]],
  ["Belgium", ["belgium"]],
  ["Denmark", ["denmark"]],
  ["Greece", ["greece"]],
  ["Kazakhstan", ["kazakhstan"]],
  ["Japan", ["japan"]],
  ["Latvia", ["latvia"]],
  ["Croatia", ["croatia"]],
  ["Monaco", ["monaco"]],
  ["Saudi Arabia", ["saudi arabia", "saudi"]],
  ["Bahrain", ["bahrain"]],
  ["Indonesia", ["indonesia"]],
  ["Luxembourg", ["luxembourg"]],
  ["Russia", ["russia"]],
  ["Slovenia", ["slovenia"]]
];

function inferCountryFromQuery(query: string) {
  const lower = ` ${query.toLowerCase().replace(/[^a-z0-9.]+/g, " ")} `;
  for (const [country, aliases] of COUNTRY_QUERY_ALIASES) {
    if (aliases.some((alias) => lower.includes(` ${alias.toLowerCase()} `))) return country;
  }
  return "";
}

function canonicalCountry(value: string) {
  const normalized = value.toLowerCase().replace(/[^a-z0-9.]+/g, " ").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  for (const [country, aliases] of COUNTRY_QUERY_ALIASES) {
    if (country.toLowerCase() === normalized || aliases.some((alias) => alias.toLowerCase() === normalized)) {
      return country;
    }
  }
  return value;
}

function tokenizeQuery(query: string) {
  return query
    .toLowerCase()
    .replace(/\bb[\s.-]*tech\b/g, "btech")
    .replace(/\bm[\s.-]*tech\b/g, "mtech")
    .replace(/[^a-z0-9.+\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean)
    .slice(0, 10);
}

function expandSearchQuery(query: string, ignoredTokens = new Set<string>()) {
  const clean = normalizeText(query);
  const rawTokens = tokenizeQuery(clean).filter((token) => !SEARCH_STOP_WORDS.has(token) && !ignoredTokens.has(token));
  const tokens = rawTokens.filter((token) => token.length > 1);
  const meaningfulTokens = tokens.filter((token) => !(tokens.length > 1 && SEARCH_GENERIC_WORDS.has(token)));
  const groupTokens = meaningfulTokens.length ? meaningfulTokens : tokens;
  const phrases = new Set<string>();
  if (clean) phrases.add(clean);
  for (const token of tokens) {
    phrases.add(token);
    for (const alias of SEARCH_ALIASES[token] || []) phrases.add(alias);
  }
  const compact = tokens.join("");
  for (const alias of SEARCH_ALIASES[compact] || []) phrases.add(alias);
  const matchText = Array.from(phrases)
    .join(" ")
    .replace(/[+\-<>()~*\"@]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
  const groups = groupTokens
    .map((token) => Array.from(new Set([token, ...(SEARCH_ALIASES[token] || [])])).filter((phrase) => phrase.length >= 2).slice(0, 8))
    .filter((group) => group.length);
  return { clean, lower: clean.toLowerCase(), phrases: Array.from(phrases).slice(0, 24), matchText, groups };
}

function addIgnoredWords(target: Set<string>, words: string[]) {
  for (const word of words) {
    for (const token of tokenizeQuery(word)) target.add(token);
  }
}

function queryIntentFromText(query: string) {
  const lower = ` ${query.toLowerCase().replace(/[^a-z0-9.]+/g, " ")} `;
  const ignoredTokens = new Set<string>();
  const clauses: Prisma.Sql[] = [];
  const inferredCountry = inferCountryFromQuery(query);

  if (inferredCountry) {
    const aliases = COUNTRY_QUERY_ALIASES.find(([country]) => country === inferredCountry)?.[1] || [inferredCountry];
    addIgnoredWords(ignoredTokens, [inferredCountry, ...aliases]);
  }

  if (/\bscholarships?\b|\bfinancial aid\b|\bfunding\b/.test(lower)) {
    clauses.push(Prisma.sql`sp.scholarshipAvailable = 1`);
    addIgnoredWords(ignoredTokens, ["scholarship", "scholarships", "financial aid", "funding"]);
  }

  if (/\bapplication fee waiver\b|\bfee waiver\b|\bno application fee\b/.test(lower)) {
    clauses.push(Prisma.sql`sp.appFeeWaiverAvailable = 1`);
    addIgnoredWords(ignoredTokens, ["application fee waiver", "fee waiver", "no application fee"]);
  }

  if (/\b(english|ielts|moi)\s+waiver\b|\bwaiver\s+(for\s+)?(english|ielts|moi)\b|\bwithout\s+(english|ielts)\b|\bno\s+ielts\b/.test(lower)) {
    clauses.push(Prisma.sql`(sp.withoutEnglishProficiency = 1 OR sp.isMoiWaiver = 1)`);
    addIgnoredWords(ignoredTokens, ["english waiver", "ielts waiver", "moi waiver", "without english", "without ielts", "no ielts", "waiver"]);
  } else if (/\bielts\b/.test(lower)) {
    clauses.push(Prisma.sql`sp.ieltsRequired = 1`);
    addIgnoredWords(ignoredTokens, ["ielts"]);
  }

  if (/\btoefl\b/.test(lower)) {
    clauses.push(Prisma.sql`sp.toeflRequired = 1`);
    addIgnoredWords(ignoredTokens, ["toefl"]);
  }

  if (/\bpte\b/.test(lower)) {
    clauses.push(Prisma.sql`sp.pteRequired = 1`);
    addIgnoredWords(ignoredTokens, ["pte"]);
  }

  return { inferredCountry, clauses, ignoredTokens };
}

function searchWhereSql(query: string, ignoredTokens = new Set<string>()) {
  const expanded = expandSearchQuery(query, ignoredTokens);
  if (!expanded.clean) return null;
  const exact = `%${expanded.clean}%`;
  const exactPhrase = Prisma.sql`sp.name LIKE ${exact} OR sp.universityName LIKE ${exact} OR sp.universityCountry LIKE ${exact} OR sp.searchText LIKE ${exact}`;
  const groupedClauses = expanded.groups.map((group) => {
    const alternatives = group.map((phrase) => {
      const like = `%${phrase}%`;
      return Prisma.sql`sp.name LIKE ${like} OR sp.universityName LIKE ${like} OR sp.universityCountry LIKE ${like} OR sp.searchText LIKE ${like}`;
    });
    return Prisma.sql`(${Prisma.join(alternatives.map((clause) => Prisma.sql`(${clause})`), " OR ")})`;
  });

  const fulltext = expanded.matchText
    ? Prisma.sql`MATCH(sp.name, sp.universityName, sp.searchText) AGAINST (${expanded.matchText} IN NATURAL LANGUAGE MODE)`
    : Prisma.sql`0`;

  if (!groupedClauses.length) return null;
  return Prisma.sql`(${exactPhrase} OR (${Prisma.join(groupedClauses, " AND ")}))`;
}

function toNumber(value: unknown) {
  if (typeof value === "bigint") return Number(value);
  if (value instanceof Prisma.Decimal) return Number(value.toString());
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function bool(value: unknown) {
  return value === true || value === 1 || value === "1";
}

function cleanList(value: string | null) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function requirementFilters(params: URLSearchParams) {
  const requirements = new Set(params.getAll("requirement"));
  const clauses: Prisma.Sql[] = [];
  if (requirements.has("ielts")) clauses.push(Prisma.sql`sp.ieltsRequired = 1`);
  if (requirements.has("toefl")) clauses.push(Prisma.sql`sp.toeflRequired = 1`);
  if (requirements.has("pte")) clauses.push(Prisma.sql`sp.pteRequired = 1`);
  if (requirements.has("det")) clauses.push(Prisma.sql`sp.detRequired = 1`);
  if (requirements.has("gre")) clauses.push(Prisma.sql`sp.greRequired = 1`);
  if (requirements.has("gmat")) clauses.push(Prisma.sql`sp.gmatRequired = 1`);
  if (requirements.has("without-english")) clauses.push(Prisma.sql`(sp.withoutEnglishProficiency = 1 OR sp.isMoiWaiver = 1)`);
  if (requirements.has("without-maths")) clauses.push(Prisma.sql`sp.withoutMaths = 1`);
  return clauses;
}

function buildWhere(params: URLSearchParams) {
  const clauses: Prisma.Sql[] = [Prisma.sql`1 = 1`];
  const q = normalizeText(params.get("q"));
  const country = canonicalCountry(normalizeText(params.get("country")));
  const queryIntent = queryIntentFromText(q);
  const inferredCountry = country ? "" : queryIntent.inferredCountry;
  const studyLevel = normalizeText(params.get("studyLevel"));
  const university = normalizeText(params.get("university"));
  const intake = normalizeText(params.get("intake"));
  const quick = normalizeText(params.get("quick"));
  const year = numberParam(params.get("year"), 0, 0, 9999);
  const maxTuition = decimalParam(params.get("maxTuition"));

  if (q) {
    const searchWhere = searchWhereSql(q, queryIntent.ignoredTokens);
    if (searchWhere) clauses.push(searchWhere);
  }
  if (country) clauses.push(Prisma.sql`sp.universityCountry = ${country}`);
  else if (inferredCountry) clauses.push(Prisma.sql`sp.universityCountry = ${inferredCountry}`);
  clauses.push(...queryIntent.clauses);
  if (studyLevel) clauses.push(Prisma.sql`sp.studyLevel = ${studyLevel}`);
  if (university) clauses.push(Prisma.sql`sp.universityName = ${university}`);
  if (maxTuition !== null) clauses.push(Prisma.sql`sp.minTuitionAmount IS NOT NULL AND sp.minTuitionAmount <= ${maxTuition}`);
  if (year && year !== DEFAULT_SEARCH_YEAR) {
    clauses.push(Prisma.sql`EXISTS (
      SELECT 1 FROM SearchProgramOffering offer_year
      WHERE offer_year.programSourceId = sp.sourceId AND offer_year.extractionYear = ${year}
    )`);
  }
  if (intake) {
    clauses.push(Prisma.sql`EXISTS (
      SELECT 1 FROM SearchProgramOffering offer_intake
      WHERE offer_intake.programSourceId = sp.sourceId AND offer_intake.intakes LIKE ${`%${intake}%`}
    )`);
  }

  switch (quick) {
    case "scholarship":
      clauses.push(Prisma.sql`sp.scholarshipAvailable = 1`);
      break;
    case "fee-waiver":
      clauses.push(Prisma.sql`sp.appFeeWaiverAvailable = 1`);
      break;
    case "stem":
      clauses.push(Prisma.sql`sp.isStem = 1`);
      break;
    case "online":
      clauses.push(Prisma.sql`sp.isOnline = 1`);
      break;
    case "internship":
      clauses.push(Prisma.sql`sp.internshipAvailable = 1`);
      break;
    case "english-waiver":
      clauses.push(Prisma.sql`(sp.withoutEnglishProficiency = 1 OR sp.isMoiWaiver = 1)`);
      break;
    case "esl":
      clauses.push(Prisma.sql`(sp.eslAvailable = 1 OR sp.elpAvailable = 1)`);
      break;
    default:
      break;
  }

  clauses.push(...requirementFilters(params));
  return Prisma.join(clauses, " AND ");
}

function orderSql(sort: string | null, query: string | null) {
  const expanded = expandSearchQuery(query || "");
  if (expanded.clean && (!sort || sort === "featured")) {
    const exact = expanded.lower;
    const likeExact = `%${expanded.clean}%`;
    const firstPhrase = expanded.phrases.find((phrase) => phrase.length >= 2) || expanded.clean;
    const likeFirst = `%${firstPhrase}%`;
    const relevance = expanded.matchText
      ? Prisma.sql`MATCH(sp.name, sp.universityName, sp.searchText) AGAINST (${expanded.matchText} IN NATURAL LANGUAGE MODE)`
      : Prisma.sql`0`;
    return Prisma.sql`
      CASE
        WHEN LOWER(sp.name) = ${exact} THEN 0
        WHEN LOWER(sp.universityName) = ${exact} THEN 1
        WHEN sp.name LIKE ${likeExact} THEN 2
        WHEN sp.universityName LIKE ${likeExact} THEN 3
        WHEN sp.name LIKE ${likeFirst} THEN 4
        WHEN sp.universityName LIKE ${likeFirst} THEN 5
        ELSE 9
      END ASC,
      ${relevance} DESC,
      sp.qsRanking IS NULL ASC,
      sp.qsRanking ASC,
      sp.name ASC
    `;
  }
  switch (sort) {
    case "tuition_asc":
      return Prisma.sql`sp.minTuitionAmount IS NULL ASC, sp.minTuitionAmount ASC, sp.name ASC`;
    case "tuition_desc":
      return Prisma.sql`sp.minTuitionAmount IS NULL ASC, sp.minTuitionAmount DESC, sp.name ASC`;
    case "name":
      return Prisma.sql`sp.name ASC`;
    case "ranking":
      return Prisma.sql`sp.qsRanking IS NULL ASC, sp.qsRanking ASC, sp.usNewsRanking IS NULL ASC, sp.usNewsRanking ASC`;
    default:
      return Prisma.sql`sp.sourceId ASC`;
  }
}

async function buildFacets() {
  const [countries, levels, universities, years, quickCounts] = await Promise.all([
    db.$queryRaw<FacetRow[]>`
      SELECT universityCountry AS value, COUNT(*) AS count
      FROM SearchProgram
      WHERE universityCountry IS NOT NULL AND universityCountry <> '' AND universityCountry NOT IN (${Prisma.join(INVALID_COUNTRIES)})
      GROUP BY universityCountry
      ORDER BY count DESC
      LIMIT 250
    `,
    db.$queryRaw<FacetRow[]>`
      SELECT studyLevel AS value, COUNT(*) AS count
      FROM SearchProgram
      WHERE studyLevel IS NOT NULL AND studyLevel <> ''
      GROUP BY studyLevel
      ORDER BY count DESC
      LIMIT 30
    `,
    db.$queryRaw<FacetRow[]>`
      SELECT universityName AS value, COUNT(*) AS count
      FROM SearchProgram
      WHERE universityName IS NOT NULL AND universityName <> ''
      GROUP BY universityName
      ORDER BY count DESC
      LIMIT 60
    `,
    db.$queryRaw<FacetRow[]>`
      SELECT extractionYear AS value, COUNT(*) AS count
      FROM SearchProgramOffering
      GROUP BY extractionYear
      ORDER BY extractionYear ASC
    `,
    db.$queryRaw<QuickCountRow[]>`
      SELECT
        SUM(scholarshipAvailable = 1) AS scholarship,
        SUM(appFeeWaiverAvailable = 1) AS feeWaiver,
        SUM(isStem = 1) AS stem,
        SUM(isOnline = 1) AS online,
        SUM(internshipAvailable = 1) AS internship,
        SUM(withoutEnglishProficiency = 1 OR isMoiWaiver = 1) AS englishWaiver,
        SUM(eslAvailable = 1 OR elpAvailable = 1) AS esl
      FROM SearchProgram
    `
  ]);

  const mapFacet = (rows: FacetRow[]) =>
    rows
      .filter((row) => row.value !== null && row.value !== "")
      .map((row) => ({ value: String(row.value), count: toNumber(row.count) || 0 }));

  const quick = quickCounts[0] || {};
  return {
    countries: mapFacet(countries),
    studyLevels: mapFacet(levels),
    universities: mapFacet(universities),
    years: mapFacet(years),
    intakes: INTAKES.map((value) => ({ value })),
    quick: {
      scholarship: toNumber(quick.scholarship) || 0,
      feeWaiver: toNumber(quick.feeWaiver) || 0,
      stem: toNumber(quick.stem) || 0,
      online: toNumber(quick.online) || 0,
      internship: toNumber(quick.internship) || 0,
      englishWaiver: toNumber(quick.englishWaiver) || 0,
      esl: toNumber(quick.esl) || 0
    }
  };
}

async function getFacets() {
  const now = Date.now();
  if (facetCache && facetCache.expiresAt > now) return facetCache.value;
  const value = await buildFacets();
  facetCache = { value, expiresAt: now + FACET_CACHE_TTL_MS };
  return value;
}

function serializeProgram(row: ProgramQueryRow, offerings: any[]) {
  const dataSource =
    row.sourceId > 0 ? "CourseFinder" : row.sourceId <= -900000000 && row.sourceId > -1800000000 ? "CRICOS" : "College Scorecard";

  return {
    id: row.id,
    sourceId: row.sourceId,
    dataSource,
    name: row.name,
    university: {
      sourceId: row.universitySourceId,
      name: row.universityName,
      country: row.universityCountry,
      state: row.universityState,
      city: row.universityCity
    },
    studyLevel: row.studyLevel,
    durationMonths: row.durationMonths,
    campus: row.campus,
    currencyCode: row.currencyCode,
    intakes: cleanList(row.intakesText),
    tuition: {
      amount: toNumber(row.minTuitionAmount),
      text: row.tuitionFeeText
    },
    applicationFee: {
      amount: toNumber(row.applicationFeeAmount),
      text: row.applicationFeeText,
      currency: row.applicationFeeCurrency,
      waived: bool(row.appFeeWaiverAvailable)
    },
    flags: {
      scholarship: bool(row.scholarshipAvailable),
      internship: bool(row.internshipAvailable),
      online: bool(row.isOnline),
      stem: bool(row.isStem),
      englishWaiver: bool(row.withoutEnglishProficiency) || bool(row.isMoiWaiver),
      withoutMaths: bool(row.withoutMaths),
      esl: bool(row.eslAvailable) || bool(row.elpAvailable)
    },
    requirements: {
      pte: bool(row.pteRequired) ? row.pteScore : null,
      toefl: bool(row.toeflRequired) ? row.toeflScore : null,
      ielts: bool(row.ieltsRequired) ? row.ieltsOverall : null,
      det: bool(row.detRequired) ? row.detScore : null,
      sat: bool(row.satRequired) ? row.satScore : null,
      act: bool(row.actRequired) ? row.actScore : null,
      gre: bool(row.greRequired) ? row.greScore : null,
      gmat: bool(row.gmatRequired) ? row.gmatScore : null
    },
    entryRequirement: row.entryRequirement,
    scholarshipDetail: row.scholarshipDetail,
    remarks: row.remarks,
    rankings: {
      usNews: row.usNewsRanking,
      qs: row.qsRanking,
      webometricsNational: row.webometricsNationalRank,
      webometricsWorld: row.webometricsWorldRank
    },
    offerings: offerings.map((offering) => ({
      year: offering.extractionYear,
      searchCountry: offering.extractionCountryFilterLabel,
      intakes: cleanList(offering.intakes),
      deadline: offering.applicationDeadline,
      tuition: {
        amount: toNumber(offering.amount),
        text: offering.tuitionFee,
        currency: offering.tuitionFeeCurrency
      },
      applicationFee: {
        amount: toNumber(offering.applicationFeeAmount),
        text: offering.applicationFee,
        currency: offering.applicationFeeCurrency
      }
    }))
  };
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const page = numberParam(params.get("page"), 1, 1, 10000);
  const pageSize = numberParam(params.get("pageSize"), DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
  const offset = (page - 1) * pageSize;
  const where = buildWhere(params);
  const sort = orderSql(params.get("sort"), params.get("q"));

  try {
    const [programs, countRows, facets] = await Promise.all([
      db.$queryRaw<ProgramQueryRow[]>(Prisma.sql`
        SELECT
          sp.id,
          sp.sourceId,
          sp.name,
          sp.universitySourceId,
          sp.universityName,
          sp.universityCountry,
          sp.universityState,
          sp.universityCity,
          sp.studyLevel,
          sp.durationMonths,
          sp.campus,
          sp.currencyCode,
          sp.intakesText,
          sp.minTuitionAmount,
          sp.tuitionFeeText,
          sp.applicationFeeAmount,
          sp.applicationFeeText,
          sp.applicationFeeCurrency,
          sp.appFeeWaiverAvailable,
          sp.scholarshipAvailable,
          sp.internshipAvailable,
          sp.isOnline,
          sp.isStem,
          sp.withoutEnglishProficiency,
          sp.withoutMaths,
          sp.eslAvailable,
          sp.elpAvailable,
          sp.isMoiWaiver,
          sp.pteRequired,
          sp.toeflRequired,
          sp.ieltsRequired,
          sp.detRequired,
          sp.satRequired,
          sp.actRequired,
          sp.greRequired,
          sp.gmatRequired,
          sp.pteScore,
          sp.toeflScore,
          sp.ieltsOverall,
          sp.detScore,
          sp.satScore,
          sp.actScore,
          sp.greScore,
          sp.gmatScore,
          sp.entryRequirement,
          sp.scholarshipDetail,
          sp.remarks,
          sp.usNewsRanking,
          sp.qsRanking,
          sp.webometricsNationalRank,
          sp.webometricsWorldRank
        FROM SearchProgram sp
        WHERE ${where}
        ORDER BY ${sort}
        LIMIT ${pageSize} OFFSET ${offset}
      `),
      db.$queryRaw<CountRow[]>(Prisma.sql`
        SELECT COUNT(*) AS count
        FROM SearchProgram sp
        WHERE ${where}
      `),
      getFacets()
    ]);

    const sourceIds = programs.map((program) => program.sourceId);
    const selectedYear = numberParam(params.get("year"), 0, 0, 9999);
    const selectedCountry = canonicalCountry(normalizeText(params.get("country")));
    const selectedIntake = normalizeText(params.get("intake"));

    const offeringWhere: Prisma.SearchProgramOfferingWhereInput = {
      programSourceId: { in: sourceIds },
      ...(selectedYear ? { extractionYear: selectedYear } : {}),
      ...(selectedCountry ? { extractionCountryFilterLabel: selectedCountry } : {}),
      ...(selectedIntake ? { intakes: { contains: selectedIntake } } : {})
    };

    const offerings = sourceIds.length
      ? await db.searchProgramOffering.findMany({
          where: offeringWhere,
          orderBy: [{ extractionYear: "asc" }, { amount: "asc" }],
          take: Math.min(sourceIds.length * 8, 240),
          select: {
            programSourceId: true,
            extractionYear: true,
            extractionCountryFilterLabel: true,
            intakes: true,
            applicationDeadline: true,
            tuitionFee: true,
            amount: true,
            tuitionFeeCurrency: true,
            applicationFee: true,
            applicationFeeAmount: true,
            applicationFeeCurrency: true
          }
        })
      : [];

    const offeringsByProgram = new Map<number, any[]>();
    for (const offering of offerings) {
      const list = offeringsByProgram.get(offering.programSourceId) || [];
      if (list.length < 4) list.push(offering);
      offeringsByProgram.set(offering.programSourceId, list);
    }

    const total = toNumber(countRows[0]?.count) || 0;
    return withSecurityHeaders(
      NextResponse.json({
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        programs: programs.map((program) => serializeProgram(program, offeringsByProgram.get(program.sourceId) || [])),
        facets
      }),
      req
    );
  } catch (error: any) {
    return withSecurityHeaders(
      NextResponse.json({ error: error?.message || "Search failed" }, { status: 500 }),
      req
    );
  }
}
