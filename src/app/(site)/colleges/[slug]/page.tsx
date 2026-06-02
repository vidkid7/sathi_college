import { PageHero } from "@/components/ui/PageHero";
import { GlassCard } from "@/components/ui/GlassCard";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatINR, safeImageSrc } from "@/lib/utils";
import { ArrowRight, BookOpenCheck, Star, MapPin, Building2 } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { ReferenceVisual } from "@/components/ui/ReferenceVisual";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, educationalOrganizationJsonLd, webPageJsonLd } from "@/lib/seo";
import { formatCompactCount, formatSearchMoney, importedEntityPath, sourceIdFromSlug } from "@/lib/search-slugs";
import { realImageOr, universityCampusImage, universityLogoUrl } from "@/lib/real-images";
import Link from "next/link";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const sourceId = sourceIdFromSlug(params.slug);
  if (sourceId) {
    const university = await db.searchUniversity.findUnique({ where: { sourceId } });
    if (university) {
      return buildMetadata({
        title: university.name,
        description: `Explore ${university.programCount.toLocaleString("en-IN")} searchable programs from ${university.name}.`,
        path: importedEntityPath("/colleges", university.sourceId, university.name),
        keywords: [university.name, `${university.name} programs`, university.country || "university search"]
      });
    }
  }
  const c = await db.college.findUnique({ where: { slug: params.slug } });
  if (!c) return buildMetadata({ title: "College" });
  return buildMetadata({
    title: c.name,
    description: c.description,
    path: `/colleges/${c.slug}`,
    image: c.heroImage,
    keywords: [c.name, `${c.name} fees`, `${c.name} cutoffs`, `${c.city} engineering college`]
  });
}

export default async function CollegeDetail({ params }: { params: { slug: string } }) {
  const sourceId = sourceIdFromSlug(params.slug);
  if (sourceId) {
    const university = await db.searchUniversity.findUnique({
      where: { sourceId },
      include: {
        programs: {
          orderBy: [{ scholarshipAvailable: "desc" }, { minTuitionAmount: "asc" }, { name: "asc" }],
          take: 12,
          select: {
            sourceId: true,
            name: true,
            studyLevel: true,
            durationMonths: true,
            minTuitionAmount: true,
            currencyCode: true,
            intakesText: true,
            scholarshipAvailable: true,
            appFeeWaiverAvailable: true,
            isStem: true
          }
        }
      }
    });
    if (!university) notFound();
    const location = [university.city, university.state, university.country].filter(Boolean).join(", ");
    const logo = universityLogoUrl({ sourceId: university.sourceId, name: university.name });
    const campusImage = safeImageSrc(universityCampusImage(university), "");
    return (
      <>
        <JsonLd
          data={[
            webPageJsonLd({
              path: importedEntityPath("/colleges", university.sourceId, university.name),
              name: university.name,
              description: `Search programs, intakes, tuition and requirements for ${university.name}.`
            }),
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Colleges", path: "/colleges" },
              { name: university.name, path: importedEntityPath("/colleges", university.sourceId, university.name) }
            ]),
            educationalOrganizationJsonLd({
              path: importedEntityPath("/colleges", university.sourceId, university.name),
              name: university.name,
              description: `${university.name} has ${university.programCount.toLocaleString("en-IN")} searchable programs in the local CourseFinder database.`,
              city: university.city || "",
              state: university.state || university.country || "",
              rating: 0
            })
          ]}
        />
        <PageHero eyebrow={location || "CourseFinder database"} title={<>{university.name}</>} description={`Explore ${university.programCount.toLocaleString("en-IN")} programs and ${university.offeringCount.toLocaleString("en-IN")} intake/year offerings imported from the CourseFinder dataset.`}>
          <div className="flex flex-wrap gap-2">
            <span className="badge"><Building2 className="h-3 w-3" /> {formatCompactCount(university.programCount)} programs</span>
            <span className="badge"><BookOpenCheck className="h-3 w-3" /> {formatCompactCount(university.offeringCount)} offerings</span>
            {university.country && <span className="badge"><MapPin className="h-3 w-3" /> {university.country}</span>}
          </div>
        </PageHero>
        <section className="container grid gap-6 py-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <GlassCard className="lg:col-span-2" hover={false}>
            <div className="relative mb-5 h-56 overflow-hidden rounded-lg border border-white/60 bg-gradient-to-br from-blue-50 to-sky-100 dark:border-white/10 dark:from-slate-900 dark:to-blue-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={campusImage} alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-slate-950/5 to-transparent" />
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt={`${university.name} logo`} className="absolute bottom-4 left-4 h-16 w-16 rounded-xl border border-white/80 bg-white object-contain p-3 shadow-xl" loading="eager" decoding="async" />
              ) : null}
            </div>
            <h2 className="font-display text-2xl font-bold">Programs at {university.name}</h2>
            <p className="mt-3 leading-7 text-[rgb(var(--fg-muted))]">
              This page is connected to the imported database. Use the search system to filter this university by program name, study level, intake, tuition and requirements.
            </p>
            <div className="mt-6 grid gap-3">
              {university.programs.map((program) => (
                <Link key={program.sourceId} href={importedEntityPath("/courses", program.sourceId, program.name)} className="soft-card grid min-w-0 gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-lg sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 break-words font-bold leading-snug">{program.name}</h3>
                    <p className="mt-1 min-w-0 truncate text-xs text-[rgb(var(--fg-muted))]">
                      {[program.studyLevel, program.durationMonths ? `${program.durationMonths} Month(s)` : null, program.intakesText ? `Intakes: ${program.intakesText}` : null].filter(Boolean).join(" • ")}
                    </p>
                  </div>
                  <div className="flex min-w-0 items-center justify-between gap-3 text-sm sm:justify-end">
                    <span className="truncate font-semibold sm:max-w-40">{formatSearchMoney(program.minTuitionAmount, program.currencyCode)}</span>
                    <ArrowRight className="h-4 w-4 text-[rgb(var(--primary))]" />
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>
          <GlassCard hover={false}>
            <h3 className="font-display text-lg font-bold">Database facts</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="soft-card flex justify-between gap-4 p-3"><span className="text-[rgb(var(--fg-muted))]">Country</span><span className="text-right font-semibold">{university.country || "Unknown"}</span></li>
              <li className="soft-card flex justify-between gap-4 p-3"><span className="text-[rgb(var(--fg-muted))]">City</span><span className="text-right font-semibold">{university.city || "Unknown"}</span></li>
              <li className="soft-card flex justify-between gap-4 p-3"><span className="text-[rgb(var(--fg-muted))]">Programs</span><span className="font-semibold">{university.programCount.toLocaleString("en-IN")}</span></li>
              <li className="soft-card flex justify-between gap-4 p-3"><span className="text-[rgb(var(--fg-muted))]">Offerings</span><span className="font-semibold">{university.offeringCount.toLocaleString("en-IN")}</span></li>
            </ul>
            <Link href={`/search-program?university=${encodeURIComponent(university.name)}`} className="btn-primary mt-5 w-full justify-center">
              Search This University
            </Link>
          </GlassCard>
        </section>
      </>
    );
  }

  const college = await db.college.findUnique({ where: { slug: params.slug } });
  if (!college) notFound();
  const heroImage = safeImageSrc(realImageOr(college.heroImage, universityCampusImage()), "");

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: `/colleges/${college.slug}`,
            name: college.name,
            description: college.description
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Colleges", path: "/colleges" },
            { name: college.name, path: `/colleges/${college.slug}` }
          ]),
          educationalOrganizationJsonLd({
            path: `/colleges/${college.slug}`,
            name: college.name,
            description: college.description,
            image: college.heroImage,
            city: college.city,
            state: college.state,
            rating: college.rating
          })
        ]}
      />
      <PageHero
        eyebrow={`${college.city}, ${college.state}`}
        title={<>{college.name}</>}
        description={college.description}
      >
        <div className="flex flex-wrap gap-2">
          <span className="badge"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {college.rating.toFixed(1)}</span>
          <span className="badge"><Building2 className="h-3 w-3" /> {college.type}</span>
          <span className="badge"><MapPin className="h-3 w-3" /> {college.state}</span>
        </div>
      </PageHero>
      <section className="container grid gap-6 py-12 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImage} alt={`${college.name} logo`} className="mb-5 h-56 w-full rounded-lg bg-white/80 object-contain p-8 shadow-inner dark:bg-white/90" loading="eager" decoding="async" />
          ) : (
            <ReferenceVisual name="campus" className="mb-5 h-56 w-full rounded-lg bg-gradient-to-br from-blue-50 to-sky-100 object-contain p-5 dark:from-slate-900 dark:to-blue-950" />
          )}
          <h2 className="font-display text-2xl font-bold">About {college.name}</h2>
          <p className="mt-3 leading-7 text-[rgb(var(--fg-muted))]">{college.description}</p>
        </GlassCard>
        <GlassCard>
          <h3 className="font-display text-lg font-bold">Quick facts</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="soft-card flex justify-between p-3"><span className="text-[rgb(var(--fg-muted))]">Annual fees</span><span className="font-semibold">{formatINR(college.fees)}</span></li>
            <li className="soft-card flex justify-between p-3"><span className="text-[rgb(var(--fg-muted))]">Type</span><span className="font-semibold">{college.type}</span></li>
            <li className="soft-card flex justify-between p-3"><span className="text-[rgb(var(--fg-muted))]">Location</span><span className="font-semibold">{college.city}</span></li>
            <li className="soft-card flex justify-between p-3"><span className="text-[rgb(var(--fg-muted))]">Rating</span><span className="font-semibold">{college.rating.toFixed(1)}/5</span></li>
          </ul>
        </GlassCard>
      </section>
    </>
  );
}
