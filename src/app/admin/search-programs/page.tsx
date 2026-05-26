import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Database, GraduationCap, MapPin, Search, University } from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { LargeDataAdmin, type LargeAdminEntity } from "@/components/admin/LargeDataAdmin";
import { GlassCard } from "@/components/ui/GlassCard";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const boolFields = [
  "appFeeWaiverAvailable",
  "scholarshipAvailable",
  "internshipAvailable",
  "isOnline",
  "isStem",
  "withoutEnglishProficiency",
  "withoutMaths",
  "eslAvailable",
  "elpAvailable",
  "pteRequired",
  "toeflRequired",
  "ieltsRequired",
  "detRequired",
  "satRequired",
  "actRequired",
  "greRequired",
  "gmatRequired"
].map((name) => ({
  name,
  label: name.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase()),
  type: "checkbox" as const
}));

const entities: LargeAdminEntity[] = [
  {
    key: "programs",
    label: "Programs",
    description: "Create, edit, search, and delete the normalized public search programs.",
    columns: [
      { key: "sourceId", label: "Source ID" },
      { key: "name", label: "Program" },
      { key: "universityName", label: "University" },
      { key: "universityCountry", label: "Country" },
      { key: "studyLevel", label: "Level" },
      { key: "minTuitionAmount", label: "Tuition" },
      { key: "scholarshipAvailable", label: "Scholarship" },
      { key: "isStem", label: "STEM" }
    ],
    fields: [
      { name: "sourceId", label: "Source ID", type: "number", required: true, readOnlyOnEdit: true },
      { name: "name", label: "Program name", required: true },
      { name: "concentration", label: "Concentration" },
      { name: "universitySourceId", label: "University source ID", type: "number", required: true, readOnlyOnEdit: true },
      { name: "universityName", label: "University name", required: true },
      { name: "universityCountry", label: "University country" },
      { name: "universityState", label: "University state" },
      { name: "universityCity", label: "University city" },
      { name: "studyLevel", label: "Study level" },
      { name: "studyLevelId", label: "Study level ID", type: "number" },
      { name: "categoryId", label: "Category ID" },
      { name: "subCategoryId", label: "Sub-category ID" },
      { name: "durationMonths", label: "Duration months", type: "number" },
      { name: "campus", label: "Campus" },
      { name: "currencyCode", label: "Currency code" },
      { name: "applicationMode", label: "Application mode" },
      { name: "minTuitionAmount", label: "Minimum tuition", type: "number" },
      { name: "tuitionFeeText", label: "Tuition fee text", type: "textarea" },
      { name: "applicationFeeAmount", label: "Application fee amount", type: "number" },
      { name: "applicationFeeText", label: "Application fee text" },
      { name: "applicationFeeCurrency", label: "Application fee currency" },
      { name: "intakesText", label: "Intakes", type: "textarea" },
      { name: "highlights", label: "Highlights" },
      ...boolFields,
      { name: "pteScore", label: "PTE score" },
      { name: "toeflScore", label: "TOEFL score" },
      { name: "ieltsOverall", label: "IELTS overall" },
      { name: "detScore", label: "DET score" },
      { name: "satScore", label: "SAT score" },
      { name: "actScore", label: "ACT score" },
      { name: "greScore", label: "GRE score" },
      { name: "gmatScore", label: "GMAT score" },
      { name: "entryRequirement", label: "Entry requirement", type: "textarea" },
      { name: "scholarshipDetail", label: "Scholarship detail", type: "textarea" },
      { name: "remarks", label: "Remarks", type: "textarea" },
      { name: "searchText", label: "Search text", type: "textarea" }
    ]
  },
  {
    key: "universities",
    label: "Universities",
    description: "Manage the university catalog used by the search filters and program records.",
    columns: [
      { key: "sourceId", label: "Source ID" },
      { key: "name", label: "University" },
      { key: "country", label: "Country" },
      { key: "state", label: "State" },
      { key: "city", label: "City" },
      { key: "programCount", label: "Programs" },
      { key: "offeringCount", label: "Offerings" }
    ],
    fields: [
      { name: "sourceId", label: "Source ID", type: "number", required: true, readOnlyOnEdit: true },
      { name: "name", label: "University name", required: true },
      { name: "country", label: "Country" },
      { name: "state", label: "State" },
      { name: "city", label: "City" },
      { name: "countryId", label: "Country ID", type: "number" },
      { name: "currencyCode", label: "Currency code" },
      { name: "logoExtension", label: "Logo extension" },
      { name: "displayOrder", label: "Display order", type: "number" },
      { name: "programCount", label: "Program count", type: "number" },
      { name: "offeringCount", label: "Offering count", type: "number" }
    ]
  },
  {
    key: "offerings",
    label: "Offerings",
    description: "Manage intake, deadline, tuition, and extraction rows behind each program.",
    columns: [
      { key: "programSourceId", label: "Program ID" },
      { key: "universitySourceId", label: "University ID" },
      { key: "extractionYear", label: "Year" },
      { key: "extractionCountryFilterLabel", label: "Search country" },
      { key: "intakes", label: "Intakes" },
      { key: "applicationDeadline", label: "Deadline" },
      { key: "amount", label: "Tuition" },
      { key: "tuitionFeeCurrency", label: "Currency" }
    ],
    fields: [
      { name: "programSourceId", label: "Program source ID", type: "number", required: true, readOnlyOnEdit: true },
      { name: "universitySourceId", label: "University source ID", type: "number", required: true, readOnlyOnEdit: true },
      { name: "extractionYear", label: "Extraction year", type: "number", required: true, readOnlyOnEdit: true },
      { name: "extractionCountryFilterId", label: "Search country filter ID", type: "number" },
      { name: "extractionCountryFilterLabel", label: "Search country label" },
      { name: "extractionProgramLevelFilterId", label: "Program level filter ID" },
      { name: "extractionProgramLevelFilterLabel", label: "Program level label" },
      { name: "applicationDeadline", label: "Application deadline" },
      { name: "applicationDeadlineDetails", label: "Deadline details", type: "textarea" },
      { name: "intakes", label: "Intakes", type: "textarea" },
      { name: "intakesAndDeadlines", label: "Intakes and deadlines", type: "textarea" },
      { name: "upcomingIntakeDeadlines", label: "Upcoming intake deadlines", type: "textarea" },
      { name: "intakesClosed", label: "Closed intakes", type: "textarea" },
      { name: "tuitionFee", label: "Tuition fee", type: "textarea" },
      { name: "amount", label: "Tuition amount", type: "number" },
      { name: "tuitionFeeCurrency", label: "Tuition currency" },
      { name: "applicationFee", label: "Application fee" },
      { name: "applicationFeeAmount", label: "Application fee amount", type: "number" },
      { name: "applicationFeeCurrency", label: "Application fee currency" }
    ]
  }
];

export default async function AdminSearchProgramsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/access");

  const [programs, courseFinderPrograms, scorecardPrograms, cricosPrograms, offerings, universities, countries, levels, samples] = await Promise.all([
    db.searchProgram.count(),
    db.searchProgram.count({ where: { sourceId: { gt: 0 } } }),
    db.searchProgram.count({ where: { sourceId: { gt: -700000000, lt: 0 } } }),
    db.searchProgram.count({ where: { sourceId: { gt: -1800000000, lte: -900000000 } } }),
    db.searchProgramOffering.count(),
    db.searchUniversity.count(),
    db.searchProgram.groupBy({
      by: ["universityCountry"],
      where: { universityCountry: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { universityCountry: "desc" } },
      take: 8
    }),
    db.searchProgram.groupBy({
      by: ["studyLevel"],
      where: { studyLevel: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { studyLevel: "desc" } },
      take: 8
    }),
    db.searchProgram.findMany({
      orderBy: [{ scholarshipAvailable: "desc" }, { name: "asc" }],
      take: 8,
      select: {
        sourceId: true,
        name: true,
        universityName: true,
        universityCountry: true,
        studyLevel: true,
        minTuitionAmount: true,
        currencyCode: true
      }
    })
  ]);

  const stats = [
    { label: "Programs", value: programs, icon: GraduationCap },
    { label: "Offerings", value: offerings, icon: Database },
    { label: "Universities", value: universities, icon: University },
    { label: "Countries", value: countries.length, icon: MapPin }
  ];

  return (
    <>
      <AdminTopbar title="Search Programs" />
      <section className="reference-panel mb-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg-muted))]">Imported catalog admin</p>
            <h1 className="mt-2 font-display text-2xl font-extrabold">Local searchable program database</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[rgb(var(--fg-muted))]">
              Manage the CourseFinder, College Scorecard, and official CRICOS data powering public program search, filters, tuition, intakes, and requirements.
            </p>
          </div>
          <Link href="/search-program" className="btn-primary">
            <Search className="h-4 w-4" />
            Open Search
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <GlassCard key={stat.label} hover={false}>
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]">
                <stat.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs text-[rgb(var(--fg-muted))]">{stat.label}</p>
                <p className="font-display text-2xl font-bold">{stat.value.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <GlassCard hover={false}>
          <h2 className="font-display text-lg font-bold">Data Sources</h2>
          <div className="mt-4 grid gap-2">
            {[
              ["CourseFinder import", courseFinderPrograms],
              ["College Scorecard import", scorecardPrograms],
              ["CRICOS official Australia import", cricosPrograms],
              ["Combined unique programs", programs]
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-lg bg-[rgb(var(--bg-soft))] px-3 py-2 text-sm dark:bg-white/5">
                <span>{label}</span>
                <span className="font-bold">{Number(value).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard hover={false}>
          <h2 className="font-display text-lg font-bold">Program Levels</h2>
          <div className="mt-4 grid gap-2">
            {levels.map((level) => (
              <div key={level.studyLevel || "unknown"} className="flex items-center justify-between rounded-lg bg-[rgb(var(--bg-soft))] px-3 py-2 text-sm dark:bg-white/5">
                <span>{level.studyLevel || "Unknown"}</span>
                <span className="font-bold">{level._count._all.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <GlassCard hover={false}>
          <h2 className="font-display text-lg font-bold">Top Countries</h2>
          <div className="mt-4 grid gap-2">
            {countries.map((country) => (
              <div key={country.universityCountry || "unknown"} className="flex items-center justify-between rounded-lg bg-[rgb(var(--bg-soft))] px-3 py-2 text-sm dark:bg-white/5">
                <span>{country.universityCountry || "Unknown"}</span>
                <span className="font-bold">{country._count._all.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard className="overflow-hidden p-0" hover={false}>
          <div className="border-b border-[rgb(var(--border))] px-4 py-3">
            <h2 className="font-display text-lg font-bold">Sample Programs</h2>
          </div>
          <div className="overflow-x-auto nice-scroll">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-[rgb(var(--bg-elev))]/60">
                <tr>
                  <th className="px-4 py-3 text-left">Source ID</th>
                  <th className="px-4 py-3 text-left">Program</th>
                  <th className="px-4 py-3 text-left">University</th>
                  <th className="px-4 py-3 text-left">Level</th>
                  <th className="px-4 py-3 text-left">Tuition</th>
                </tr>
              </thead>
              <tbody>
                {samples.map((program) => (
                  <tr key={program.sourceId} className="border-t border-[rgb(var(--border))]">
                    <td className="px-4 py-3">{program.sourceId}</td>
                    <td className="px-4 py-3 font-semibold">{program.name}</td>
                    <td className="px-4 py-3">{program.universityName} {program.universityCountry ? `(${program.universityCountry})` : ""}</td>
                    <td className="px-4 py-3">{program.studyLevel || "-"}</td>
                    <td className="px-4 py-3">{program.minTuitionAmount ? `${program.currencyCode || ""} ${Number(program.minTuitionAmount).toLocaleString("en-IN")}` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      <div className="mt-6">
        <LargeDataAdmin apiBase="/api/admin/search-catalog" entities={entities} />
      </div>
    </>
  );
}
