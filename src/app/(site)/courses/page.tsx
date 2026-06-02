import { PageHero } from "@/components/ui/PageHero";
import { ReferenceVisual } from "@/components/ui/ReferenceVisual";
import { JsonLd } from "@/components/seo/JsonLd";
import { db } from "@/lib/db";
import { buildMetadata, breadcrumbJsonLd, itemListJsonLd, webPageJsonLd } from "@/lib/seo";
import { safeImageSrc } from "@/lib/utils";
import { ArrowRight, BadgeDollarSign, Building2, ClipboardCheck, Clock, Globe2, GraduationCap, Layers, Search } from "lucide-react";
import Link from "next/link";
import { formatSearchMoney, importedEntityPath } from "@/lib/search-slugs";
import { courseImageFor, realImageOr, universityLogoUrl } from "@/lib/real-images";

export const metadata = buildMetadata({
  title: "Global Courses and Programs",
  description: "Browse global courses and study abroad programs by country, study level, tuition, university, duration, intake and scholarship availability.",
  path: "/courses",
  keywords: ["global courses", "study abroad programs", "course finder", "MBA abroad", "bachelor degree abroad", "masters programs", "scholarship courses"]
});

export const dynamic = "force-dynamic";

type CoursesSearchParams = {
  search?: string;
  category?: string;
  level?: string;
  country?: string;
};

function clean(value?: string) {
  return value?.trim() || "";
}

function uniqueStrings(values: Array<string | null | undefined>, limit = 12) {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const value of values) {
    const item = clean(value || undefined);
    if (!item || seen.has(item.toLowerCase())) continue;
    seen.add(item.toLowerCase());
    unique.push(item);
    if (unique.length >= limit) break;
  }

  return unique;
}

function levelAliases(level: string) {
  const normalized = level.toLowerCase();
  if (normalized.includes("undergraduate")) return [level, "UG", "Under Graduate"];
  if (normalized.includes("postgraduate") || normalized.includes("graduate")) return [level, "PG", "Post Graduate"];
  if (normalized === "ug") return [level, "Undergraduate"];
  if (normalized === "pg") return [level, "Postgraduate", "Graduate"];
  return [level];
}

function coursesHref(current: CoursesSearchParams, updates: Partial<CoursesSearchParams>) {
  const next = {
    search: clean(current.search),
    category: clean(current.category),
    level: clean(current.level),
    country: clean(current.country),
    ...updates
  };
  const query = new URLSearchParams();
  Object.entries(next).forEach(([key, value]) => {
    const cleaned = clean(value);
    if (cleaned) query.set(key, cleaned);
  });
  const queryString = query.toString();
  return queryString ? `/courses?${queryString}` : "/courses";
}

export default async function CoursesPage({ searchParams }: { searchParams?: CoursesSearchParams }) {
  const search = clean(searchParams?.search);
  const category = clean(searchParams?.category);
  const level = clean(searchParams?.level);
  const country = clean(searchParams?.country);
  const current = { search, category, level, country };
  let courses: any[] = [];
  let importedPrograms: any[] = [];
  let categoryRows: Array<{ category: string | null }> = [];
  let courseLevelRows: Array<{ level: string | null }> = [];
  let programLevelRows: Array<{ studyLevel: string | null }> = [];
  let countryRows: Array<{ universityCountry: string | null }> = [];

  try {
    const courseWhere: any = {
      active: true,
      ...(category ? { category } : {}),
      ...(level ? { level: { in: levelAliases(level) } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { category: { contains: search } },
              { level: { contains: search } },
              { description: { contains: search } }
            ]
          }
        : {})
    };
    const programTermFilters = [search, category]
      .filter(Boolean)
      .map((term) => ({
        OR: [
          { name: { contains: term } },
          { universityName: { contains: term } },
          { studyLevel: { contains: term } },
          { searchText: { contains: term } }
        ]
      }));

    [courses, importedPrograms, categoryRows, courseLevelRows, programLevelRows, countryRows] = await Promise.all([
      db.course.findMany({
        where: courseWhere,
        orderBy: [{ featured: "desc" }, { category: "asc" }, { name: "asc" }],
        take: 24
      }),
      db.searchProgram.findMany({
        where: {
          ...(programTermFilters.length ? { AND: programTermFilters } : {}),
          ...(level ? { studyLevel: level } : {}),
          ...(country ? { universityCountry: country } : {})
        },
        orderBy: [{ scholarshipAvailable: "desc" }, { appFeeWaiverAvailable: "desc" }, { qsRanking: "asc" }, { name: "asc" }],
        take: 72,
        select: {
          id: true,
          sourceId: true,
          name: true,
          universitySourceId: true,
          universityName: true,
          universityCountry: true,
          studyLevel: true,
          durationMonths: true,
          intakesText: true,
          minTuitionAmount: true,
          tuitionFeeText: true,
          currencyCode: true,
          scholarshipAvailable: true,
          appFeeWaiverAvailable: true,
          isStem: true,
          isOnline: true
        }
      }),
      db.course.findMany({
        where: { active: true },
        distinct: ["category"],
        select: { category: true },
        orderBy: { category: "asc" }
      }),
      db.course.findMany({
        where: { active: true },
        distinct: ["level"],
        select: { level: true },
        orderBy: { level: "asc" }
      }),
      db.searchProgram.findMany({
        where: { studyLevel: { not: null } },
        distinct: ["studyLevel"],
        select: { studyLevel: true },
        orderBy: { studyLevel: "asc" },
        take: 16
      }),
      db.searchProgram.findMany({
        where: { universityCountry: { not: null } },
        distinct: ["universityCountry"],
        select: { universityCountry: true },
        orderBy: { universityCountry: "asc" },
        take: 16
      })
    ]);
  } catch {
    courses = [];
    importedPrograms = [];
    categoryRows = [];
    courseLevelRows = [];
    programLevelRows = [];
    countryRows = [];
  }

  const categories = uniqueStrings(categoryRows.map((row) => row.category), 10);
  const levels = uniqueStrings([...courseLevelRows.map((row) => row.level), ...programLevelRows.map((row) => row.studyLevel)], 8);
  const countries = uniqueStrings(countryRows.map((row) => row.universityCountry), 10);
  const itemListItems = [
    ...courses.slice(0, 20).map((course) => ({
      name: course.name,
      path: `/courses/${course.slug}`,
      description: course.description
    })),
    ...importedPrograms.slice(0, 30).map((program) => ({
      name: program.name,
      path: importedEntityPath("/courses", program.sourceId, program.name),
      description: `${program.name} at ${program.universityName}.`
    }))
  ];
  const filterSummary = [
    search ? `"${search}"` : null,
    category || null,
    level || null,
    country || null
  ].filter(Boolean);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/courses",
            name: "Popular courses",
            description: "Browse courses and specializations managed from the SathiCollege admin panel."
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Courses", path: "/courses" }
          ]),
          itemListJsonLd({
            path: "/courses",
            name: "Courses and programs listed on SathiCollege",
            items: itemListItems
          })
        ]}
      />
      <PageHero
        eyebrow="Course finder"
        title={<>Courses & <span className="gradient-text">Programs</span></>}
        description="Explore admin-managed course guides plus imported program data connected to universities, tuition, intakes and requirements."
      />
      <section className="container py-12">
        <div className="reference-panel mb-8 grid gap-5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-[rgb(var(--fg-muted))]">
              <Search className="h-4 w-4" />
              {filterSummary.length
                ? `Showing course results for ${filterSummary.join(" • ")}`
                : "Browse admin courses and imported university programs"}
            </div>
            <Link href={search ? `/search-program?q=${encodeURIComponent(search)}` : "/search-program"} className="btn-primary">
              <Search className="h-4 w-4" />
              Open Program Search
            </Link>
          </div>

          <div className="grid gap-4">
            <div className="flex flex-wrap gap-2">
              <Link
                href={coursesHref(current, { category: "", level: "", country: "" })}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  !category && !level && !country
                    ? "border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
                    : "border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-elev))]"
                }`}
              >
                All Courses
              </Link>
              {categories.map((item) => (
                <Link
                  key={item}
                  href={coursesHref(current, { category: item })}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                    category === item
                      ? "border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
                      : "border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-elev))]"
                  }`}
                >
                  {item}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {levels.map((item) => (
                <Link
                  key={item}
                  href={coursesHref(current, { level: item })}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                    level === item
                      ? "border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
                      : "border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-elev))]"
                  }`}
                >
                  <GraduationCap className="mr-1 inline h-3.5 w-3.5" />
                  {item}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {countries.map((item) => (
                <Link
                  key={item}
                  href={coursesHref(current, { country: item })}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                    country === item
                      ? "border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
                      : "border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-elev))]"
                  }`}
                >
                  <Globe2 className="mr-1 inline h-3.5 w-3.5" />
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {courses.length === 0 && importedPrograms.length === 0 ? (
          <div className="reference-panel grid place-items-center p-10 text-center">
            <ReferenceVisual name="books" className="h-48 w-48 object-contain opacity-80" />
            <p className="mt-4 font-semibold">No courses found.</p>
            <p className="mt-1 text-sm text-[rgb(var(--fg-muted))]">Try another filter or use the full program search.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const image = safeImageSrc(realImageOr(course.image, courseImageFor({ name: course.name, category: course.category })), "");
              return (
                <Link key={course.id} href={`/courses/${course.slug}`} className="soft-card group flex h-full flex-col overflow-hidden">
                  <div className="h-36 bg-gradient-to-br from-emerald-50 to-sky-100 dark:from-slate-900 dark:to-emerald-950">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt={`${course.name} course`} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" decoding="async" />
                    ) : (
                      <ReferenceVisual name="books" className="h-full w-full object-contain p-5 transition duration-300 group-hover:scale-105" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="icon-tile"><ClipboardCheck className="h-5 w-5" /></span>
                      <span className="rounded-lg bg-[rgb(var(--primary))]/10 px-2.5 py-1 text-xs font-bold text-[rgb(var(--primary))]">{course.level}</span>
                    </div>
                    <h3 className="mt-3 line-clamp-2 break-words font-display text-lg font-bold leading-snug">{course.name}</h3>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-[rgb(var(--fg-muted))]">
                      <span className="badge"><Layers className="h-3 w-3" /> {course.category}</span>
                      {course.duration && <span className="badge"><Clock className="h-3 w-3" /> {course.duration}</span>}
                    </div>
                    <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-[rgb(var(--fg-muted))]">{course.description}</p>
                    <span className="subtle-link mt-4">View Course <ArrowRight className="h-4 w-4" /></span>
                  </div>
                </Link>
              );
            })}
            {importedPrograms.map((program) => {
              const programImage = safeImageSrc(courseImageFor({ name: program.name, category: program.studyLevel }), "");
              const logo = universityLogoUrl({ sourceId: program.universitySourceId, name: program.universityName });
              return (
                <Link key={`search-program-${program.sourceId}`} href={importedEntityPath("/courses", program.sourceId, program.name)} className="soft-card group flex h-full flex-col overflow-hidden">
                  <div className="relative h-36 overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-slate-900 dark:to-blue-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={programImage} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logo} alt={`${program.universityName} logo`} className="absolute left-3 top-3 h-11 w-11 rounded-lg border border-white/80 bg-white object-contain p-2 shadow-lg" loading="lazy" decoding="async" />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="icon-tile"><ClipboardCheck className="h-5 w-5" /></span>
                      <span className="rounded-lg bg-[rgb(var(--primary))]/10 px-2.5 py-1 text-xs font-bold text-[rgb(var(--primary))]">{program.studyLevel || "Program"}</span>
                    </div>
                    <h3 className="mt-3 line-clamp-2 break-words font-display text-lg font-bold leading-snug">{program.name}</h3>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-[rgb(var(--fg-muted))]">
                      <span className="badge min-w-0 max-w-full"><Building2 className="h-3 w-3 shrink-0" /> <span className="truncate">{program.universityName}</span></span>
                      {program.durationMonths && <span className="badge"><Clock className="h-3 w-3" /> {program.durationMonths} months</span>}
                      {program.scholarshipAvailable && <span className="badge"><BadgeDollarSign className="h-3 w-3" /> Scholarship</span>}
                    </div>
                    <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-[rgb(var(--fg-muted))]">
                      {[program.universityCountry, program.intakesText ? `Intakes: ${program.intakesText}` : null, program.isStem ? "STEM program" : null, program.isOnline ? "Online option" : null].filter(Boolean).join(" • ")}
                    </p>
                    <div className="mt-4 flex min-w-0 items-center justify-between gap-3 border-t border-[rgb(var(--border))]/70 pt-4 text-sm">
                      <span className="text-[rgb(var(--fg-muted))]">Yearly tuition</span>
                      <span className="truncate text-right font-semibold">{formatSearchMoney(program.minTuitionAmount, program.currencyCode, program.tuitionFeeText)}</span>
                    </div>
                    <span className="subtle-link mt-4">View Program <ArrowRight className="h-4 w-4" /></span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
