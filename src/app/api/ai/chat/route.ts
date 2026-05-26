import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { rateLimitedJson, rateLimitRequest, withSecurityHeaders } from "@/lib/security";

export const runtime = "nodejs";

type ChatRole = "user" | "assistant" | "system";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type KnowledgeHit = {
  type: string;
  title: string;
  url?: string | null;
  summary: string;
  score?: number | null;
};

type ProgramHit = {
  id: string;
  sourceId: number;
  name: string;
  universityName: string;
  universityCountry: string | null;
  universityCity: string | null;
  studyLevel: string | null;
  minTuitionAmount: Prisma.Decimal | number | string | null;
  currencyCode: string | null;
  scholarshipAvailable: boolean | number;
  appFeeWaiverAvailable: boolean | number;
  ieltsRequired: boolean | number;
  toeflRequired: boolean | number;
  pteRequired: boolean | number;
  score?: number | null;
};

type UniversityHit = {
  sourceId: number;
  name: string;
  country: string | null;
  state: string | null;
  city: string | null;
  programCount: number;
  offeringCount: number;
  score?: number | null;
};

const SEARCH_ALIASES: Record<string, string[]> = {
  btech: ["b tech", "b.tech", "bachelor of technology", "engineering"],
  "b.tech": ["b tech", "bachelor of technology", "engineering"],
  mtech: ["m tech", "m.tech", "master of technology", "engineering"],
  "m.tech": ["m tech", "master of technology", "engineering"],
  mba: ["master of business administration", "business administration", "management"],
  bba: ["bachelor of business administration", "business administration", "management"],
  cs: ["computer science", "computing", "software"],
  cse: ["computer science", "computer science engineering", "software engineering"],
  ai: ["artificial intelligence", "machine learning"],
  ml: ["machine learning", "artificial intelligence"],
  it: ["information technology", "computing"],
  nursing: ["nursing"],
  usa: ["united states", "america", "us"],
  uk: ["united kingdom", "england", "britain"],
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

function text(value: unknown, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
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
    .slice(0, 12);
}

function expandQuery(query: string, ignoredTokens = new Set<string>()) {
  const clean = text(query).slice(0, 1000);
  const rawTokens = tokenizeQuery(clean).filter((token) => !SEARCH_STOP_WORDS.has(token) && !ignoredTokens.has(token));
  const tokens = rawTokens.filter((token) => token.length > 1);
  const meaningfulTokens = tokens.filter((token) => !(tokens.length > 1 && SEARCH_GENERIC_WORDS.has(token)));
  const groupTokens = meaningfulTokens.length ? meaningfulTokens : tokens;
  const phrases = new Set<string>();
  if (clean) phrases.add(clean);
  for (const token of tokens) {
    if (token.length > 1) phrases.add(token);
    for (const alias of SEARCH_ALIASES[token] || []) phrases.add(alias);
  }
  const compact = tokens.join("");
  for (const alias of SEARCH_ALIASES[compact] || []) phrases.add(alias);
  const matchText = Array.from(phrases)
    .join(" ")
    .replace(/[+\-<>()~*"@]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
  const groups = groupTokens
    .map((token) => Array.from(new Set([token, ...(SEARCH_ALIASES[token] || [])])).filter((phrase) => phrase.length >= 2).slice(0, 8))
    .filter((group) => group.length);
  return { clean, phrases: Array.from(phrases).slice(0, 24), matchText, groups };
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

function bool(value: unknown) {
  return value === true || value === 1 || value === "1";
}

function decimalToNumber(value: unknown) {
  if (value instanceof Prisma.Decimal) return Number(value.toString());
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function compact(value: unknown, max = 360) {
  const normalized = text(value).replace(/\s+/g, " ");
  return normalized.length > max ? `${normalized.slice(0, max - 1).trim()}...` : normalized;
}

function sourcePayload(hit: KnowledgeHit) {
  return {
    type: hit.type,
    title: hit.title,
    url: hit.url || undefined,
    summary: compact(hit.summary, 280)
  };
}

async function getSiteStats(): Promise<KnowledgeHit[]> {
  const [programs, universities, countryRows, colleges, exams, courses, careers, communities, posts] = await Promise.all([
    db.searchProgram.count().catch(() => 0),
    db.searchUniversity.count().catch(() => 0),
    db.$queryRaw<Array<{ country: string | null; count: bigint | number | null }>>`
      SELECT universityCountry AS country, COUNT(*) AS count
      FROM SearchProgram
      WHERE universityCountry IS NOT NULL AND universityCountry <> '' AND universityCountry <> 'Search and Selection (Non-Tie-up)'
      GROUP BY universityCountry
      ORDER BY count DESC
    `.catch(() => []),
    db.college.count().catch(() => 0),
    db.exam.count({ where: { active: true } }).catch(() => 0),
    db.course.count({ where: { active: true } }).catch(() => 0),
    db.career.count({ where: { active: true } }).catch(() => 0),
    db.community.count({ where: { active: true } }).catch(() => 0),
    db.post.count({ where: { published: true } }).catch(() => 0)
  ]);
  const countries = countryRows.length;
  const countryList = countryRows.map((row) => row.country).filter(Boolean).join(", ");
  return [
    {
      type: "system",
      title: "SathiCollege data coverage",
      url: "/search-program",
      summary: `SathiCollege currently searches ${programs.toLocaleString("en-IN")} programs from ${universities.toLocaleString("en-IN")} universities across ${countries.toLocaleString("en-IN")} countries, plus local colleges, exams, courses, careers, communities and posts managed from the admin panel. Countries available in the filter: ${countryList}.`,
      score: 1
    },
    {
      type: "system",
      title: "SathiCollege main tools",
      url: "/",
      summary: `Core tools include program search, college discovery, exam pages, course and career guides, rank prediction, counselling content, community posts, WhatsApp support and the AI assistant.`,
      score: 1
    }
  ];
}

async function findKnowledge(question: string): Promise<KnowledgeHit[]> {
  const expanded = expandQuery(question);
  if (!expanded.clean) return [];
  const like = `%${expanded.clean}%`;
  try {
    const rows = await db.$queryRaw<Array<KnowledgeHit & { sourceType: string }>>(Prisma.sql`
      SELECT
        sourceType AS type,
        title,
        url,
        summary,
        MATCH(title, summary, keywords) AGAINST (${expanded.matchText} IN NATURAL LANGUAGE MODE) AS score
      FROM AiKnowledge
      WHERE active = 1 AND (
        MATCH(title, summary, keywords) AGAINST (${expanded.matchText} IN NATURAL LANGUAGE MODE)
        OR title LIKE ${like}
        OR summary LIKE ${like}
        OR keywords LIKE ${like}
      )
      ORDER BY score DESC, updatedAt DESC
      LIMIT 8
    `);
    return rows.map((row) => ({ type: row.type, title: row.title, url: row.url, summary: row.summary, score: row.score }));
  } catch {
    return [];
  }
}

async function findPrograms(question: string): Promise<KnowledgeHit[]> {
  const intent = queryIntentFromText(question);
  const expanded = expandQuery(question, intent.ignoredTokens);
  if (!expanded.clean) return [];
  const exact = `%${expanded.clean}%`;
  const firstPhrase = expanded.phrases.find((phrase) => phrase.length > 2) || expanded.clean;
  const firstLike = `%${firstPhrase}%`;
  const groupedClauses = expanded.groups.map((group) => {
    const alternatives = group.map((phrase) => {
      const like = `%${phrase}%`;
      return Prisma.sql`sp.name LIKE ${like} OR sp.universityName LIKE ${like} OR sp.universityCountry LIKE ${like} OR sp.searchText LIKE ${like}`;
    });
    return Prisma.sql`(${Prisma.join(alternatives.map((clause) => Prisma.sql`(${clause})`), " OR ")})`;
  });
  const filters = [
    intent.inferredCountry ? Prisma.sql`sp.universityCountry = ${intent.inferredCountry}` : null,
    ...intent.clauses
  ].filter(Boolean) as Prisma.Sql[];
  const searchWhere = groupedClauses.length
    ? Prisma.sql`(sp.name LIKE ${exact} OR sp.universityName LIKE ${exact} OR sp.universityCountry LIKE ${exact} OR sp.searchText LIKE ${exact} OR (${Prisma.join(groupedClauses, " AND ")}))`
    : filters.length
      ? Prisma.sql`1 = 1`
    : Prisma.sql`(
        MATCH(sp.name, sp.universityName, sp.searchText) AGAINST (${expanded.matchText} IN NATURAL LANGUAGE MODE)
        OR sp.name LIKE ${exact}
        OR sp.universityName LIKE ${exact}
        OR sp.universityCountry LIKE ${exact}
        OR sp.searchText LIKE ${exact}
      )`;
  const where = Prisma.join([searchWhere, ...filters.map((filter) => Prisma.sql`(${filter})`)], " AND ");
  try {
    const programs = await db.$queryRaw<ProgramHit[]>(Prisma.sql`
      SELECT
        sp.id,
        sp.sourceId,
        sp.name,
        sp.universityName,
        sp.universityCountry,
        sp.universityCity,
        sp.studyLevel,
        sp.minTuitionAmount,
        sp.currencyCode,
        sp.scholarshipAvailable,
        sp.appFeeWaiverAvailable,
        sp.ieltsRequired,
        sp.toeflRequired,
        sp.pteRequired,
        MATCH(sp.name, sp.universityName, sp.searchText) AGAINST (${expanded.matchText} IN NATURAL LANGUAGE MODE) AS score
      FROM SearchProgram sp
      WHERE ${where}
      ORDER BY
        CASE
          WHEN sp.name LIKE ${exact} THEN 0
          WHEN sp.universityName LIKE ${exact} THEN 1
          WHEN sp.name LIKE ${firstLike} THEN 2
          ELSE 9
        END ASC,
        score DESC,
        sp.qsRanking IS NULL ASC,
        sp.qsRanking ASC,
        sp.name ASC
      LIMIT 6
    `);
    return programs.map((program) => {
      const tuition = decimalToNumber(program.minTuitionAmount);
      const requirements = [
        bool(program.ieltsRequired) ? "IELTS" : null,
        bool(program.toeflRequired) ? "TOEFL" : null,
        bool(program.pteRequired) ? "PTE" : null
      ].filter(Boolean);
      const benefits = [
        bool(program.scholarshipAvailable) ? "scholarship available" : null,
        bool(program.appFeeWaiverAvailable) ? "application fee waiver" : null
      ].filter(Boolean);
      return {
        type: "program",
        title: `${program.name} at ${program.universityName}`,
        url: `/search-program?q=${encodeURIComponent(program.name)}`,
        summary: [
          program.studyLevel ? `${program.studyLevel} program` : "Program",
          [program.universityCity, program.universityCountry].filter(Boolean).join(", "),
          tuition && program.currencyCode ? `tuition around ${program.currencyCode} ${Math.round(tuition).toLocaleString("en-IN")}` : null,
          benefits.length ? benefits.join(", ") : null,
          requirements.length ? `requirements include ${requirements.join(", ")}` : null
        ]
          .filter(Boolean)
          .join("; "),
        score: Number(program.score || 0)
      };
    });
  } catch {
    return [];
  }
}

async function findUniversities(question: string): Promise<KnowledgeHit[]> {
  const intent = queryIntentFromText(question);
  const expanded = expandQuery(question, intent.ignoredTokens);
  if (!expanded.clean && !intent.inferredCountry) return [];
  const exact = `%${expanded.clean || intent.inferredCountry}%`;
  const groupedClauses = expanded.groups.map((group) => {
    const alternatives = group.map((phrase) => {
      const like = `%${phrase}%`;
      return Prisma.sql`su.name LIKE ${like} OR su.country LIKE ${like} OR su.state LIKE ${like} OR su.city LIKE ${like}`;
    });
    return Prisma.sql`(${Prisma.join(alternatives.map((clause) => Prisma.sql`(${clause})`), " OR ")})`;
  });
  const searchWhere = groupedClauses.length
    ? Prisma.sql`(su.name LIKE ${exact} OR su.country LIKE ${exact} OR su.state LIKE ${exact} OR su.city LIKE ${exact} OR (${Prisma.join(groupedClauses, " AND ")}))`
    : intent.inferredCountry
      ? Prisma.sql`1 = 1`
      : Prisma.sql`(MATCH(su.name, su.country, su.state, su.city) AGAINST (${expanded.matchText || expanded.clean} IN NATURAL LANGUAGE MODE) OR su.name LIKE ${exact} OR su.country LIKE ${exact})`;
  const filters = [intent.inferredCountry ? Prisma.sql`su.country = ${intent.inferredCountry}` : null].filter(Boolean) as Prisma.Sql[];
  const where = Prisma.join([searchWhere, ...filters.map((filter) => Prisma.sql`(${filter})`)], " AND ");

  try {
    const universities = await db.$queryRaw<UniversityHit[]>(Prisma.sql`
      SELECT
        su.sourceId,
        su.name,
        su.country,
        su.state,
        su.city,
        su.programCount,
        su.offeringCount,
        MATCH(su.name, su.country, su.state, su.city) AGAINST (${expanded.matchText || expanded.clean || intent.inferredCountry} IN NATURAL LANGUAGE MODE) AS score
      FROM SearchUniversity su
      WHERE ${where}
      ORDER BY
        CASE
          WHEN su.name LIKE ${exact} THEN 0
          WHEN su.country LIKE ${exact} THEN 1
          ELSE 9
        END ASC,
        su.programCount DESC,
        score DESC,
        su.name ASC
      LIMIT 6
    `);
    return universities.map((university) => ({
      type: "university",
      title: university.name,
      url: `/search-program?university=${encodeURIComponent(university.name)}`,
      summary: [
        [university.city, university.state, university.country].filter(Boolean).join(", "),
        `${Number(university.programCount || 0).toLocaleString("en-IN")} programs`,
        `${Number(university.offeringCount || 0).toLocaleString("en-IN")} offerings`
      ]
        .filter(Boolean)
        .join("; "),
      score: Number(university.score || 0)
    }));
  } catch {
    return [];
  }
}

async function findCareerFallback(question: string): Promise<KnowledgeHit[]> {
  if (!/\bcareer(s)?\b|\bjobs?\b|\bscope\b|\bafter\b/i.test(question)) return [];
  try {
    const careers = await db.career.findMany({
      where: { active: true },
      take: 8,
      orderBy: [{ featured: "desc" }, { name: "asc" }]
    });
    return careers.map((item) => ({
      type: "career",
      title: item.name,
      url: `/careers/${item.slug}`,
      summary: compact(`${item.sector}. ${item.description}`, 320)
    }));
  } catch {
    return [];
  }
}

async function findSiteEntities(question: string): Promise<KnowledgeHit[]> {
  const expanded = expandQuery(question);
  const q = expanded.clean;
  if (!q) return [];
  const contains = { contains: q };
  const [colleges, exams, courses, careers, communities, communityPosts, posts] = await Promise.all([
    db.college
      .findMany({
        where: { OR: [{ name: contains }, { city: contains }, { state: contains }, { description: contains }] },
        take: 3,
        orderBy: [{ featured: "desc" }, { rating: "desc" }]
      })
      .catch(() => []),
    db.exam
      .findMany({
        where: { active: true, OR: [{ name: contains }, { shortName: contains }, { category: contains }, { description: contains }] },
        take: 3,
        orderBy: [{ updatedAt: "desc" }]
      })
      .catch(() => []),
    db.course
      .findMany({
        where: { active: true, OR: [{ name: contains }, { category: contains }, { level: contains }, { description: contains }] },
        take: 3,
        orderBy: [{ featured: "desc" }, { updatedAt: "desc" }]
      })
      .catch(() => []),
    db.career
      .findMany({
        where: { active: true, OR: [{ name: contains }, { sector: contains }, { description: contains }] },
        take: 3,
        orderBy: [{ featured: "desc" }, { updatedAt: "desc" }]
      })
      .catch(() => []),
    db.community
      .findMany({
        where: { active: true, OR: [{ name: contains }, { description: contains }] },
        take: 2,
        orderBy: [{ order: "asc" }, { updatedAt: "desc" }]
      })
      .catch(() => []),
    db.communityPost
      .findMany({
        where: { published: true, OR: [{ title: contains }, { body: contains }, { tag: contains }] },
        take: 2,
        orderBy: [{ createdAt: "desc" }]
      })
      .catch(() => []),
    db.post
      .findMany({
        where: { published: true, OR: [{ title: contains }, { excerpt: contains }, { content: contains }, { tags: contains }] },
        take: 2,
        orderBy: [{ updatedAt: "desc" }]
      })
      .catch(() => [])
  ]);

  return [
    ...colleges.map((item) => ({
      type: "college",
      title: item.name,
      url: `/colleges/${item.slug}`,
      summary: compact(`${item.city}, ${item.state}. ${item.description}`)
    })),
    ...exams.map((item) => ({
      type: "exam",
      title: item.name,
      url: `/exams/${item.slug}`,
      summary: compact(`${item.shortName}. ${item.category}. ${item.description}`)
    })),
    ...courses.map((item) => ({
      type: "course",
      title: item.name,
      url: `/courses/${item.slug}`,
      summary: compact(`${item.level} ${item.category} course. ${item.duration || ""} ${item.description}`)
    })),
    ...careers.map((item) => ({
      type: "career",
      title: item.name,
      url: `/careers/${item.slug}`,
      summary: compact(`${item.sector}. ${item.description}`)
    })),
    ...communities.map((item) => ({
      type: "community",
      title: item.name,
      url: "/community",
      summary: compact(item.description)
    })),
    ...communityPosts.map((item) => ({
      type: "community-post",
      title: item.title,
      url: "/community",
      summary: compact(`${item.tag || "Community"}. ${item.body}`)
    })),
    ...posts.map((item) => ({
      type: "post",
      title: item.title,
      url: `/blog/${item.slug}`,
      summary: compact(item.excerpt || item.content)
    }))
  ];
}

function buildSystemPrompt(question: string, sources: KnowledgeHit[]) {
  const sourceText = sources
    .slice(0, 14)
    .map((source, index) => `${index + 1}. [${source.type}] ${source.title}${source.url ? ` (${source.url})` : ""}: ${compact(source.summary, 520)}`)
    .join("\n");

  return `You are SathiCollege AI, the assistant for the SathiCollege website. Answer student, parent and admin-adjacent questions using the local SathiCollege data below. Be practical and concise. You can help users find courses, careers, schools, universities, colleges, exams, scholarships, requirements and comparisons. For program searches, recommend using /search-program filters for country, level, intake, scholarship, tuition and English requirements. For comparisons, summarize the strongest differences from the supplied rows and link users to the relevant search or comparison page. Do not invent cutoffs, fees, deadlines, visa rules or guaranteed admissions when the supplied context does not contain them. If the question is outside SathiCollege, answer briefly and redirect to what SathiCollege can do.

User question: ${question}

Local SathiCollege context:
${sourceText || "No direct matching local records were found."}`;
}

async function callGroq(messages: ChatMessage[], systemPrompt: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
      temperature: 0.25,
      max_completion_tokens: 700,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-6).map((message) => ({ role: message.role === "system" ? "user" : message.role, content: message.content }))
      ]
    })
  });
  if (!response.ok) throw new Error(`Groq request failed with ${response.status}`);
  const payload = await response.json();
  return text(payload?.choices?.[0]?.message?.content);
}

async function callGemini(messages: ChatMessage[], systemPrompt: string) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: messages.slice(-6).map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }]
      })),
      generationConfig: {
        temperature: 0.25,
        maxOutputTokens: 700
      }
    })
  });
  if (!response.ok) throw new Error(`Gemini request failed with ${response.status}`);
  const payload = await response.json();
  return text(payload?.candidates?.[0]?.content?.parts?.map((part: any) => part?.text || "").join(""));
}

function localAnswer(question: string, sources: KnowledgeHit[]) {
  const normalized = question.toLowerCase();
  const topSources = sources.slice(0, 6);
  const wantsSearch = /program|course|college|university|scholarship|ielts|toefl|pte|country|intake|tuition|fee|mba|btech|nursing|data science|computer/i.test(question);

  if (!topSources.length) {
    return [
      "I could not find an exact SathiCollege record for that query yet.",
      "You can still search programs by course, university, country, intake, tuition, scholarship and English requirements from /search-program.",
      "For better results, include a course name, study level, target country, budget, intake or exam name."
    ].join("\n\n");
  }

  const bullets = topSources
    .map((source) => `- ${source.title}${source.url ? ` (${source.url})` : ""}: ${compact(source.summary, 220)}`)
    .join("\n");

  const prefix = wantsSearch
    ? "Here are the closest matches from the SathiCollege database:"
    : normalized.includes("admin")
      ? "Here is what is available from the SathiCollege managed data:"
      : "Here is the best answer from the SathiCollege knowledge base:";

  const suffix = wantsSearch
    ? "\n\nUse /search-program to refine by country, level, intake, scholarship, tuition and English test requirements."
    : "";

  return `${prefix}\n${bullets}${suffix}`;
}

function cleanMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      role: item?.role === "assistant" || item?.role === "system" ? item.role : "user",
      content: text(item?.content).slice(0, 1200)
    }))
    .filter((item) => item.content)
    .slice(-10);
}

export async function POST(req: NextRequest) {
  const limit = rateLimitRequest(req, "ai-chat", { limit: 25, windowMs: 60_000, blockMs: 120_000 });
  if (!limit.ok) return rateLimitedJson(limit);

  try {
    const body = await req.json().catch(() => ({}));
    const messages = cleanMessages(body.messages);
    const question = text(body.question || [...messages].reverse().find((message) => message.role === "user")?.content).slice(0, 1000);
    if (!question) {
      return withSecurityHeaders(NextResponse.json({ error: "Question is required." }, { status: 400 }), req);
    }

    const [stats, knowledge, programs, universities, careerFallback, entities] = await Promise.all([
      getSiteStats(),
      findKnowledge(question),
      findPrograms(question),
      findUniversities(question),
      findCareerFallback(question),
      findSiteEntities(question)
    ]);
    const wantsCoverage = /\bcountr(y|ies)\b|\bfilters?\b|\bdata\b|\brecords?\b|\bcoverage\b/i.test(question);
    const wantsUniversity = /\buniversit(y|ies)\b|\bschools?\b|\binstitutes?\b/i.test(question);
    const wantsCareer = /\bcareer(s)?\b|\bjobs?\b|\bscope\b|\bafter\b/i.test(question);
    const sources = (
      wantsCoverage
        ? [...stats, ...programs, ...universities, ...knowledge, ...careerFallback, ...entities]
        : wantsUniversity
          ? [...universities, ...programs, ...knowledge, ...entities, ...careerFallback, ...stats]
          : wantsCareer
            ? [...entities, ...careerFallback, ...knowledge, ...programs, ...universities, ...stats]
            : [...programs, ...universities, ...knowledge, ...entities, ...careerFallback, ...stats]
    ).slice(0, 18);
    const fallbackMessages: ChatMessage[] = [{ role: "user", content: question }];
    const chatMessages: ChatMessage[] = messages.length ? messages : fallbackMessages;
    const systemPrompt = buildSystemPrompt(question, sources);

    let provider = "local";
    let answer = "";
    try {
      const groqAnswer = await callGroq(chatMessages, systemPrompt);
      if (groqAnswer) {
        answer = groqAnswer;
        provider = "groq";
      }
    } catch {
      answer = "";
    }
    if (!answer) {
      try {
        const geminiAnswer = await callGemini(chatMessages, systemPrompt);
        if (geminiAnswer) {
          answer = geminiAnswer;
          provider = "gemini";
        }
      } catch {
        answer = "";
      }
    }
    if (!answer) answer = localAnswer(question, sources);

    const publicSources = sources.slice(0, 10).map(sourcePayload);
    await db.aiQueryLog
      .create({
        data: {
          question,
          answer,
          provider,
          matchedSources: publicSources
        }
      })
      .catch(() => undefined);

    return withSecurityHeaders(
      NextResponse.json({
        answer,
        provider,
        sources: publicSources
      }),
      req
    );
  } catch (error: any) {
    return withSecurityHeaders(
      NextResponse.json({ error: error?.message || "AI assistant failed." }, { status: 500 }),
      req
    );
  }
}
