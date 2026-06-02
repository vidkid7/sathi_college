import { PageHero } from "@/components/ui/PageHero";
import { db } from "@/lib/db";
import { ArrowRight, Building2, MapPin, Search, Star, WalletCards } from "lucide-react";
import Link from "next/link";
import { formatINR, safeImageSrc } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";
import { ReferenceVisual } from "@/components/ui/ReferenceVisual";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd, webPageJsonLd } from "@/lib/seo";
import { formatCompactCount, importedEntityPath } from "@/lib/search-slugs";
import { realImageOr, universityCampusImage, universityLogoUrl } from "@/lib/real-images";

export const metadata = buildMetadata({
  title: "Global Universities and Colleges",
  description: "Search universities and colleges worldwide with program counts, locations, tuition-linked courses, intakes and scholarship signals from the SathiCollege database.",
  path: "/colleges",
  keywords: ["global universities", "college finder", "university search", "study abroad colleges", "USA universities", "UK universities", "Canada universities", "Australia universities"]
});

export const dynamic = "force-dynamic";

export default async function CollegesPage({ searchParams }: { searchParams?: { type?: string; search?: string } }) {
  const type = searchParams?.type;
  const search = searchParams?.search?.trim();
  let colleges: any[] = [];
  let importedUniversities: any[] = [];
  try {
    [colleges, importedUniversities] = await Promise.all([
      db.college.findMany({
        where: {
          ...(type ? { type } : {}),
          ...(search
            ? {
                OR: [
                  { name: { contains: search } },
                  { city: { contains: search } },
                  { state: { contains: search } }
                ]
              }
            : {})
        },
        orderBy: [{ featured: "desc" }, { rating: "desc" }],
        take: 24
      }),
      db.searchUniversity.findMany({
        where: {
          ...(search
            ? {
                OR: [
                  { name: { contains: search } },
                  { country: { contains: search } },
                  { state: { contains: search } },
                  { city: { contains: search } }
                ]
              }
            : {})
        },
        orderBy: [{ programCount: "desc" }, { offeringCount: "desc" }, { name: "asc" }],
        take: 60
      })
    ]);
  } catch {
    colleges = [];
    importedUniversities = [];
  }
  const itemListItems = [
    ...colleges.slice(0, 20).map((college) => ({
      name: college.name,
      path: `/colleges/${college.slug}`,
      description: college.description
    })),
    ...importedUniversities.slice(0, 30).map((university) => ({
      name: university.name,
      path: importedEntityPath("/colleges", university.sourceId, university.name),
      description: `${university.name} has ${university.programCount.toLocaleString("en-IN")} searchable programs in the local CourseFinder database.`
    }))
  ];

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/colleges",
            name: "Engineering colleges in India",
            description: "Browse engineering colleges with cutoff trends, fees, ratings, location and counselling fit."
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Colleges", path: "/colleges" }
          ]),
          itemListJsonLd({
            path: "/colleges",
            name: "Colleges and universities listed on SathiCollege",
            items: itemListItems
          })
        ]}
      />
      <PageHero
        eyebrow="Discover"
        title={<>Colleges & <span className="gradient-text">Universities</span></>}
        description="Browse local colleges plus the imported CourseFinder university database connected to searchable programs, intakes and tuition data."
      />
      <section className="container py-12">
        <div className="reference-panel mb-8 grid items-center gap-4 p-4 md:grid-cols-[1fr_auto]">
          <div className="flex flex-wrap gap-2">
            {[
              { l: "All", v: "" },
              { l: "Government", v: "Government" },
              { l: "Private", v: "Private" }
            ].map((f) => (
              <Link
                key={f.l}
                href={f.v ? `/colleges?type=${f.v}${search ? `&search=${encodeURIComponent(search)}` : ""}` : search ? `/colleges?search=${encodeURIComponent(search)}` : "/colleges"}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  (type || "") === f.v
                    ? "border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
                    : "border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-elev))]"
                }`}
              >
                {f.l}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-[rgb(var(--fg-muted))]">
            <Search className="h-4 w-4" />
            {search ? `Showing database results for "${search}"` : `${importedUniversities.length ? "Showing top imported universities" : "Search from the top navigation"}`}
          </div>
        </div>

        {colleges.length === 0 && importedUniversities.length === 0 ? (
          <div className="reference-panel grid place-items-center p-10 text-center">
            <ReferenceVisual name="campus" className="h-48 w-48 object-contain opacity-80" />
            <p className="mt-4 font-semibold">No colleges found.</p>
            <p className="mt-1 text-sm text-[rgb(var(--fg-muted))]">Try another search or add colleges via the admin panel.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {colleges.map((c) => {
              const image = safeImageSrc(realImageOr(c.heroImage, universityCampusImage()), "");
              return (
              <Link key={c.id} href={`/colleges/${c.slug}`} className="soft-card group flex h-full flex-col overflow-hidden">
                <div className="relative h-36 overflow-hidden bg-gradient-to-br from-blue-50 to-sky-100 dark:from-slate-900 dark:to-blue-950">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt={`${c.name} logo`} className="absolute inset-0 h-full w-full object-contain bg-white/72 p-5 transition duration-300 group-hover:scale-105 dark:bg-white/90" loading="lazy" decoding="async" />
                  ) : (
                    <ReferenceVisual name="campus" className="absolute inset-0 h-full w-full object-contain p-4 transition duration-300 group-hover:scale-105" />
                  )}
                  <span className="badge absolute right-3 top-3"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {c.rating.toFixed(1)}</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="icon-tile">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <span className="rounded-lg bg-[rgb(var(--primary))]/10 px-2.5 py-1 text-xs font-bold text-[rgb(var(--primary))]">{c.type}</span>
                </div>
                <h3 className="mt-3 line-clamp-2 break-words font-display text-lg font-bold leading-snug">{c.name}</h3>
                <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-[rgb(var(--fg-muted))]"><MapPin className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{c.city}, {c.state}</span></p>
                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-[rgb(var(--fg-muted))]">{c.description}</p>
                <div className="mt-4 flex items-center justify-between border-t border-[rgb(var(--border))]/70 pt-4 text-sm">
                  <span className="flex items-center gap-1 text-[rgb(var(--fg-muted))]"><WalletCards className="h-4 w-4" /> Annual fees</span>
                  <span className="font-semibold">{formatINR(c.fees)}</span>
                </div>
                <span className="subtle-link mt-4">View Details <ArrowRight className="h-4 w-4" /></span>
                </div>
              </Link>
              );
            })}
            {importedUniversities.map((university) => {
              const logo = universityLogoUrl({ sourceId: university.sourceId, name: university.name });
              const campusImage = safeImageSrc(universityCampusImage(university), "");
              return (
                <Link
                  key={`search-university-${university.sourceId}`}
                  href={importedEntityPath("/colleges", university.sourceId, university.name)}
                  className="soft-card group flex h-full flex-col overflow-hidden"
                >
                  <div className="relative h-36 overflow-hidden bg-gradient-to-br from-sky-50 to-blue-100 dark:from-slate-900 dark:to-blue-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={campusImage} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent" />
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logo} alt={`${university.name} logo`} className="absolute left-3 top-3 h-12 w-12 rounded-lg border border-white/80 bg-white object-contain p-2 shadow-lg" loading="lazy" decoding="async" />
                    ) : (
                      <span className="icon-tile absolute left-3 top-3 bg-white/90"><Building2 className="h-5 w-5" /></span>
                    )}
                    <span className="badge absolute right-3 top-3">{formatCompactCount(university.programCount)} programs</span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="icon-tile">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <span className="rounded-lg bg-[rgb(var(--primary))]/10 px-2.5 py-1 text-xs font-bold text-[rgb(var(--primary))]">Imported DB</span>
                    </div>
                    <h3 className="mt-3 line-clamp-2 break-words font-display text-lg font-bold leading-snug">{university.name}</h3>
                    <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-[rgb(var(--fg-muted))]">
                      <MapPin className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{[university.city, university.state, university.country].filter(Boolean).join(", ") || "Global university"}</span>
                    </p>
                    <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-[rgb(var(--fg-muted))]">
                      Search {university.programCount.toLocaleString("en-IN")} programs and {university.offeringCount.toLocaleString("en-IN")} intake/year offerings from this university.
                    </p>
                    <div className="mt-4 flex min-w-0 items-center justify-between gap-3 border-t border-[rgb(var(--border))]/70 pt-4 text-sm">
                      <span className="flex items-center gap-1 text-[rgb(var(--fg-muted))]"><WalletCards className="h-4 w-4" /> Offerings</span>
                      <span className="truncate text-right font-semibold">{formatCompactCount(university.offeringCount)}</span>
                    </div>
                    <span className="subtle-link mt-4">View Programs <ArrowRight className="h-4 w-4" /></span>
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
