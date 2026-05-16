import { PageHero } from "@/components/ui/PageHero";
import { db } from "@/lib/db";
import { ArrowRight, Building2, MapPin, Search, Star, WalletCards } from "lucide-react";
import Link from "next/link";
import { formatINR, safeImageSrc } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";
import { ReferenceVisual } from "@/components/ui/ReferenceVisual";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd, webPageJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Engineering Colleges",
  description: "Discover engineering colleges across India with cutoff trends, fees, reviews, counselling fit and admission guidance.",
  path: "/colleges",
  keywords: ["engineering colleges in India", "best engineering colleges", "engineering college fees", "college cutoffs"]
});

export const dynamic = "force-dynamic";

export default async function CollegesPage({ searchParams }: { searchParams?: { type?: string; search?: string } }) {
  const type = searchParams?.type;
  const search = searchParams?.search?.trim();
  let colleges: any[] = [];
  try {
    colleges = await db.college.findMany({
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
      orderBy: [{ featured: "desc" }, { rating: "desc" }]
    });
  } catch {
    colleges = [];
  }

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
            name: "Engineering colleges listed on SathiCollege",
            items: colleges.slice(0, 50).map((college) => ({
              name: college.name,
              path: `/colleges/${college.slug}`,
              description: college.description
            }))
          })
        ]}
      />
      <PageHero
        eyebrow="Discover"
        title={<>Engineering <span className="gradient-text">Colleges</span></>}
        description="Browse a curated database of engineering colleges across India with details on cutoffs, fees and admission process."
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
            {search ? `Showing results for "${search}"` : "Search from the top navigation"}
          </div>
        </div>

        {colleges.length === 0 ? (
          <div className="reference-panel grid place-items-center p-10 text-center">
            <ReferenceVisual name="campus" className="h-48 w-48 object-contain opacity-80" />
            <p className="mt-4 font-semibold">No colleges found.</p>
            <p className="mt-1 text-sm text-[rgb(var(--fg-muted))]">Try another search or add colleges via the admin panel.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {colleges.map((c) => {
              const image = safeImageSrc(c.heroImage, "");
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
                <h3 className="mt-3 font-display text-lg font-bold">{c.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-[rgb(var(--fg-muted))]"><MapPin className="h-3.5 w-3.5" /> {c.city}, {c.state}</p>
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
          </div>
        )}
      </section>
    </>
  );
}
