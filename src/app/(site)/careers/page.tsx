import { PageHero } from "@/components/ui/PageHero";
import { ReferenceVisual } from "@/components/ui/ReferenceVisual";
import { JsonLd } from "@/components/seo/JsonLd";
import { db } from "@/lib/db";
import { buildMetadata, breadcrumbJsonLd, itemListJsonLd, webPageJsonLd } from "@/lib/seo";
import { safeImageSrc } from "@/lib/utils";
import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import Link from "next/link";

export const metadata = buildMetadata({
  title: "Popular Careers",
  description: "Browse admin-managed career options, sectors and role guidance for students on SathiCollege.",
  path: "/careers",
  keywords: ["popular careers", "career compass", "student careers", "doctor career", "pilot career", "IAS officer"]
});

export const dynamic = "force-dynamic";

export default async function CareersPage() {
  let careers: any[] = [];
  try {
    careers = await db.career.findMany({
      where: { active: true },
      orderBy: [{ featured: "desc" }, { name: "asc" }]
    });
  } catch {
    careers = [];
  }

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
            name: "Careers listed on SathiCollege",
            items: careers.map((career) => ({
              name: career.name,
              path: `/careers/${career.slug}`,
              description: career.description
            }))
          })
        ]}
      />
      <PageHero
        eyebrow="Career compass"
        title={<>Popular <span className="gradient-text">Careers</span></>}
        description="Compare career paths across public service, healthcare, defence, finance, aviation, design and more."
      />
      <section className="container py-12">
        {careers.length === 0 ? (
          <div className="reference-panel grid place-items-center p-10 text-center">
            <ReferenceVisual name="dashboard" className="h-48 w-48 object-contain opacity-80" />
            <p className="mt-4 font-semibold">No careers found.</p>
            <p className="mt-1 text-sm text-[rgb(var(--fg-muted))]">Add careers from the admin panel to publish them here.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {careers.map((career) => {
              const image = safeImageSrc(career.image, "");
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
                    <h3 className="mt-3 font-display text-lg font-bold">{career.name}</h3>
                    <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-[rgb(var(--fg-muted))]">{career.description}</p>
                    <span className="subtle-link mt-4">View Career <ArrowRight className="h-4 w-4" /></span>
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
