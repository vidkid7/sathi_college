import { PageHero } from "@/components/ui/PageHero";
import { ReferenceVisual } from "@/components/ui/ReferenceVisual";
import { JsonLd } from "@/components/seo/JsonLd";
import { db } from "@/lib/db";
import { buildMetadata, breadcrumbJsonLd, itemListJsonLd, webPageJsonLd } from "@/lib/seo";
import { safeImageSrc } from "@/lib/utils";
import { ArrowRight, BadgeDollarSign, BriefcaseBusiness, Building2, Clock, GraduationCap, Layers, Search } from "lucide-react";
import Link from "next/link";
import { formatSearchMoney, importedEntityPath } from "@/lib/search-slugs";
import { careerImageFor, courseImageFor, realImageOr, universityLogoUrl } from "@/lib/real-images";

export const metadata = buildMetadata({
  title: "Courses and Career Pathways",
  description: "Explore career pathways and the related courses, universities and study levels that help students plan global education routes.",
  path: "/careers",
  keywords: ["career pathways", "career compass", "student careers", "courses by career", "study abroad careers", "global education planning"]
});

export const dynamic = "force-dynamic";

type CareersSearchParams = {
  search?: string;
  sector?: string;
};

function clean(value?: string) {
  return value?.trim() || "";
}

function uniqueStrings(values: Array<string | null | undefined>, limit = 14) {
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

function careersHref(current: CareersSearchParams, updates: Partial<CareersSearchParams>) {
  const next = {
    search: clean(current.search),
    sector: clean(current.sector),
    ...updates
  };
  const query = new URLSearchParams();
  Object.entries(next).forEach(([key, value]) => {
    const cleaned = clean(value);
    if (cleaned) query.set(key, cleaned);
  });
  const queryString = query.toString();
  return queryString ? `/careers?${queryString}` : "/careers";
}

function studyTermForSector(sector: string) {
  const text = sector.toLowerCase();
  if (/health|medical|doctor|nursing|pharma/.test(text)) return "Health";
  if (/finance|bank|account|commerce|secretary/.test(text)) return "Finance";
  if (/aviation|pilot|air/.test(text)) return "Aviation";
  if (/design|fashion|creative/.test(text)) return "Design";
  if (/law|legal/.test(text)) return "Law";
  if (/public|civil|government|police|army|defence|force|officer/.test(text)) return "Public Administration";
  if (/technology|computer|data|software|it/.test(text)) return "Computer Science";
  if (/education|teacher/.test(text)) return "Education";
  if (/business|management/.test(text)) return "Business";
  return sector;
}

export default async function CareersPage({ searchParams }: { searchParams?: CareersSearchParams }) {
  const search = clean(searchParams?.search);
  const sector = clean(searchParams?.sector);
  const current = { search, sector };
  let careers: any[] = [];
  let sectorRows: Array<{ sector: string | null }> = [];
  let relatedPrograms: any[] = [];

  try {
    [careers, sectorRows] = await Promise.all([
      db.career.findMany({
        where: {
          active: true,
          ...(sector ? { sector } : {}),
          ...(search
            ? {
                OR: [
                  { name: { contains: search } },
                  { sector: { contains: search } },
                  { description: { contains: search } }
                ]
              }
            : {})
        },
        orderBy: [{ featured: "desc" }, { sector: "asc" }, { name: "asc" }],
        take: 48
      }),
      db.career.findMany({
        where: { active: true },
        distinct: ["sector"],
        select: { sector: true },
        orderBy: { sector: "asc" }
      })
    ]);

    const studyTerm = search || (sector ? studyTermForSector(sector) : "");
    if (studyTerm) {
      relatedPrograms = await db.searchProgram.findMany({
        where: {
          OR: [
            { name: { contains: studyTerm } },
            { universityName: { contains: studyTerm } },
            { studyLevel: { contains: studyTerm } },
            { searchText: { contains: studyTerm } }
          ]
        },
        orderBy: [{ scholarshipAvailable: "desc" }, { appFeeWaiverAvailable: "desc" }, { minTuitionAmount: "asc" }, { name: "asc" }],
        take: 12,
        select: {
          id: true,
          sourceId: true,
          name: true,
          universitySourceId: true,
          universityName: true,
          universityCountry: true,
          studyLevel: true,
          durationMonths: true,
          minTuitionAmount: true,
          tuitionFeeText: true,
          currencyCode: true,
          scholarshipAvailable: true,
          isStem: true
        }
      });
    }
  } catch {
    careers = [];
    sectorRows = [];
    relatedPrograms = [];
  }

  const sectors = uniqueStrings(sectorRows.map((row) => row.sector));
  const itemListItems = [
    ...careers.map((career) => ({
      name: career.name,
      path: `/careers/${career.slug}`,
      description: career.description
    })),
    ...relatedPrograms.slice(0, 12).map((program) => ({
      name: program.name,
      path: importedEntityPath("/courses", program.sourceId, program.name),
      description: `${program.name} at ${program.universityName}.`
    }))
  ];
  const filterSummary = [search ? `"${search}"` : null, sector || null].filter(Boolean);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/careers",
            name: "Popular careers",
            description: "Browse career options and sectors managed from the SathiCollege admin panel."
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Careers", path: "/careers" }
          ]),
          itemListJsonLd({
            path: "/careers",
            name: "Careers and related study paths listed on SathiCollege",
            items: itemListItems
          })
        ]}
      />
      <PageHero
        eyebrow="Career compass"
        title={<>Popular <span className="gradient-text">Careers</span></>}
        description="Compare career paths across public service, healthcare, defence, finance, aviation, design and related study programs."
      />
      <section className="container py-12">
        <div className="reference-panel mb-8 grid gap-4 p-4 md:grid-cols-[1fr_auto]">
          <div className="grid gap-3">
            <div className="flex flex-wrap gap-2">
              <Link
                href={careersHref(current, { sector: "" })}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  !sector
                    ? "border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
                    : "border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-elev))]"
                }`}
              >
                All Careers
              </Link>
              {sectors.map((item) => (
                <Link
                  key={item}
                  href={careersHref(current, { sector: item })}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                    sector === item
                      ? "border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
                      : "border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-elev))]"
                  }`}
                >
                  {item}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-[rgb(var(--fg-muted))]">
              <Search className="h-4 w-4" />
              {filterSummary.length
                ? `Showing career results for ${filterSummary.join(" • ")}`
                : "Browse admin-managed career paths by sector"}
            </div>
          </div>
          <Link href={search ? `/search-program?q=${encodeURIComponent(search)}` : "/search-program"} className="btn-primary">
            <GraduationCap className="h-4 w-4" />
            Find Related Programs
          </Link>
        </div>

        {careers.length === 0 && relatedPrograms.length === 0 ? (
          <div className="reference-panel grid place-items-center p-10 text-center">
            <ReferenceVisual name="dashboard" className="h-48 w-48 object-contain opacity-80" />
            <p className="mt-4 font-semibold">No careers found.</p>
            <p className="mt-1 text-sm text-[rgb(var(--fg-muted))]">Try another sector or add careers from the admin panel.</p>
          </div>
        ) : (
          <div className="grid gap-10">
            {careers.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {careers.map((career) => {
                  const image = safeImageSrc(realImageOr(career.image, careerImageFor({ name: career.name, sector: career.sector })), "");
                  return (
                    <Link key={career.id} href={`/careers/${career.slug}`} className="soft-card group flex h-full flex-col overflow-hidden">
                      <div className="h-36 bg-gradient-to-br from-teal-50 to-blue-100 dark:from-slate-900 dark:to-teal-950">
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={image} alt={`${career.name} career`} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" decoding="async" />
                        ) : (
                          <ReferenceVisual name="dashboard" className="h-full w-full object-contain p-5 transition duration-300 group-hover:scale-105" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-start justify-between gap-3">
                          <span className="icon-tile"><BriefcaseBusiness className="h-5 w-5" /></span>
                          <span className="rounded-lg bg-[rgb(var(--primary))]/10 px-2.5 py-1 text-xs font-bold text-[rgb(var(--primary))]">{career.sector}</span>
                        </div>
                        <h3 className="mt-3 line-clamp-2 break-words font-display text-lg font-bold leading-snug">{career.name}</h3>
                        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-[rgb(var(--fg-muted))]">{career.description}</p>
                        <div className="mt-4 flex items-center justify-between border-t border-[rgb(var(--border))]/70 pt-4 text-sm">
                          <span className="flex items-center gap-1 text-[rgb(var(--fg-muted))]"><Layers className="h-4 w-4" /> Sector</span>
                          <span className="font-semibold">{career.featured ? "Featured" : "Listed"}</span>
                        </div>
                        <span className="subtle-link mt-4">View Career <ArrowRight className="h-4 w-4" /></span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {relatedPrograms.length > 0 && (
              <div>
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--primary))]">Study paths</p>
                    <h2 className="font-display text-2xl font-extrabold">Related programs for this career direction</h2>
                  </div>
                  <Link href={`/search-program?q=${encodeURIComponent(search || studyTermForSector(sector))}`} className="subtle-link">
                    Explore all programs <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedPrograms.map((program) => {
                    const programImage = safeImageSrc(courseImageFor({ name: program.name, category: program.studyLevel }), "");
                    const logo = universityLogoUrl({ sourceId: program.universitySourceId, name: program.universityName });
                    return (
                      <Link key={`career-program-${program.sourceId}`} href={importedEntityPath("/courses", program.sourceId, program.name)} className="soft-card group flex h-full flex-col overflow-hidden">
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
                            <span className="icon-tile"><GraduationCap className="h-5 w-5" /></span>
                            <span className="rounded-lg bg-[rgb(var(--primary))]/10 px-2.5 py-1 text-xs font-bold text-[rgb(var(--primary))]">{program.studyLevel || "Program"}</span>
                          </div>
                          <h3 className="mt-3 line-clamp-2 break-words font-display text-lg font-bold leading-snug">{program.name}</h3>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-[rgb(var(--fg-muted))]">
                            <span className="badge min-w-0 max-w-full"><Building2 className="h-3 w-3 shrink-0" /> <span className="truncate">{program.universityName}</span></span>
                            {program.durationMonths && <span className="badge"><Clock className="h-3 w-3" /> {program.durationMonths} months</span>}
                            {program.scholarshipAvailable && <span className="badge"><BadgeDollarSign className="h-3 w-3" /> Scholarship</span>}
                          </div>
                          <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-[rgb(var(--fg-muted))]">
                            {[program.universityCountry, program.isStem ? "STEM program" : null].filter(Boolean).join(" • ")}
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
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}
