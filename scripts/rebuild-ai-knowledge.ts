import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const INVALID_COUNTRIES = new Set(["Search and Selection (Non-Tie-up)"]);

type KnowledgeInput = {
  sourceType: string;
  sourceId: string;
  title: string;
  url?: string | null;
  summary: string;
  keywords: string;
};

function compact(value: unknown, max = 2200) {
  const normalized = String(value ?? "").replace(/\s+/g, " ").trim();
  return normalized.length > max ? `${normalized.slice(0, max - 1).trim()}...` : normalized;
}

function add(records: KnowledgeInput[], record: KnowledgeInput) {
  if (!record.title.trim() || !record.summary.trim()) return;
  records.push({
    ...record,
    title: compact(record.title, 500),
    summary: compact(record.summary, 2600),
    keywords: compact(record.keywords, 1200)
  });
}

async function main() {
  const records: KnowledgeInput[] = [];

  const [
    colleges,
    exams,
    courses,
    careers,
    communities,
    communityPosts,
    posts,
    programCount,
    universityCount,
    countryRows,
    countryLevelRows,
    samplePrograms
  ] = await Promise.all([
    prisma.college.findMany({ orderBy: [{ featured: "desc" }, { rating: "desc" }] }),
    prisma.exam.findMany({ where: { active: true }, orderBy: { updatedAt: "desc" } }),
    prisma.course.findMany({ where: { active: true }, orderBy: [{ featured: "desc" }, { updatedAt: "desc" }] }),
    prisma.career.findMany({ where: { active: true }, orderBy: [{ featured: "desc" }, { updatedAt: "desc" }] }),
    prisma.community.findMany({ where: { active: true }, orderBy: [{ order: "asc" }, { updatedAt: "desc" }] }),
    prisma.communityPost.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: 500 }),
    prisma.post.findMany({ where: { published: true }, orderBy: { updatedAt: "desc" }, take: 500 }),
    prisma.searchProgram.count().catch(() => 0),
    prisma.searchUniversity.count().catch(() => 0),
    prisma.$queryRaw<Array<{ country: string | null; programs: bigint; universities: bigint; scholarships: bigint; feeWaivers: bigint }>>`
      SELECT
        universityCountry AS country,
        COUNT(*) AS programs,
        COUNT(DISTINCT universityName) AS universities,
        SUM(scholarshipAvailable = 1) AS scholarships,
        SUM(appFeeWaiverAvailable = 1) AS feeWaivers
      FROM SearchProgram
      WHERE universityCountry IS NOT NULL AND universityCountry <> '' AND universityCountry <> 'Search and Selection (Non-Tie-up)'
      GROUP BY universityCountry
      ORDER BY programs DESC
    `.catch(() => []),
    prisma.$queryRaw<Array<{ country: string | null; level: string | null; programs: bigint; scholarships: bigint; englishWaivers: bigint }>>`
      SELECT
        universityCountry AS country,
        studyLevel AS level,
        COUNT(*) AS programs,
        SUM(scholarshipAvailable = 1) AS scholarships,
        SUM(withoutEnglishProficiency = 1 OR isMoiWaiver = 1) AS englishWaivers
      FROM SearchProgram
      WHERE universityCountry IS NOT NULL AND universityCountry <> '' AND universityCountry <> 'Search and Selection (Non-Tie-up)' AND studyLevel IS NOT NULL AND studyLevel <> ''
      GROUP BY universityCountry, studyLevel
      ORDER BY programs DESC
      LIMIT 1200
    `.catch(() => []),
    prisma.searchProgram
      .findMany({
        orderBy: [{ scholarshipAvailable: "desc" }, { appFeeWaiverAvailable: "desc" }, { sourceId: "asc" }],
        take: Number.parseInt(process.env.AI_KNOWLEDGE_PROGRAM_SAMPLES || "1500", 10),
        select: {
          sourceId: true,
          name: true,
          universityName: true,
          universityCountry: true,
          universityCity: true,
          studyLevel: true,
          minTuitionAmount: true,
          currencyCode: true,
          scholarshipAvailable: true,
          appFeeWaiverAvailable: true,
          ieltsRequired: true,
          toeflRequired: true,
          pteRequired: true,
          intakesText: true
        }
      })
      .catch(() => [])
  ]);

  add(records, {
    sourceType: "system",
    sourceId: "overview",
    title: "SathiCollege system overview",
    url: "/",
    summary: `SathiCollege is an education discovery platform with program search, college pages, exam pages, course guides, career guides, rank prediction, counselling/community content, WhatsApp support, admin-managed content and an AI assistant. Search data currently includes ${programCount.toLocaleString("en-IN")} programs and ${universityCount.toLocaleString("en-IN")} universities.`,
    keywords: "sathicollege system website search programs colleges exams courses careers predictor community admin chatbot ai assistant"
  });

  add(records, {
    sourceType: "system",
    sourceId: "search-program",
    title: "Search Programs feature",
    url: "/search-program",
    summary: "The Search Programs page supports searching by course/program name, university, country, study level, intake, tuition, scholarship, application fee waiver, STEM, online programs, internships, English waiver, ESL/ELP and tests such as IELTS, TOEFL, PTE, DET, GRE and GMAT.",
    keywords: "search program finder country filter study level intake tuition scholarship ielts toefl pte gre gmat"
  });

  for (const item of colleges) {
    add(records, {
      sourceType: "college",
      sourceId: item.id,
      title: item.name,
      url: `/colleges/${item.slug}`,
      summary: `${item.name} is a ${item.type} college in ${item.city}, ${item.state}. Rating: ${item.rating}. Fees: ${item.fees}. ${item.description}`,
      keywords: `${item.name} ${item.city} ${item.state} ${item.type} college`
    });
  }

  for (const item of exams) {
    add(records, {
      sourceType: "exam",
      sourceId: item.id,
      title: item.name,
      url: `/exams/${item.slug}`,
      summary: `${item.name} (${item.shortName}) is listed under ${item.category}. ${item.description}`,
      keywords: `${item.name} ${item.shortName} ${item.category} exam cutoff counselling eligibility syllabus pattern`
    });
  }

  for (const item of courses) {
    add(records, {
      sourceType: "course",
      sourceId: item.id,
      title: item.name,
      url: `/courses/${item.slug}`,
      summary: `${item.name} is a ${item.level} ${item.category} course${item.duration ? ` with duration ${item.duration}` : ""}. ${item.description}`,
      keywords: `${item.name} ${item.category} ${item.level} course degree career admission`
    });
  }

  for (const item of careers) {
    add(records, {
      sourceType: "career",
      sourceId: item.id,
      title: item.name,
      url: `/careers/${item.slug}`,
      summary: `${item.name} belongs to ${item.sector}. ${item.description}`,
      keywords: `${item.name} ${item.sector} career job scope salary course`
    });
  }

  for (const item of communities) {
    add(records, {
      sourceType: "community",
      sourceId: item.id,
      title: item.name,
      url: "/community",
      summary: item.description,
      keywords: `${item.name} community whatsapp group discussion`
    });
  }

  for (const item of communityPosts) {
    add(records, {
      sourceType: "community-post",
      sourceId: item.id,
      title: item.title,
      url: "/community",
      summary: `${item.tag || "Community"}. ${item.body}`,
      keywords: `${item.title} ${item.tag || ""} community update`
    });
  }

  for (const item of posts) {
    add(records, {
      sourceType: "post",
      sourceId: item.id,
      title: item.title,
      url: `/blog/${item.slug}`,
      summary: `${item.excerpt} ${item.content}`,
      keywords: `${item.title} ${item.tags || ""} blog article update`
    });
  }

  for (const row of countryRows) {
    if (!row.country || INVALID_COUNTRIES.has(row.country)) continue;
    add(records, {
      sourceType: "search-country",
      sourceId: row.country,
      title: `${row.country} program search coverage`,
      url: `/search-program?country=${encodeURIComponent(row.country)}`,
      summary: `${row.country} has ${Number(row.programs).toLocaleString("en-IN")} searchable programs across ${Number(row.universities).toLocaleString("en-IN")} universities. ${Number(row.scholarships).toLocaleString("en-IN")} programs mention scholarships and ${Number(row.feeWaivers).toLocaleString("en-IN")} mention application fee waivers.`,
      keywords: `${row.country} country programs universities scholarship fee waiver study abroad`
    });
  }

  for (const row of countryLevelRows) {
    if (!row.country || !row.level || INVALID_COUNTRIES.has(row.country)) continue;
    add(records, {
      sourceType: "search-country-level",
      sourceId: `${row.country}:${row.level}`,
      title: `${row.level} programs in ${row.country}`,
      url: `/search-program?country=${encodeURIComponent(row.country)}&studyLevel=${encodeURIComponent(row.level)}`,
      summary: `${row.country} has ${Number(row.programs).toLocaleString("en-IN")} searchable ${row.level} programs. ${Number(row.scholarships).toLocaleString("en-IN")} list scholarships and ${Number(row.englishWaivers).toLocaleString("en-IN")} mention English/MOI waiver options.`,
      keywords: `${row.country} ${row.level} programs scholarship english waiver`
    });
  }

  for (const item of samplePrograms) {
    const requirements = [
      item.ieltsRequired ? "IELTS" : null,
      item.toeflRequired ? "TOEFL" : null,
      item.pteRequired ? "PTE" : null
    ].filter(Boolean);
    add(records, {
      sourceType: "search-program-sample",
      sourceId: String(item.sourceId),
      title: `${item.name} at ${item.universityName}`,
      url: `/search-program?q=${encodeURIComponent(item.name)}`,
      summary: `${item.name} at ${item.universityName}${item.universityCountry ? `, ${item.universityCountry}` : ""}. Level: ${item.studyLevel || "not specified"}. Tuition: ${item.minTuitionAmount && item.currencyCode ? `${item.currencyCode} ${Math.round(Number(item.minTuitionAmount)).toLocaleString("en-IN")}` : "available on request"}. Intakes: ${item.intakesText || "check offerings"}. ${item.scholarshipAvailable ? "Scholarship available. " : ""}${item.appFeeWaiverAvailable ? "Application fee waiver available. " : ""}${requirements.length ? `Requirements include ${requirements.join(", ")}.` : ""}`,
      keywords: `${item.name} ${item.universityName} ${item.universityCountry || ""} ${item.studyLevel || ""} scholarship tuition intakes`
    });
  }

  let upserted = 0;
  await prisma.aiKnowledge.updateMany({
    where: {
      OR: [
        { sourceType: "search-country", sourceId: { in: Array.from(INVALID_COUNTRIES) } },
        { sourceType: "search-country-level", sourceId: { startsWith: "Search and Selection (Non-Tie-up):" } }
      ]
    },
    data: { active: false }
  });
  for (const record of records) {
    await prisma.aiKnowledge.upsert({
      where: {
        sourceType_sourceId: {
          sourceType: record.sourceType,
          sourceId: record.sourceId
        }
      },
      create: record,
      update: {
        title: record.title,
        url: record.url,
        summary: record.summary,
        keywords: record.keywords,
        active: true
      }
    });
    upserted += 1;
  }

  console.log(
    JSON.stringify(
      {
        upserted,
        sourceRecords: {
          colleges: colleges.length,
          exams: exams.length,
          courses: courses.length,
          careers: careers.length,
          communities: communities.length,
          communityPosts: communityPosts.length,
          posts: posts.length,
          countries: countryRows.length,
          countryLevels: countryLevelRows.length,
          programSamples: samplePrograms.length
        }
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
