import { PageHero } from "@/components/ui/PageHero";
import { GlassCard } from "@/components/ui/GlassCard";
import { ReferenceVisual } from "@/components/ui/ReferenceVisual";
import { JsonLd } from "@/components/seo/JsonLd";
import { db } from "@/lib/db";
import { buildMetadata, breadcrumbJsonLd, courseJsonLd, webPageJsonLd } from "@/lib/seo";
import { safeImageSrc } from "@/lib/utils";
import type { ReactNode } from "react";
import { ArrowRight, Award, BadgeDollarSign, BookOpenCheck, Building2, CalendarDays, CheckCircle2, Clock, FileText, Globe2, GraduationCap, Layers, ListChecks, MapPin, School, Sparkles, Trophy, WalletCards } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatSearchMoney, importedEntityPath, sourceIdFromSlug } from "@/lib/search-slugs";
import { courseImageFor, realImageOr, universityLogoUrl } from "@/lib/real-images";

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

function compactList(items: Array<string | null | undefined>) {
  return items.filter((item): item is string => Boolean(item && item.trim()));
}

function formatMonths(months?: number | null) {
  if (!months) return "Varies";
  const years = months / 12;
  if (Number.isInteger(years) && years >= 1) return `${months} months (${years} year${years > 1 ? "s" : ""})`;
  return `${months} months`;
}

function dataSourceFromSourceId(sourceId: number) {
  if (sourceId > 0) return "CourseFinder";
  if (sourceId <= -900000000 && sourceId > -1800000000) return "CRICOS";
  return "College Scorecard";
}

function prettyJson(value: unknown) {
  if (!value) return "";
  if (Array.isArray(value)) return value.map((item) => (typeof item === "string" ? item : JSON.stringify(item))).join(", ");
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).map((item) => (typeof item === "string" ? item : JSON.stringify(item))).join(", ");
  return String(value);
}

function DetailRow({ label, value }: { label: string; value?: ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <li className="soft-card flex min-w-0 justify-between gap-4 p-3">
      <span className="shrink-0 text-[rgb(var(--fg-muted))]">{label}</span>
      <span className="min-w-0 text-right font-semibold">{value}</span>
    </li>
  );
}

function SectionTitle({ icon, title, description }: { icon: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="icon-tile mt-0.5">{icon}</span>
      <div>
        <h2 className="font-display text-xl font-extrabold">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-[rgb(var(--fg-muted))]">{description}</p> : null}
      </div>
    </div>
  );
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
    const similarPrograms = await db.searchProgram.findMany({
      where: {
        sourceId: { not: program.sourceId },
        OR: compactList([program.universityCountry, program.studyLevel]).length === 2
          ? [
              { universitySourceId: program.universitySourceId },
              { universityCountry: program.universityCountry, studyLevel: program.studyLevel }
            ]
          : [{ universitySourceId: program.universitySourceId }]
      },
      orderBy: [{ scholarshipAvailable: "desc" }, { appFeeWaiverAvailable: "desc" }, { minTuitionAmount: "asc" }, { name: "asc" }],
      take: 6
    });
    const flags = [
      program.scholarshipAvailable ? "Scholarship Available" : null,
      program.appFeeWaiverAvailable ? "Application Fee Waiver" : null,
      program.isStem ? "STEM Program" : null,
      program.isOnline ? "Online Program" : null,
      program.internshipAvailable ? "Co-op / Internship" : null,
      program.withoutEnglishProficiency || program.isMoiWaiver ? "English Waiver" : null,
      program.withoutMaths ? "Maths Not Required" : null,
      program.eslAvailable || program.elpAvailable ? "ESL / ELP Available" : null,
      program.fifteenYearsEducation ? "Accepts 15 Years Education" : null
    ].filter(Boolean);
    const requirements = [
      { label: "IELTS", score: program.ieltsOverall, active: program.ieltsRequired },
      { label: "TOEFL iBT", score: program.toeflScore, active: program.toeflRequired },
      { label: "PTE", score: program.pteScore, active: program.pteRequired },
      { label: "DET", score: program.detScore, active: program.detRequired },
      { label: "SAT", score: program.satScore, active: program.satRequired },
      { label: "ACT", score: program.actScore, active: program.actRequired },
      { label: "GRE", score: program.greScore, active: program.greRequired },
      { label: "GMAT", score: program.gmatScore, active: program.gmatRequired }
    ].filter((item) => item.active || item.score);
    const academicRequirements = [
      { title: "General entry requirement", text: program.entryRequirement },
      { title: "Class 12 / high school requirement", text: program.entryRequirementTwelfth },
      { title: "Undergraduate requirement", text: program.entryRequirementUG }
    ].filter((item) => item.text);
    const rankings = [
      program.usNewsRanking ? { label: "US News Ranking", value: program.usNewsRanking } : null,
      program.qsRanking ? { label: "QS World Ranking", value: program.qsRanking } : null,
      program.webometricsNationalRank ? { label: "Webometrics National", value: program.webometricsNationalRank } : null,
      program.webometricsWorldRank ? { label: "Webometrics World", value: program.webometricsWorldRank } : null
    ].filter((item): item is { label: string; value: number } => Boolean(item));
    const location = compactList([program.universityCity, program.universityState, program.universityCountry]).join(", ");
    const dataSource = dataSourceFromSourceId(program.sourceId);
    const tuition = formatSearchMoney(program.minTuitionAmount, program.currencyCode, program.tuitionFeeText);
    const applicationFee = program.appFeeWaiverAvailable ? "No Application Fee" : formatSearchMoney(program.applicationFeeAmount, program.applicationFeeCurrency, program.applicationFeeText);
    const programImage = safeImageSrc(courseImageFor({ name: program.name, category: program.studyLevel }), "");
    const universityLogo = universityLogoUrl({ sourceId: program.universitySourceId, name: program.universityName });
    const quickStats = [
      { label: "University", value: program.universityName, icon: <Building2 className="h-5 w-5" /> },
      { label: "Destination", value: location || "Location available on request", icon: <MapPin className="h-5 w-5" /> },
      { label: "Study level", value: program.studyLevel || "Program", icon: <GraduationCap className="h-5 w-5" /> },
      { label: "Duration", value: formatMonths(program.durationMonths), icon: <Clock className="h-5 w-5" /> },
      { label: "Yearly tuition", value: tuition, icon: <BadgeDollarSign className="h-5 w-5" /> },
      { label: "Application fee", value: applicationFee, icon: <WalletCards className="h-5 w-5" /> }
    ];
    return (
      <>
        <JsonLd
          data={[
            webPageJsonLd({
              path: importedEntityPath("/courses", program.sourceId, program.name),
              name: program.name,
              description: `${program.name} at ${program.universityName}.`
            }),
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Courses", path: "/courses" },
              { name: program.name, path: importedEntityPath("/courses", program.sourceId, program.name) }
            ]),
            courseJsonLd({
              path: importedEntityPath("/courses", program.sourceId, program.name),
              name: program.name,
              description: program.entryRequirement || program.remarks || `${program.name} at ${program.universityName}. Explore tuition, intakes, requirements and similar programs.`,
              providerName: program.universityName,
              providerPath: importedEntityPath("/colleges", program.universitySourceId, program.universityName),
              image: programImage,
              courseCode: program.sourceId,
              courseMode: program.isOnline ? "Online" : program.campus || "Onsite",
              educationalLevel: program.studyLevel,
              durationMonths: program.durationMonths,
              tuitionAmount: program.minTuitionAmount?.toString(),
              currency: program.currencyCode
            })
          ]}
        />
        <PageHero eyebrow={`${program.studyLevel || "Program"} • ${program.universityCountry || "Global"} • ${dataSource}`} title={<>{program.name}</>} description={`Detailed program profile for ${program.universityName}, including fees, intakes, requirements, scholarship signals, rankings, source notes and related options from the local search database.`}>
          <div className="flex flex-wrap gap-2">
            <span className="badge"><Building2 className="h-3 w-3" /> {program.universityName}</span>
            {location && <span className="badge"><MapPin className="h-3 w-3" /> {location}</span>}
            {program.durationMonths && <span className="badge"><Clock className="h-3 w-3" /> {formatMonths(program.durationMonths)}</span>}
            {program.intakesText && <span className="badge"><CalendarDays className="h-3 w-3" /> {program.intakesText}</span>}
          </div>
        </PageHero>
        <section className="container py-10 sm:py-12">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {quickStats.map((stat) => (
              <div key={stat.label} className="liquid-surface flex min-w-0 items-start gap-3 p-4">
                <span className="icon-tile shrink-0">{stat.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[rgb(var(--fg-muted))]">{stat.label}</p>
                  <p className="mt-1 break-words font-display text-lg font-extrabold leading-snug">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="grid min-w-0 gap-6">
              <GlassCard hover={false}>
                <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="relative h-52 w-full overflow-hidden rounded-lg border border-white/60 bg-gradient-to-br from-blue-50 to-cyan-100 dark:border-white/10 dark:from-slate-900 dark:to-blue-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={programImage} alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" decoding="async" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
                    {universityLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={universityLogo} alt={`${program.universityName} logo`} className="absolute left-3 top-3 h-12 w-12 rounded-lg border border-white/80 bg-white object-contain p-2 shadow-lg" loading="eager" decoding="async" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <SectionTitle icon={<FileText className="h-5 w-5" />} title="Program overview" description="Core course information collected from imported search data and official public datasets where available." />
                    <div className="mt-4 flex flex-wrap gap-2">
                      {flags.length ? flags.map((flag) => (
                        <span key={flag} className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          {flag}
                        </span>
                      )) : <span className="badge">Standard admission profile</span>}
                    </div>
                    <div className="mt-5 grid gap-3 text-sm leading-6 text-[rgb(var(--fg-muted))]">
                      {program.highlights && <p className="rounded-lg bg-[rgb(var(--primary))]/10 p-3 font-semibold text-[rgb(var(--fg))]">{program.highlights}</p>}
                      <p className="whitespace-pre-line">{program.entryRequirement || program.remarks || `This imported program is connected to ${program.offerings.length.toLocaleString("en-IN")} offering record${program.offerings.length === 1 ? "" : "s"} in the local database.`}</p>
                      {program.remarks && program.entryRequirement && <p className="whitespace-pre-line">{program.remarks}</p>}
                    </div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard hover={false}>
                <SectionTitle icon={<ListChecks className="h-5 w-5" />} title="Eligibility and requirements" description="Language tests, standardized exams and academic entry notes exposed from the imported program record." />
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {requirements.length ? requirements.map((requirement) => (
                    <div key={requirement.label} className="soft-card p-4">
                      <p className="text-xs font-extrabold uppercase tracking-wide text-[rgb(var(--fg-muted))]">{requirement.label}</p>
                      <p className="mt-2 font-display text-xl font-extrabold">{requirement.score || "Required"}</p>
                    </div>
                  )) : (
                    <div className="soft-card p-4 sm:col-span-2 xl:col-span-4">
                      <p className="font-semibold">No specific test score is listed in the database for this program.</p>
                      {(program.withoutEnglishProficiency || program.isMoiWaiver) && <p className="mt-1 text-sm text-[rgb(var(--fg-muted))]">English proficiency waiver or MOI evidence may be accepted.</p>}
                    </div>
                  )}
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {[
                    { label: "Without English proficiency", active: program.withoutEnglishProficiency },
                    { label: "MOI waiver", active: program.isMoiWaiver },
                    { label: "Without maths", active: program.withoutMaths },
                    { label: "ESL available", active: program.eslAvailable },
                    { label: "ELP available", active: program.elpAvailable },
                    { label: "15 years education accepted", active: program.fifteenYearsEducation }
                  ].map((item) => (
                    <div key={item.label} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold ${item.active ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))]/65 text-[rgb(var(--fg-muted))]"}`}>
                      <CheckCircle2 className={`h-4 w-4 ${item.active ? "" : "opacity-35"}`} />
                      {item.label}
                    </div>
                  ))}
                </div>
                {academicRequirements.length > 0 && (
                  <div className="mt-5 grid gap-3">
                    {academicRequirements.map((item) => (
                      <div key={item.title} className="soft-card p-4">
                        <h3 className="font-bold">{item.title}</h3>
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[rgb(var(--fg-muted))]">{item.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>

              <GlassCard hover={false}>
                <SectionTitle icon={<CalendarDays className="h-5 w-5" />} title="Offerings, intakes and deadlines" description="Year-specific destination availability with tuition, application fee, intakes and deadline notes." />
                <div className="mt-5 grid gap-3">
                  {program.offerings.length ? program.offerings.map((offering) => {
                    const intakeDetails = compactList([
                      offering.intakes ? `Intakes: ${offering.intakes}` : null,
                      prettyJson(offering.displayIntakes) ? `Display intakes: ${prettyJson(offering.displayIntakes)}` : null,
                      offering.intakesAndDeadlines ? `Intakes and deadlines: ${offering.intakesAndDeadlines}` : null,
                      offering.upcomingIntakeDeadlines ? `Upcoming deadlines: ${offering.upcomingIntakeDeadlines}` : null,
                      offering.intakesClosed ? `Closed intakes: ${offering.intakesClosed}` : null
                    ]);
                    return (
                      <div key={offering.id} className="soft-card grid min-w-0 gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_220px]">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-lg bg-[rgb(var(--primary))]/10 px-2.5 py-1 text-xs font-extrabold text-[rgb(var(--primary))]">{offering.extractionYear}</span>
                            {offering.extractionCountryFilterLabel && <span className="badge">{offering.extractionCountryFilterLabel}</span>}
                            {offering.extractionProgramLevelFilterLabel && <span className="badge">{offering.extractionProgramLevelFilterLabel}</span>}
                          </div>
                          <p className="mt-3 font-bold">{offering.applicationDeadline || "Deadline varies"}</p>
                          {offering.applicationDeadlineDetails && <p className="mt-1 text-sm leading-6 text-[rgb(var(--fg-muted))]">{offering.applicationDeadlineDetails}</p>}
                          {intakeDetails.length ? (
                            <div className="mt-3 grid gap-1 text-sm leading-6 text-[rgb(var(--fg-muted))]">
                              {intakeDetails.map((detail) => <p key={detail}>{detail}</p>)}
                            </div>
                          ) : <p className="mt-3 text-sm text-[rgb(var(--fg-muted))]">Intakes are open/check with institution.</p>}
                        </div>
                        <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))]/65 p-4">
                          <p className="text-xs font-extrabold uppercase tracking-wide text-[rgb(var(--fg-muted))]">Tuition</p>
                          <p className="mt-1 font-display text-xl font-extrabold">{formatSearchMoney(offering.amount, offering.tuitionFeeCurrency, offering.tuitionFee)}</p>
                          <p className="mt-3 text-xs font-extrabold uppercase tracking-wide text-[rgb(var(--fg-muted))]">Application fee</p>
                          <p className="mt-1 font-semibold">{formatSearchMoney(offering.applicationFeeAmount, offering.applicationFeeCurrency, offering.applicationFee)}</p>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="soft-card p-4 text-sm text-[rgb(var(--fg-muted))]">No separate intake/offering rows are attached to this program yet.</div>
                  )}
                </div>
              </GlassCard>

              {(program.scholarshipDetail || rankings.length > 0 || similarPrograms.length > 0) && (
                <div className="grid gap-6 xl:grid-cols-2">
                  {(program.scholarshipDetail || rankings.length > 0) && (
                    <GlassCard hover={false}>
                      <SectionTitle icon={<Award className="h-5 w-5" />} title="Scholarships and rankings" />
                      {program.scholarshipDetail && (
                        <div className="mt-5 rounded-lg bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-800 dark:text-emerald-200">
                          <BadgeDollarSign className="mb-2 h-5 w-5" />
                          <p className="whitespace-pre-line">{program.scholarshipDetail}</p>
                        </div>
                      )}
                      {rankings.length > 0 && (
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          {rankings.map((ranking) => (
                            <div key={ranking.label} className="soft-card p-4">
                              <Trophy className="h-5 w-5 text-amber-500" />
                              <p className="mt-2 text-xs font-extrabold uppercase tracking-wide text-[rgb(var(--fg-muted))]">{ranking.label}</p>
                              <p className="font-display text-2xl font-extrabold">{ranking.value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </GlassCard>
                  )}
                  {similarPrograms.length > 0 && (
                    <GlassCard hover={false}>
                      <SectionTitle icon={<Sparkles className="h-5 w-5" />} title="Related programs" description="Similar options from the same university or destination/study level." />
                      <div className="mt-5 grid gap-3">
                        {similarPrograms.map((item) => (
                          <Link key={item.sourceId} href={importedEntityPath("/courses", item.sourceId, item.name)} className="soft-card group flex min-w-0 items-center justify-between gap-3 p-3 transition hover:-translate-y-0.5 hover:shadow-lg">
                            <span className="min-w-0">
                              <span className="line-clamp-2 font-bold leading-snug group-hover:text-[rgb(var(--primary))]">{item.name}</span>
                              <span className="mt-1 block truncate text-xs text-[rgb(var(--fg-muted))]">{compactList([item.studyLevel, item.universityCountry, formatSearchMoney(item.minTuitionAmount, item.currencyCode, item.tuitionFeeText)]).join(" • ")}</span>
                            </span>
                            <ArrowRight className="h-4 w-4 shrink-0 text-[rgb(var(--primary))]" />
                          </Link>
                        ))}
                      </div>
                    </GlassCard>
                  )}
                </div>
              )}
            </div>

            <aside className="grid gap-6 self-start lg:sticky lg:top-24">
              <GlassCard hover={false}>
                <h3 className="font-display text-lg font-extrabold">Program snapshot</h3>
                <ul className="mt-4 space-y-3 text-sm">
                  <DetailRow label="University" value={program.universityName} />
                  <DetailRow label="Location" value={location || "-"} />
                  <DetailRow label="Level" value={program.studyLevel || "Program"} />
                  <DetailRow label="Concentration" value={program.concentration} />
                  <DetailRow label="Campus" value={program.campus} />
                  <DetailRow label="Application mode" value={program.applicationMode} />
                  <DetailRow label="Tuition" value={tuition} />
                  <DetailRow label="Application fee" value={applicationFee} />
                  <DetailRow label="Data source" value={dataSource} />
                  <DetailRow label="Source ID" value={program.sourceId} />
                </ul>
                <Link href={`/search-program?q=${encodeURIComponent(program.name)}${program.studyLevel ? `&studyLevel=${encodeURIComponent(program.studyLevel)}` : ""}`} className="btn-primary mt-6 w-full justify-center">
                  Find Similar Programs
                </Link>
                <Link href={importedEntityPath("/colleges", program.universitySourceId, program.universityName)} className="btn-ghost mt-3 w-full justify-center">
                  View University
                </Link>
              </GlassCard>

              <GlassCard hover={false}>
                <SectionTitle icon={<School className="h-5 w-5" />} title="University facts" />
                <ul className="mt-4 space-y-3 text-sm">
                  <DetailRow label="Institution" value={program.university?.name || program.universityName} />
                  <DetailRow label="Country" value={program.university?.country || program.universityCountry} />
                  <DetailRow label="State" value={program.university?.state || program.universityState} />
                  <DetailRow label="City" value={program.university?.city || program.universityCity} />
                  <DetailRow label="Programs" value={program.university?.programCount?.toLocaleString("en-IN")} />
                  <DetailRow label="Offerings" value={program.university?.offeringCount?.toLocaleString("en-IN")} />
                  <DetailRow label="Currency" value={program.university?.currencyCode || program.currencyCode} />
                </ul>
              </GlassCard>

              <GlassCard hover={false}>
                <SectionTitle icon={<Globe2 className="h-5 w-5" />} title="Data notes" />
                <div className="mt-4 grid gap-3 text-sm leading-6 text-[rgb(var(--fg-muted))]">
                  <p>This page is generated from the local SathiCollege search database. It surfaces every available program field instead of hiding details behind the search card.</p>
                  {dataSource === "CRICOS" && <p>CRICOS rows confirm Australian courses available for overseas students; live intake dates may not be supplied in the public register.</p>}
                  {dataSource === "College Scorecard" && <p>College Scorecard rows are useful for U.S. discovery and outcomes research; live admission deadlines are usually not present in that source.</p>}
                  {dataSource === "CourseFinder" && <p>CourseFinder rows may include agent-focused eligibility, scholarship, fee waiver, intake and deadline fields when they exist in the import.</p>}
                </div>
              </GlassCard>
            </aside>
          </div>
        </section>
      </>
    );
  }

  const course = await db.course.findUnique({ where: { slug: params.slug } });
  if (!course || !course.active) notFound();
  const image = safeImageSrc(realImageOr(course.image, courseImageFor({ name: course.name, category: course.category })), "");

  return (
    <>
      <JsonLd
        data={[
            webPageJsonLd({
              path: `/courses/${course.slug}`,
              name: course.name,
              description: course.description
            }),
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Courses", path: "/courses" },
              { name: course.name, path: `/courses/${course.slug}` }
            ]),
            courseJsonLd({
              path: `/courses/${course.slug}`,
              name: course.name,
              description: course.description,
              providerName: "SathiCollege",
              image,
              educationalLevel: course.level,
              courseMode: "Course guide"
            })
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
