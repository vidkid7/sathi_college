import { PageHero } from "@/components/ui/PageHero";
import { GlassCard } from "@/components/ui/GlassCard";
import { ReferenceVisual } from "@/components/ui/ReferenceVisual";
import { JsonLd } from "@/components/seo/JsonLd";
import { db } from "@/lib/db";
import { buildMetadata, breadcrumbJsonLd, occupationJsonLd, webPageJsonLd } from "@/lib/seo";
import { safeImageSrc } from "@/lib/utils";
import { BriefcaseBusiness, Compass, GraduationCap } from "lucide-react";
import { notFound } from "next/navigation";
import { careerImageFor, realImageOr } from "@/lib/real-images";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const career = await db.career.findUnique({ where: { slug: params.slug } });
  if (!career || !career.active) return buildMetadata({ title: "Career" });
  return buildMetadata({
    title: career.name,
    description: career.description,
    path: `/careers/${career.slug}`,
    image: career.image,
    keywords: [career.name, `${career.name} career`, `${career.sector} careers`, "career guidance"]
  });
}

export default async function CareerDetail({ params }: { params: { slug: string } }) {
  const career = await db.career.findUnique({ where: { slug: params.slug } });
  if (!career || !career.active) notFound();
  const image = safeImageSrc(realImageOr(career.image, careerImageFor({ name: career.name, sector: career.sector })), "");

  return (
    <>
      <JsonLd
        data={[
            webPageJsonLd({
              path: `/careers/${career.slug}`,
              name: career.name,
              description: career.description
            }),
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Careers", path: "/careers" },
              { name: career.name, path: `/careers/${career.slug}` }
            ]),
            occupationJsonLd({
              path: `/careers/${career.slug}`,
              name: career.name,
              description: career.description,
              category: career.sector,
              image
            })
          ]}
        />
      <PageHero eyebrow={career.sector} title={<>{career.name}</>} description={career.description}>
        <div className="flex flex-wrap gap-2">
          <span className="badge"><BriefcaseBusiness className="h-3 w-3" /> {career.sector}</span>
          {career.featured && <span className="badge"><Compass className="h-3 w-3" /> Featured path</span>}
        </div>
      </PageHero>
      <section className="container grid gap-6 py-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <GlassCard hover={false}>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={`${career.name} career`} className="mb-5 h-60 w-full rounded-lg bg-white/80 object-cover shadow-inner dark:bg-white/90" loading="eager" decoding="async" />
          ) : (
            <ReferenceVisual name="dashboard" className="mb-5 h-60 w-full rounded-lg bg-gradient-to-br from-teal-50 to-blue-100 object-contain p-5 dark:from-slate-900 dark:to-teal-950" />
          )}
          <h2 className="font-display text-2xl font-bold">About {career.name}</h2>
          <p className="mt-3 leading-7 text-[rgb(var(--fg-muted))]">{career.description}</p>
        </GlassCard>
        <GlassCard hover={false}>
          <h3 className="font-display text-lg font-bold">Career snapshot</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="soft-card flex justify-between gap-4 p-3"><span className="text-[rgb(var(--fg-muted))]">Sector</span><span className="text-right font-semibold">{career.sector}</span></li>
            <li className="soft-card flex justify-between gap-4 p-3"><span className="text-[rgb(var(--fg-muted))]">Status</span><span className="font-semibold">{career.featured ? "Featured" : "Listed"}</span></li>
          </ul>
          <div className="mt-5 rounded-lg bg-[rgb(var(--primary))]/10 p-4 text-sm leading-6 text-[rgb(var(--fg-muted))]">
            <GraduationCap className="mb-2 h-5 w-5 text-[rgb(var(--primary))]" />
            Compare related courses and colleges before choosing an academic path for this career.
          </div>
        </GlassCard>
      </section>
    </>
  );
}
