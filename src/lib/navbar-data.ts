import "server-only";
import { cache } from "react";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { formatCompactCount, importedEntityPath } from "@/lib/search-slugs";
import { REAL_IMAGES, postImageFor, realImageOr } from "@/lib/real-images";
import type { NavbarData, NavbarGroupData, NavbarSearchSuggestion, NavColumn, NavLink } from "@/components/layout/Navbar";

type CountryConfig = {
  label: string;
  countryParam: string;
  values: string[];
  programCountHint?: number;
  universityCountHint?: number;
};

type RequirementCounts = {
  ielts: number;
  toefl: number;
  pte: number;
  det: number;
  gre: number;
  gmat: number;
  sat: number;
  act: number;
  englishWaiver: number;
  feeWaiver: number;
  scholarship: number;
  stem: number;
  online: number;
  internship: number;
};

type CountryMenuData = CountryConfig & {
  resolvedCountry: string;
  programCount: number;
  universityCount: number;
  universities: Array<{
    sourceId: number;
    name: string;
    city: string | null;
    state: string | null;
    country: string | null;
    programCount: number;
  }>;
  programs: Array<{
    sourceId: number;
    name: string;
    universityName: string;
    universityCountry: string | null;
    studyLevel: string | null;
  }>;
  levels: Array<{ label: string; count: number }>;
  regions: Array<{ label: string; count: number }>;
  requirements: RequirementCounts;
};

const INVALID_COUNTRIES = ["Search and Selection (Non-Tie-up)"];
const DETAILED_COUNTRY_LIMIT = 32;

const COUNTRY_ALIASES: Array<[string, string[]]> = [
  ["United States of America", ["United States", "USA", "US", "U.S.", "U.S.A", "America"]],
  ["United Kingdom", ["UK", "U.K.", "England", "Britain", "Great Britain"]],
  ["United Arab Emirates", ["UAE", "U.A.E.", "Dubai"]],
  ["South Korea", ["Korea"]],
  ["New Zealand", ["NZ"]],
  ["Sri Lanka", ["SL"]]
];

const DEFAULT_COUNTRIES = [
  "United States of America",
  "United Kingdom",
  "Australia",
  "Canada",
  "Ireland",
  "New Zealand",
  "Germany",
  "France",
  "Netherlands",
  "Finland",
  "Denmark",
  "Sweden",
  "Spain",
  "Italy",
  "Switzerland",
  "Singapore",
  "Japan",
  "South Korea",
  "United Arab Emirates",
  "Malaysia",
  "Malta",
  "Cyprus",
  "Poland",
  "Austria",
  "Belgium",
  "Thailand",
  "China",
  "India",
  "Vietnam",
  "Mauritius",
  "Saudi Arabia",
  "Indonesia"
];

const DEFAULT_LOGO = "/assets/brand/sathi-logo-glass-160.webp";
const PROGRAM_LOGO = REAL_IMAGES.computer;
const UNIVERSITY_LOGO = REAL_IMAGES.campus;
const ARTICLE_LOGO = REAL_IMAGES.news;

function compact(value: number) {
  return formatCompactCount(value || 0);
}

function cleanText(value: string | null | undefined) {
  return (value || "").trim();
}

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9.]+/g, " ").replace(/\s+/g, " ").trim();
}

function canonicalCountry(value: string) {
  const clean = cleanText(value);
  const normalized = normalizeKey(clean);
  if (!normalized) return "";
  for (const [country, aliases] of COUNTRY_ALIASES) {
    if (normalizeKey(country) === normalized || aliases.some((alias) => normalizeKey(alias) === normalized)) return country;
  }
  return clean;
}

function countryLabel(value: string) {
  const country = canonicalCountry(value);
  if (country === "United States of America") return "USA";
  if (country === "United Kingdom") return "UK";
  if (country === "United Arab Emirates") return "UAE";
  return country;
}

function countryValues(value: string, discovered: string[] = []) {
  const country = canonicalCountry(value);
  const aliases = COUNTRY_ALIASES.find(([name]) => name === country)?.[1] || [];
  return uniqueBy([country, ...aliases, ...discovered], (item) => item).filter(Boolean);
}

function createCountryConfig(country: string, discovered: string[] = [], hints: Partial<CountryConfig> = {}): CountryConfig {
  const canonical = canonicalCountry(country);
  return {
    label: countryLabel(canonical),
    countryParam: canonical,
    values: countryValues(canonical, discovered),
    programCountHint: hints.programCountHint,
    universityCountHint: hints.universityCountHint
  };
}

function uniqueBy<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const value = key(item).toLowerCase();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push(item);
  }
  return out;
}

function link(path: string, params: Record<string, string | string[] | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item) search.append(key, item);
      }
    } else if (value) {
      search.set(key, value);
    }
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

function programSearch(params: Record<string, string | string[] | undefined>) {
  return link("/search-program", params);
}

function countryDescription(country: CountryMenuData) {
  if (!country.programCount && !country.universityCount) {
    return `Search ${country.label} universities, programs, scholarships and entry requirements.`;
  }
  return `${compact(country.programCount)} programs from ${compact(country.universityCount)} universities in the local database.`;
}

function locationDescription(item: { city: string | null; state: string | null; country: string | null }) {
  return [item.city, item.state, item.country].filter(Boolean).join(", ") || "University profile";
}

function fallbackUniversityLinks(country: CountryMenuData): NavLink[] {
  return [
    {
      href: programSearch({ country: country.resolvedCountry }),
      label: `${country.label} universities`,
      description: "Open the country-filtered university and program database"
    },
    {
      href: programSearch({ country: country.resolvedCountry, quick: "scholarship" }),
      label: `${country.label} scholarships`,
      description: "Programs with scholarship indicators"
    }
  ];
}

function universityLinks(country: CountryMenuData, take = 6): NavLink[] {
  const links = country.universities.slice(0, take).map((item) => ({
    href: importedEntityPath("/colleges", item.sourceId, item.name),
    label: item.name,
    description: `${locationDescription(item)}${item.programCount ? ` - ${compact(item.programCount)} programs` : ""}`
  }));
  return links.length ? links : fallbackUniversityLinks(country);
}

function programLinks(country: CountryMenuData, take = 6): NavLink[] {
  const links = uniqueBy(country.programs, (item) => item.name)
    .slice(0, take)
    .map((item) => ({
      href: importedEntityPath("/courses", item.sourceId, item.name),
      label: item.name,
      description: [item.studyLevel, item.universityName].filter(Boolean).join(" at ")
    }));
  return links.length
    ? links
    : [
        { href: programSearch({ country: country.resolvedCountry, q: "Computer Science" }), label: "Computer Science programs" },
        { href: programSearch({ country: country.resolvedCountry, q: "Business" }), label: "Business programs" },
        { href: programSearch({ country: country.resolvedCountry, q: "Nursing" }), label: "Nursing programs" }
      ];
}

function levelLinks(country: CountryMenuData): NavLink[] {
  const links = country.levels.slice(0, 6).map((item) => ({
    href: programSearch({ country: country.resolvedCountry, studyLevel: item.label }),
    label: item.label,
    description: `${compact(item.count)} programs`
  }));
  return links.length
    ? links
    : [
        { href: programSearch({ country: country.resolvedCountry, studyLevel: "Undergraduate" }), label: "Undergraduate" },
        { href: programSearch({ country: country.resolvedCountry, studyLevel: "Postgraduate" }), label: "Postgraduate" }
      ];
}

function regionLinks(country: CountryMenuData): NavLink[] {
  const links = country.regions.slice(0, 6).map((item) => ({
    href: programSearch({ country: country.resolvedCountry, q: item.label }),
    label: item.label,
    description: `${compact(item.count)} universities`
  }));
  return links.length
    ? links
    : [
        { href: programSearch({ country: country.resolvedCountry, q: "Scholarship" }), label: "Scholarship search" },
        { href: programSearch({ country: country.resolvedCountry, q: "STEM" }), label: "STEM programs" }
      ];
}

function requirementLinks(country: CountryMenuData, keys: Array<keyof RequirementCounts>, labels: Record<string, string>): NavLink[] {
  return keys
    .map((key) => {
      const count = country.requirements[key] || 0;
      const requirement = key === "englishWaiver" ? "without-english" : String(key);
      const quick = key === "feeWaiver" ? "fee-waiver" : key === "scholarship" || key === "stem" || key === "online" || key === "internship" ? String(key) : undefined;
      return {
        href: quick
          ? programSearch({ country: country.resolvedCountry, quick })
          : programSearch({ country: country.resolvedCountry, requirement }),
        label: labels[key] || String(key).toUpperCase(),
        description: count ? `${compact(count)} matching programs` : "Open filtered program results"
      };
    })
    .filter((item, index) => index < 6);
}

function countryCollegeCategory(country: CountryMenuData) {
  return {
    label: country.label,
    href: programSearch({ country: country.resolvedCountry }),
    description: countryDescription(country),
    columns: [
      { title: "Top Universities", links: universityLinks(country) },
      { title: "Popular Programs", links: programLinks(country) },
      { title: "Study Levels", links: levelLinks(country) },
      { title: "Regions", links: regionLinks(country) }
    ]
  };
}

function countryCourseCategory(country: CountryMenuData) {
  return {
    label: country.label,
    href: programSearch({ country: country.resolvedCountry }),
    description: `Programs, levels, tuition and scholarships for ${country.label}, generated from database records.`,
    columns: [
      { title: "Popular Programs", links: programLinks(country, 7) },
      { title: "Study Levels", links: levelLinks(country) },
      {
        title: "Scholarship Filters",
        links: requirementLinks(country, ["scholarship", "feeWaiver", "online", "stem"], {
          scholarship: "Scholarship available",
          feeWaiver: "Application fee waiver",
          online: "Online programs",
          stem: "STEM programs"
        })
      },
      { title: "Universities", links: universityLinks(country, 5) }
    ]
  };
}

function countryExamCategory(country: CountryMenuData) {
  return {
    label: country.label,
    href: programSearch({ country: country.resolvedCountry }),
    description: `Language, aptitude and waiver filters for ${country.label} programs from the database.`,
    columns: [
      {
        title: "English Tests",
        links: requirementLinks(country, ["ielts", "toefl", "pte", "det"], {
          ielts: "IELTS",
          toefl: "TOEFL iBT",
          pte: "PTE",
          det: "Duolingo English Test"
        })
      },
      {
        title: "Graduate Tests",
        links: requirementLinks(country, ["gre", "gmat"], {
          gre: "GRE",
          gmat: "GMAT"
        })
      },
      {
        title: "Undergraduate Tests",
        links: requirementLinks(country, ["sat", "act"], {
          sat: "SAT",
          act: "ACT"
        })
      },
      {
        title: "Waivers & Support",
        links: requirementLinks(country, ["englishWaiver", "scholarship", "feeWaiver"], {
          englishWaiver: "No IELTS / MOI waiver",
          scholarship: "Scholarships",
          feeWaiver: "Fee waiver"
        })
      }
    ]
  };
}

function countryCareerCategory(country: CountryMenuData, careers: NavLink[]) {
  return {
    label: country.label,
    href: programSearch({ country: country.resolvedCountry }),
    description: `Career pathways connected to real ${country.label} program records and local career guides.`,
    columns: [
      {
        title: "Program Pathways",
        links: [
          { href: programSearch({ country: country.resolvedCountry, q: "Computer Science" }), label: "Software and data careers" },
          { href: programSearch({ country: country.resolvedCountry, q: "Business Analytics" }), label: "Business analytics careers" },
          { href: programSearch({ country: country.resolvedCountry, q: "Nursing" }), label: "Healthcare careers" },
          { href: programSearch({ country: country.resolvedCountry, q: "Engineering" }), label: "Engineering careers" },
          { href: programSearch({ country: country.resolvedCountry, q: "Hospitality" }), label: "Hospitality careers" }
        ]
      },
      { title: "Career-linked Programs", links: programLinks(country, 6) },
      { title: "Career Guides", links: careers.slice(0, 6) },
      {
        title: "Work-ready Filters",
        links: requirementLinks(country, ["internship", "stem", "online", "scholarship"], {
          internship: "Co-op and internships",
          stem: "STEM career tracks",
          online: "Online upskilling",
          scholarship: "Funded pathways"
        })
      }
    ]
  };
}

function chunkColumns(titlePrefix: string, links: NavLink[], size = 5): NavColumn[] {
  const columns: NavColumn[] = [];
  for (let i = 0; i < links.length; i += size) {
    columns.push({ title: columns.length ? `${titlePrefix} ${columns.length + 1}` : titlePrefix, links: links.slice(i, i + size) });
  }
  return columns.length ? columns : [{ title: titlePrefix, links: [{ href: "/search-program", label: "Search all programs" }] }];
}

type CountryCountRow = { country: string | null; count: bigint | number | null };

async function getCountryConfigs(): Promise<CountryConfig[]> {
  const [programRows, universityRows] = await Promise.all([
    db.$queryRaw<CountryCountRow[]>(Prisma.sql`
      SELECT universityCountry AS country, COUNT(*) AS count
      FROM SearchProgram
      WHERE universityCountry IS NOT NULL
        AND universityCountry <> ''
        AND universityCountry NOT IN (${Prisma.join(INVALID_COUNTRIES)})
      GROUP BY universityCountry
      ORDER BY count DESC
      LIMIT 250
    `),
    db.$queryRaw<CountryCountRow[]>(Prisma.sql`
      SELECT country AS country, COUNT(*) AS count
      FROM SearchUniversity
      WHERE country IS NOT NULL
        AND country <> ''
        AND country NOT IN (${Prisma.join(INVALID_COUNTRIES)})
      GROUP BY country
      ORDER BY count DESC
      LIMIT 250
    `)
  ]);

  const merged = new Map<string, { canonical: string; discovered: string[]; programCount: number; universityCount: number }>();
  const ensure = (country: string) => {
    const canonical = canonicalCountry(country);
    const key = normalizeKey(canonical);
    const existing = merged.get(key);
    if (existing) return existing;
    const created = { canonical, discovered: [], programCount: 0, universityCount: 0 };
    merged.set(key, created);
    return created;
  };

  for (const row of programRows) {
    const country = cleanText(row.country);
    if (!country) continue;
    const item = ensure(country);
    item.discovered.push(country);
    item.programCount += Number(row.count || 0);
  }

  for (const row of universityRows) {
    const country = cleanText(row.country);
    if (!country) continue;
    const item = ensure(country);
    item.discovered.push(country);
    item.universityCount += Number(row.count || 0);
  }

  const configs = Array.from(merged.values())
    .sort((a, b) => b.programCount - a.programCount || b.universityCount - a.universityCount || countryLabel(a.canonical).localeCompare(countryLabel(b.canonical)))
    .map((item) =>
      createCountryConfig(item.canonical, item.discovered, {
        programCountHint: item.programCount,
        universityCountHint: item.universityCount
      })
    );

  return configs.length ? configs : DEFAULT_COUNTRIES.map((country) => createCountryConfig(country));
}

function buildCountryShell(config: CountryConfig): CountryMenuData {
  const emptyRequirements: RequirementCounts = {
    ielts: 0,
    toefl: 0,
    pte: 0,
    det: 0,
    gre: 0,
    gmat: 0,
    sat: 0,
    act: 0,
    englishWaiver: 0,
    feeWaiver: 0,
    scholarship: 0,
    stem: 0,
    online: 0,
    internship: 0
  };
  return {
    ...config,
    resolvedCountry: config.countryParam,
    programCount: config.programCountHint || 0,
    universityCount: config.universityCountHint || 0,
    universities: [],
    programs: [],
    levels: [],
    regions: [],
    requirements: emptyRequirements
  };
}

async function requirementCounts(countryValues: string[]): Promise<RequirementCounts> {
  const rows = await db.$queryRaw<Array<Record<string, bigint | number | null>>>(Prisma.sql`
    SELECT
      SUM(ieltsRequired = 1) AS ielts,
      SUM(toeflRequired = 1) AS toefl,
      SUM(pteRequired = 1) AS pte,
      SUM(detRequired = 1) AS det,
      SUM(greRequired = 1) AS gre,
      SUM(gmatRequired = 1) AS gmat,
      SUM(satRequired = 1) AS sat,
      SUM(actRequired = 1) AS act,
      SUM(withoutEnglishProficiency = 1 OR isMoiWaiver = 1) AS englishWaiver,
      SUM(appFeeWaiverAvailable = 1) AS feeWaiver,
      SUM(scholarshipAvailable = 1) AS scholarship,
      SUM(isStem = 1) AS stem,
      SUM(isOnline = 1) AS online,
      SUM(internshipAvailable = 1) AS internship
    FROM SearchProgram
    WHERE universityCountry IN (${Prisma.join(countryValues)})
  `);
  const row = rows[0] || {};
  const read = (key: string) => Number(row[key] || 0);
  return {
    ielts: read("ielts"),
    toefl: read("toefl"),
    pte: read("pte"),
    det: read("det"),
    gre: read("gre"),
    gmat: read("gmat"),
    sat: read("sat"),
    act: read("act"),
    englishWaiver: read("englishWaiver"),
    feeWaiver: read("feeWaiver"),
    scholarship: read("scholarship"),
    stem: read("stem"),
    online: read("online"),
    internship: read("internship")
  };
}

async function getCountryData(config: CountryConfig): Promise<CountryMenuData> {
  const countryRows = await db.searchProgram.groupBy({
    by: ["universityCountry"],
    where: { universityCountry: { in: config.values } },
    _count: { _all: true }
  });
  const sortedCountryRows = [...countryRows].sort((a, b) => b._count._all - a._count._all);
  const resolvedCountry = cleanText(sortedCountryRows[0]?.universityCountry) || config.countryParam;
  const countryValues = sortedCountryRows.length ? uniqueBy(sortedCountryRows.map((row) => cleanText(row.universityCountry)).filter(Boolean), (item) => item) : config.values;
  const wherePrograms = { universityCountry: { in: countryValues } };
  const whereUniversities = { country: { in: countryValues } };

  const [programCount, universityCount, universities, programs, levels, regions, requirements] = await Promise.all([
    db.searchProgram.count({ where: wherePrograms }),
    db.searchUniversity.count({ where: whereUniversities }),
    db.searchUniversity.findMany({
      where: whereUniversities,
      select: { sourceId: true, name: true, city: true, state: true, country: true, programCount: true },
      orderBy: [{ programCount: "desc" }, { offeringCount: "desc" }, { name: "asc" }],
      take: 8
    }),
    db.searchProgram.findMany({
      where: wherePrograms,
      select: { sourceId: true, name: true, universityName: true, universityCountry: true, studyLevel: true },
      orderBy: [{ scholarshipAvailable: "desc" }, { appFeeWaiverAvailable: "desc" }, { sourceId: "asc" }],
      take: 14
    }),
    db.searchProgram.groupBy({
      by: ["studyLevel"],
      where: wherePrograms,
      _count: { _all: true },
      orderBy: { _count: { studyLevel: "desc" } },
      take: 8
    }),
    db.searchUniversity.groupBy({
      by: ["state"],
      where: { ...whereUniversities, state: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { state: "desc" } },
      take: 8
    }),
    requirementCounts(countryValues)
  ]);

  return {
    ...config,
    resolvedCountry,
    programCount,
    universityCount,
    universities,
    programs,
    levels: levels
      .map((row) => ({ label: cleanText(row.studyLevel), count: row._count._all }))
      .filter((row) => row.label),
    regions: regions
      .map((row) => ({ label: cleanText(row.state), count: row._count._all }))
      .filter((row) => row.label),
    requirements
  };
}

function buildFallbackCountries(): CountryMenuData[] {
  return DEFAULT_COUNTRIES.map((country) => buildCountryShell(createCountryConfig(country)));
}

function buildGroups(countries: CountryMenuData[], careerLinks: NavLink[], posts: any[], categories: any[], communities: any[]): NavbarGroupData[] {
  const countryQuickLinks = countries.map((country) => ({
    href: programSearch({ country: country.resolvedCountry }),
    label: `${country.label} programs`,
    description: country.programCount ? `${compact(country.programCount)} programs` : undefined
  }));

  const latestArticleLinks = posts.slice(0, 6).map((post) => ({
    href: `/blog/${post.category?.slug || "article"}/${post.slug}`,
    label: post.title,
    description: post.excerpt
  }));
  const categoryLinks = categories.slice(0, 6).map((category) => ({
    href: `/blog/category/${category.slug}`,
    label: category.name,
    description: category.description || "Article category"
  }));
  const communityLinks = communities.slice(0, 5).map((post) => ({
    href: `/community/post/${post.slug}`,
    label: post.title,
    description: post.community?.name || post.tag || "Community discussion"
  }));

  return [
    {
      label: "Colleges",
      tagline: "Universities by every destination country found in the searchable program database.",
      cta: { href: "/colleges", label: "View all universities", description: "Open the full college and university directory" },
      quickLinks: [
        { href: "/search-program", label: "Search Programs" },
        { href: "/colleges", label: "University Directory" },
        { href: "/college-comparison", label: "Compare Colleges" },
        ...countryQuickLinks.slice(0, 2)
      ],
      categories: countries.map(countryCollegeCategory)
    },
    {
      label: "Exam",
      tagline: "IELTS, TOEFL, PTE, GRE, GMAT, SAT and waiver filters from real program requirements.",
      cta: { href: "/search-program?requirement=ielts", label: "Browse requirements", description: "Open requirement-filtered program search" },
      quickLinks: [
        { href: "/search-program?requirement=ielts", label: "IELTS programs" },
        { href: "/search-program?requirement=toefl", label: "TOEFL programs" },
        { href: "/search-program?requirement=gre", label: "GRE programs" },
        { href: "/search-program?requirement=without-english", label: "English waiver" }
      ],
      categories: countries.map(countryExamCategory)
    },
    {
      label: "Courses",
      tagline: "Country-aware programs, study levels, scholarships and online/STEM filters from the database.",
      cta: { href: "/search-program", label: "Open Program Search", description: "Use all filters, tuition, intakes and requirements" },
      quickLinks: [
        { href: "/search-program?q=Computer%20Science", label: "Computer Science" },
        { href: "/search-program?q=MBA", label: "MBA" },
        { href: "/search-program?quick=scholarship", label: "Scholarships" },
        { href: "/search-program?quick=stem", label: "STEM" }
      ],
      categories: countries.map(countryCourseCategory)
    },
    {
      label: "Careers",
      tagline: "Career guides plus country-specific program pathways for work-ready course choices.",
      cta: { href: "/careers", label: "View career guides", description: "Open career pages managed from admin" },
      quickLinks: careerLinks.slice(0, 4).length ? careerLinks.slice(0, 4) : [
        { href: "/search-program?q=Computer%20Science", label: "Software careers" },
        { href: "/search-program?q=Business", label: "Business careers" },
        { href: "/search-program?q=Nursing", label: "Healthcare careers" }
      ],
      categories: [
        ...countries.map((country) => countryCareerCategory(country, careerLinks)),
        {
          label: "Career Guides",
          href: "/careers",
          description: "Admin-managed career pages linked from the database.",
          columns: chunkColumns("Career Guides", careerLinks, 6)
        }
      ]
    },
    {
      label: "Predictors",
      tagline: "Decision tools connected to country, scholarship and comparison workflows.",
      cta: { href: "/search-program", label: "Start matching", description: "Find programs by country, level, tuition and requirements" },
      quickLinks: [
        { href: "/search-program?quick=scholarship", label: "Scholarship Finder" },
        { href: "/search-program?quick=fee-waiver", label: "Fee Waiver Finder" },
        { href: "/college-comparison", label: "Compare Colleges" },
        { href: "/ap-eapcet-ai-chatbot", label: "AI Assistant" }
      ],
      categories: [
        {
          label: "Program Match",
          href: "/search-program",
          description: "High-intent filtered searches for study abroad decisions.",
          columns: [
            ...chunkColumns("Countries", countryQuickLinks, 8).slice(0, 3),
            {
              title: "Cost & Funding",
              links: [
                { href: "/search-program?quick=scholarship", label: "Scholarship Available" },
                { href: "/search-program?quick=fee-waiver", label: "Application Fee Waiver" },
                { href: "/search-program?maxTuition=20000&sort=tuition_asc", label: "Lower tuition programs" }
              ]
            },
            {
              title: "Eligibility",
              links: [
                { href: "/search-program?requirement=without-english", label: "Without English Proficiency" },
                { href: "/search-program?requirement=without-maths", label: "Without Maths" },
                { href: "/search-program?quick=esl", label: "ESL / ELP Available" }
              ]
            }
          ]
        }
      ]
    },
    {
      label: "Latest Updates",
      tagline: "Latest article and community records from the database, not fixed sample news.",
      layout: "flat",
      cta: { href: "/blog", label: "Read all updates", description: "Open articles and admission news" },
      quickLinks: [
        { href: "/blog", label: "All Articles" },
        { href: "/community", label: "Community" },
        { href: "/search-program", label: "Program Updates" }
      ],
      cards: posts.slice(0, 4).map((post) => ({
        href: `/blog/${post.category?.slug || "article"}/${post.slug}`,
        label: post.title,
        description: post.excerpt,
        image: realImageOr(cleanText(post.coverImage), postImageFor({ title: post.title, category: post.category?.name })) || ARTICLE_LOGO,
        meta: post.category?.name || "Article"
      })),
      categories: [
        {
          label: "Updates",
          href: "/blog",
          description: "Live content records from the admin-managed blog and community.",
          columns: [
            { title: "Latest Articles", links: latestArticleLinks.length ? latestArticleLinks : [{ href: "/blog", label: "All Articles" }] },
            { title: "Categories", links: categoryLinks.length ? categoryLinks : [{ href: "/blog", label: "Article Categories" }] },
            { title: "Community Posts", links: communityLinks.length ? communityLinks : [{ href: "/community", label: "Community" }] }
          ]
        }
      ]
    },
    {
      label: "More",
      tagline: "Global tools, country filters, scholarships and support links.",
      layout: "flat",
      cta: { href: "/about", label: "About SathiCollege", description: "Learn how this platform helps students" },
      quickLinks: [
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
        { href: "/ap-eapcet-ai-chatbot", label: "AI Assistant" }
      ],
      categories: [
        {
          label: "Global Tools",
          href: "/search-program",
          description: "Useful shortcuts for study abroad discovery.",
          columns: [
            ...chunkColumns("Countries", countryQuickLinks, 8).slice(0, 3),
            {
              title: "Research Tools",
              links: [
                { href: "/search-program?quick=scholarship", label: "Scholarship Finder" },
                { href: "/search-program?sort=ranking", label: "Best ranking programs" },
                { href: "/search-program?sort=tuition_asc", label: "Lowest tuition programs" },
                { href: "/college-comparison", label: "College Comparison" },
                { href: "/ap-eapcet-ai-chatbot", label: "Ask AI Assistant" }
              ]
            },
            {
              title: "Quick Links",
              links: [
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact Us" },
                { href: "/signup", label: "Join Us" },
                { href: "/privacy", label: "Privacy" },
                { href: "/terms", label: "Terms" }
              ]
            }
          ]
        }
      ]
    }
  ];
}

const fallbackCareerLinks: NavLink[] = [
  { href: "/search-program?q=Computer%20Science", label: "Software and data careers" },
  { href: "/search-program?q=Business", label: "Business careers" },
  { href: "/search-program?q=Nursing", label: "Healthcare careers" },
  { href: "/careers", label: "All career guides" }
];

async function getLatestUpdateRecords() {
  const [posts, categories, communityPosts] = await Promise.all([
    db.post.findMany({
      where: { published: true },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        category: { select: { slug: true, name: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    db.category.findMany({
      select: { slug: true, name: true, description: true },
      orderBy: { name: "asc" },
      take: 8
    }),
    db.communityPost.findMany({
      where: { published: true },
      select: {
        slug: true,
        title: true,
        tag: true,
        community: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 6
    })
  ]);

  return { posts, categories, communityPosts };
}

function fallbackData(): NavbarData {
  const countries = buildFallbackCountries();
  return {
    groups: buildGroups(countries, fallbackCareerLinks, [], [], []),
    searchSuggestions: [
      { name: "Search Programs", href: "/search-program", logo: DEFAULT_LOGO, meta: "Search all database programs" },
      { name: "USA programs", href: "/search-program?country=United%20States%20of%20America", logo: PROGRAM_LOGO, meta: "United States program filter" },
      { name: "UK programs", href: "/search-program?country=United%20Kingdom", logo: PROGRAM_LOGO, meta: "United Kingdom program filter" },
      { name: "Australia programs", href: "/search-program?country=Australia", logo: PROGRAM_LOGO, meta: "Australia program filter" },
      { name: "Canada programs", href: "/search-program?country=Canada", logo: PROGRAM_LOGO, meta: "Canada program filter" },
      { name: "Scholarships", href: "/search-program?quick=scholarship", logo: PROGRAM_LOGO, meta: "Programs with scholarship indicators" }
    ]
  };
}

export const getNavbarData = cache(async (): Promise<NavbarData> => {
  try {
    const countryConfigs = await getCountryConfigs();
    const detailedCountries = countryConfigs.slice(0, DETAILED_COUNTRY_LIMIT);
    const shellCountries = countryConfigs.slice(DETAILED_COUNTRY_LIMIT).map(buildCountryShell);
    const [countriesWithDetails, careers, latestUpdates] = await Promise.all([
      Promise.all(detailedCountries.map(getCountryData)),
      db.career.findMany({
        where: { active: true },
        select: { slug: true, name: true, sector: true },
        orderBy: [{ featured: "desc" }, { name: "asc" }],
        take: 18
      }),
      getLatestUpdateRecords()
    ]);
    const countries = [...countriesWithDetails, ...shellCountries];

    const careerLinks = careers.map((career) => ({
      href: `/careers/${career.slug}`,
      label: career.name,
      description: career.sector
    }));

    const topUniversities = countries.flatMap((country) => country.universities.slice(0, 2).map((item) => ({
      name: item.name,
      href: importedEntityPath("/colleges", item.sourceId, item.name),
      logo: UNIVERSITY_LOGO,
      meta: `${country.label} - ${compact(item.programCount)} programs`
    })));
    const topPrograms = countries.flatMap((country) => country.programs.slice(0, 2).map((item) => ({
      name: item.name,
      href: importedEntityPath("/courses", item.sourceId, item.name),
      logo: PROGRAM_LOGO,
      meta: `${country.label} - ${item.universityName}`
    })));
    const countrySuggestions = countries.slice(0, 24).map((country) => ({
      name: `${country.label} programs`,
      href: programSearch({ country: country.resolvedCountry }),
      logo: PROGRAM_LOGO,
      meta: countryDescription(country)
    }));
    const searchSuggestions: NavbarSearchSuggestion[] = uniqueBy([
      { name: "Search Programs", href: "/search-program", logo: DEFAULT_LOGO, meta: "CourseFinder-style program search" },
      ...countrySuggestions,
      ...topUniversities,
      ...topPrograms,
      { name: "Scholarships", href: "/search-program?quick=scholarship", logo: PROGRAM_LOGO, meta: "Programs with scholarship indicators" },
      { name: "Without IELTS", href: "/search-program?requirement=without-english", logo: PROGRAM_LOGO, meta: "English waiver and MOI options" }
    ], (item) => item.href).slice(0, 18);

    return {
      groups: buildGroups(countries, careerLinks, latestUpdates.posts, latestUpdates.categories, latestUpdates.communityPosts),
      searchSuggestions
    };
  } catch {
    try {
      const latestUpdates = await getLatestUpdateRecords();
      return {
        ...fallbackData(),
        groups: buildGroups(buildFallbackCountries(), fallbackCareerLinks, latestUpdates.posts, latestUpdates.categories, latestUpdates.communityPosts)
      };
    } catch {
      return fallbackData();
    }
  }
});
