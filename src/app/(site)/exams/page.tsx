import { PageHero } from "@/components/ui/PageHero";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { ReferenceVisual } from "@/components/ui/ReferenceVisual";
import { safeImageSrc } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "Engineering Entrance Exams",
  description: "JEE, EAMCET, KCET, MHT-CET, KEAM, TNEA, WBJEE — guides, dates and counselling info."
});

export const dynamic = "force-dynamic";

export default async function ExamsPage() {
  let exams: any[] = [];
  try {
    exams = await db.exam.findMany({ where: { active: true } });
  } catch {
    exams = [];
  }
  return (
    <>
      <PageHero
        eyebrow="Entrance exams"
        title={<>Engineering <span className="gradient-text">Exams</span></>}
        description="Stay updated on JEE, EAMCET, KCET, MHT-CET, KEAM, TNEA, WBJEE and other engineering entrance exams in India."
      />
      <section className="container py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((e) => {
            const image = safeImageSrc(e.heroImage, "");
            return (
            <Link key={e.id} href={`/exams/${e.slug}`} className="soft-card group flex h-full flex-col overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-blue-50 to-violet-50 p-3 dark:from-slate-900 dark:to-blue-950">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt={`${e.name} logo`} className="h-full w-full rounded-lg bg-white/80 object-contain p-3 transition duration-300 group-hover:scale-105 dark:bg-white/90" loading="lazy" decoding="async" />
                ) : (
                  <ReferenceVisual name="books" className="h-full w-full object-contain transition duration-300 group-hover:scale-105" />
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center gap-3">
                <span className="icon-tile">
                  <BookOpen className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold">{e.name}</h3>
                  <p className="text-xs text-[rgb(var(--fg-muted))]">{e.shortName}</p>
                </div>
              </div>
              <p className="mt-3 flex-1 text-sm leading-6 text-[rgb(var(--fg-muted))]">{e.description}</p>
              <span className="subtle-link mt-4">
                Learn more <ArrowRight className="h-4 w-4" />
              </span>
              </div>
            </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
