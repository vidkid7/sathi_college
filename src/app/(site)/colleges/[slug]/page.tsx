import { PageHero } from "@/components/ui/PageHero";
import { GlassCard } from "@/components/ui/GlassCard";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatINR, safeImageSrc } from "@/lib/utils";
import { Star, MapPin, Building2 } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { ReferenceVisual } from "@/components/ui/ReferenceVisual";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const c = await db.college.findUnique({ where: { slug: params.slug } });
  if (!c) return buildMetadata({ title: "College" });
  return buildMetadata({ title: c.name, description: c.description });
}

export default async function CollegeDetail({ params }: { params: { slug: string } }) {
  const college = await db.college.findUnique({ where: { slug: params.slug } });
  if (!college) notFound();
  const heroImage = safeImageSrc(college.heroImage, "");

  return (
    <>
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
