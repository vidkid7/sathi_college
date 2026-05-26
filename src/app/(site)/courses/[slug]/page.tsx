import { PageHero } from "@/components/ui/PageHero";
import { GlassCard } from "@/components/ui/GlassCard";
import { ReferenceVisual } from "@/components/ui/ReferenceVisual";
import { JsonLd } from "@/components/seo/JsonLd";
import { db } from "@/lib/db";
import { buildMetadata, breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo";
import { safeImageSrc } from "@/lib/utils";
import { BadgeDollarSign, BookOpenCheck, Building2, CalendarDays, CheckCircle2, Clock, GraduationCap, Layers, MapPin, Trophy } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatSearchMoney, importedEntityPath, sourceIdFromSlug } from "@/lib/search-slugs";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const sourceId = sourceIdFromSlug(params.slug);
  if (sourceId) {
    const program = await db.searchProgram.findUnique({ where: { sourceId } });
    if (program) {
      return buildMetadata({
        title: program.name,
        description: `${program.name} at ${program.universityName}. Explore tuition, intakes, requirements and similar programs.`,
        path: importedEntityPath("/courses", program.sourceId, program.name),
        keywords: [program.name, `${program.name} programs`, program.universityName, program.studyLevel || "course finder"]
      });
    }
  }
  const course = await db.course.findUnique({ where: { slug: params.slug } });
  if (!course || !course.active) return buildMetadata({ title: "Course" });
  return buildMetadata({
    title: course.name,
    description: course.description,
    path: `/courses/${course.slug}`,
    image: course.image,
    keywords: [course.name, `${course.name} colleges`, `${course.category} courses`, course.level]
  });
}

export default async function CourseDetail({ params }: { params: { slug: string } }) {
  const sourceId = sourceIdFromSlug(params.slug);
  if (sourceId) {
    const program = await db.searchProgram.findUnique({
      where: { sourceId },
      include: {
        offerings: {
          orderBy: [{ extractionYear: "asc" }, { amount: "asc" }],
          take: 12
        },
        university: true
      }
    });
    if (!program) notFound();
    const flags = [
      program.scholarshipAvailable ? "Scholarship Available" : null,
      program.appFeeWaiverAvailable ? "Application Fee Waiver" : null,
      program.isStem ? "STEM Program" : null,
      program.isOnline ? "Online Program" : null,
      program.internshipAvailable ? "Co-op / Internship" : null,
      program.withoutEnglishProficiency || program.isMoiWaiver ? "English Waiver" : null
    ].filter(Boolean);
    const requirements = [
      program.ieltsRequired ? `IELTS ${program.ieltsOverall || ""}`.trim() : null,
      program.toeflRequired ? `TOEFL ${program.toeflScore || ""}`.trim() : null,
      program.pteRequired ? `PTE ${program.pteScore || ""}`.trim() : null,
      program.detRequired ? `DET ${program.detScore || ""}`.trim() : null,
      program.greRequired ? `GRE ${program.greScore || ""}`.trim() : null,
      program.gmatRequired ? `GMAT ${program.gmatScore || ""}`.trim() : null
    ].filter(Boolean);
    const rankings = [
      program.usNewsRanking ? `${program.usNewsRanking} in US News Ranking` : null,
      program.qsRanking ? `${program.qsRanking} in QS World Ranking` : null,
      program.webometricsNationalRank ? `${program.webometricsNationalRank} in Webometrics National` : null,
      program.webometricsWorldRank ? `${program.webometricsWorldRank} in Webometrics World` : null
    ].filter(Boolean);
    return (
      <>
        <JsonLd
          data={[
            webPageJsonLd({
              path: importedEntityPath("/courses", program.sourceId, program.name),
              name: program.name,
              description: `${program.name} at ${program.universityName}.`,
              type: "Course"
            }),
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Courses", path: "/courses" },
              { name: program.name, path: importedEntityPath("/courses", program.sourceId, program.name) }
            ])
          ]}
        />
        <PageHero eyebrow={`${program.studyLevel || "Program"} • ${program.universityCountry || "Global"}`} title={<>{program.name}</>} description={`A searchable CourseFinder database program at ${program.universityName}. Review tuition, intakes, requirements, rankings and database offerings.`}>
          <div className="flex flex-wrap gap-2">
            <span className="badge"><Building2 className="h-3 w-3" /> {program.universityName}</span>
            {program.durationMonths && <span className="badge"><Clock className="h-3 w-3" /> {program.durationMonths} Month(s)</span>}
            {program.intakesText && <span className="badge"><CalendarDays className="h-3 w-3" /> {program.intakesText}</span>}
          </div>
        </PageHero>
        <section className="container grid gap-6 py-12 lg:grid-cols-[minmax(0,1fr)_340px]">
          <GlassCard hover={false}>
            <ReferenceVisual name="books" className="mb-5 h-60 w-full rounded-lg bg-gradient-to-br from-blue-50 to-cyan-100 object-contain p-5 dark:from-slate-900 dark:to-blue-950" />
            <div className="flex flex-wrap gap-2">
              {flags.map((flag) => (
                <span key={flag} className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  {flag}
                </span>
              ))}
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold">About this program</h2>
            <p className="mt-3 leading-7 text-[rgb(var(--fg-muted))]">
              {program.entryRequirement || program.remarks || `This imported program is part of the local CourseFinder dataset and is connected to ${program.offerings.length.toLocaleString("en-IN")} offering records in this detail view.`}
            </p>
            {program.scholarshipDetail && (
              <div className="mt-5 rounded-lg bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-800 dark:text-emerald-200">
                <BadgeDollarSign className="mb-2 h-5 w-5" />
                {program.scholarshipDetail}
              </div>
            )}
            <h3 className="mt-8 font-display text-xl font-bold">Offerings and intakes</h3>
            <div className="mt-4 grid gap-3">
              {program.offerings.map((offering) => (
                <div key={offering.id} className="soft-card grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="font-bold">{offering.extractionYear} {offering.extractionCountryFilterLabel ? `for ${offering.extractionCountryFilterLabel}` : ""}</p>
                    <p className="mt-1 text-xs text-[rgb(var(--fg-muted))]">
                      {[offering.intakes ? `Intakes: ${offering.intakes}` : null, offering.applicationDeadline ? `Deadline: ${offering.applicationDeadline}` : null].filter(Boolean).join(" • ")}
                    </p>
                  </div>
                  <span className="font-semibold">{formatSearchMoney(offering.amount, offering.tuitionFeeCurrency, offering.tuitionFee)}</span>
                </div>
              ))}
            </div>
          </GlassCard>
          <GlassCard hover={false}>
            <h3 className="font-display text-lg font-bold">Program snapshot</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="soft-card flex justify-between gap-4 p-3"><span className="text-[rgb(var(--fg-muted))]">University</span><span className="text-right font-semibold">{program.universityName}</span></li>
              <li className="soft-card flex justify-between gap-4 p-3"><span className="text-[rgb(var(--fg-muted))]">Location</span><span className="text-right font-semibold">{[program.universityCity, program.universityState, program.universityCountry].filter(Boolean).join(", ") || "-"}</span></li>
              <li className="soft-card flex justify-between gap-4 p-3"><span className="text-[rgb(var(--fg-muted))]">Level</span><span className="text-right font-semibold">{program.studyLevel || "Program"}</span></li>
              <li className="soft-card flex justify-between gap-4 p-3"><span className="text-[rgb(var(--fg-muted))]">Tuition</span><span className="text-right font-semibold">{formatSearchMoney(program.minTuitionAmount, program.currencyCode, program.tuitionFeeText)}</span></li>
              <li className="soft-card flex justify-between gap-4 p-3"><span className="text-[rgb(var(--fg-muted))]">Application fee</span><span className="text-right font-semibold">{program.appFeeWaiverAvailable ? "No Application Fee" : formatSearchMoney(program.applicationFeeAmount, program.applicationFeeCurrency, program.applicationFeeText)}</span></li>
            </ul>
            {requirements.length > 0 && (
              <div className="mt-5">
                <h4 className="font-bold">Requirements</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {requirements.map((requirement) => (
                    <span key={requirement} className="badge"><CheckCircle2 className="h-3 w-3" /> {requirement}</span>
                  ))}
                </div>
              </div>
            )}
            {rankings.length > 0 && (
              <div className="mt-5">
                <h4 className="font-bold">Rankings</h4>
                <div className="mt-2 grid gap-2 text-sm text-[rgb(var(--fg-muted))]">
                  {rankings.map((ranking) => (
                    <span key={ranking} className="flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-500" /> {ranking}</span>
                  ))}
                </div>
              </div>
            )}
            <Link href={`/search-program?q=${encodeURIComponent(program.name)}${program.studyLevel ? `&studyLevel=${encodeURIComponent(program.studyLevel)}` : ""}`} className="btn-primary mt-6 w-full justify-center">
              Find Similar Programs
            </Link>
            <Link href={importedEntityPath("/colleges", program.universitySourceId, program.universityName)} className="btn-ghost mt-3 w-full justify-center">
              View University
            </Link>
          </GlassCard>
        </section>
      </>
    );
  }

  const course = await db.course.findUnique({ where: { slug: params.slug } });
  if (!course || !course.active) notFound();
  const image = safeImageSrc(course.image, "");

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: `/courses/${course.slug}`,
            name: course.name,
            description: course.description,
            type: "Course"
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Courses", path: "/courses" },
            { name: course.name, path: `/courses/${course.slug}` }
          ])
        ]}
      />
      <PageHero eyebrow={`${course.category} • ${course.level}`} title={<>{course.name}</>} description={course.description}>
        <div className="flex flex-wrap gap-2">
          <span className="badge"><Layers className="h-3 w-3" /> {course.category}</span>
          <span className="badge"><GraduationCap className="h-3 w-3" /> {course.level}</span>
          {course.duration && <span className="badge"><Clock className="h-3 w-3" /> {course.duration}</span>}
        </div>
      </PageHero>
      <section className="container grid gap-6 py-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <GlassCard hover={false}>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={`${course.name} course`} className="mb-5 h-60 w-full rounded-lg bg-white/80 object-cover shadow-inner dark:bg-white/90" loading="eager" decoding="async" />
          ) : (
            <ReferenceVisual name="books" className="mb-5 h-60 w-full rounded-lg bg-gradient-to-br from-emerald-50 to-sky-100 object-contain p-5 dark:from-slate-900 dark:to-emerald-950" />
          )}
          <h2 className="font-display text-2xl font-bold">About {course.name}</h2>
          <p className="mt-3 leading-7 text-[rgb(var(--fg-muted))]">{course.description}</p>
        </GlassCard>
        <GlassCard hover={false}>
          <h3 className="font-display text-lg font-bold">Course snapshot</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="soft-card flex justify-between gap-4 p-3"><span className="text-[rgb(var(--fg-muted))]">Stream</span><span className="text-right font-semibold">{course.category}</span></li>
            <li className="soft-card flex justify-between gap-4 p-3"><span className="text-[rgb(var(--fg-muted))]">Level</span><span className="font-semibold">{course.level}</span></li>
            <li className="soft-card flex justify-between gap-4 p-3"><span className="text-[rgb(var(--fg-muted))]">Duration</span><span className="font-semibold">{course.duration || "Varies"}</span></li>
          </ul>
          <div className="mt-5 rounded-lg bg-[rgb(var(--primary))]/10 p-4 text-sm leading-6 text-[rgb(var(--fg-muted))]">
            <BookOpenCheck className="mb-2 h-5 w-5 text-[rgb(var(--primary))]" />
            Use the Colleges menu to compare colleges offering this course by city, ownership and exam fit.
          </div>
        </GlassCard>
      </section>
    </>
  );
}
