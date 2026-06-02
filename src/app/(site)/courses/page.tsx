import { PageHero } from "@/components/ui/PageHero";
import { ReferenceVisual } from "@/components/ui/ReferenceVisual";
import { JsonLd } from "@/components/seo/JsonLd";
import { db } from "@/lib/db";
import { buildMetadata, breadcrumbJsonLd, itemListJsonLd, webPageJsonLd } from "@/lib/seo";
import { safeImageSrc } from "@/lib/utils";
import { ArrowRight, BadgeDollarSign, Building2, ClipboardCheck, Clock, Layers, Search } from "lucide-react";
import Link from "next/link";
import { formatSearchMoney, importedEntityPath } from "@/lib/search-slugs";
import { courseImageFor, realImageOr, universityLogoUrl } from "@/lib/real-images";

export const metadata = buildMetadata({
  title: "Popular Courses",
  description: "Browse admin-managed courses, degrees, specializations, duration and stream details on SathiCollege.",
  path: "/courses",
  keywords: ["popular courses", "B.Tech", "MBA", "BCA", "B.Pharma", "course finder"]
});

export const dynamic = "force-dynamic";

export default async function CoursesPage({ searchParams }: { searchParams?: { search?: string; level?: string; country?: string } }) {
  const search = searchParams?.search?.trim();
  const level = searchParams?.level?.trim();
  const country = searchParams?.country?.trim();
  let courses: any[] = [];
  let importedPrograms: any[] = [];
  try {
    [courses, importedPrograms] = await Promise.all([
      db.course.findMany({
        where: {
          active: true,
          ...(search
            ? {
                OR: [
                  { name: { contains: search } },
                  { category: { contains: search } },
                  { level: { contains: search } }
                ]
              }
            : {})
        },
        orderBy: [{ featured: "desc" }, { name: "asc" }],
        take: 24
      }),
      db.searchProgram.findMany({
        where: {
          ...(search
            ? {
                OR: [
                  { name: { contains: search } },
                  { universityName: { contains: search } },
                  { searchText: { contains: search } }
                ]
              }
            : {}),
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
      })
    ]);
  } catch {
    courses = [];
    importedPrograms = [];
  }
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
        description="Explore admin-managed course guides plus imported CourseFinder programs connected to universities, tuition, intakes and requirements."
      />
      <section className="container py-12">
        <div className="reference-panel mb-8 grid items-center gap-4 p-4 md:grid-cols-[1fr_auto]">
          <div className="flex flex-wrap gap-2">
            {[
              { label: "All", href: "/courses" },
              { label: "Undergraduate", href: "/courses?level=Undergraduate" },
              { label: "Postgraduate", href: "/courses?level=Postgraduate" },
              { label: "United Kingdom", href: "/courses?country=United%20Kingdom" },
              { label: "United States", href: "/courses?country=United%20States%20of%20America" }
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  (item.href.includes(String(level || country)) && (level || country)) || (item.href === "/courses" && !level && !country)
                    ? "border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
                    : "border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-elev))]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <Link href={search ? `/search-program?q=${encodeURIComponent(search)}` : "/search-program"} className="btn-primary">
            <Search className="h-4 w-4" />
            Open Program Search
          </Link>
        </div>
        {courses.length === 0 && importedPrograms.length === 0 ? (
          <div className="reference-panel grid place-items-center p-10 text-center">
            <ReferenceVisual name="books" className="h-48 w-48 object-contain opacity-80" />
            <p className="mt-4 font-semibold">No courses found.</p>
            <p className="mt-1 text-sm text-[rgb(var(--fg-muted))]">Try another search or use the full program search.</p>
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
