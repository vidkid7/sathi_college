import { PageHero } from "@/components/ui/PageHero";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { ReferenceVisual } from "@/components/ui/ReferenceVisual";
import { safeImageSrc } from "@/lib/utils";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd, webPageJsonLd } from "@/lib/seo";
import { examImageFor, realImageOr } from "@/lib/real-images";

export const metadata = buildMetadata({
  title: "Entrance Exams",
  description: "Engineering, medical, management, commerce, law, design and common entrance exam guides with rank predictors and counselling info.",
  path: "/exams",
  keywords: ["entrance exams", "JEE Main", "NEET UG", "CAT", "CUET", "CLAT", "NIFT", "WBJEE"]
});

export const dynamic = "force-dynamic";

export default async function ExamsPage({ searchParams }: { searchParams?: { category?: string } }) {
  const category = searchParams?.category?.trim();
  let exams: any[] = [];
  try {
    exams = await db.exam.findMany({
      where: { active: true, ...(category ? { category } : {}) },
      orderBy: [{ category: "asc" }, { name: "asc" }]
    });
  } catch {
    exams = [];
  }
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/exams",
            name: "Entrance exams",
            description: "Guides and admission tools for engineering, medical, management, commerce, law, design and common entrance exams."
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Exams", path: "/exams" }
          ]),
          itemListJsonLd({
            path: "/exams",
            name: "Engineering entrance exam guides",
            items: exams.map((exam) => ({
              name: exam.name,
              path: `/exams/${exam.slug}`,
              description: exam.description
            }))
          })
        ]}
      />
      <PageHero
        eyebrow="Entrance exams"
        title={<>Entrance <span className="gradient-text">Exams</span></>}
        description="Stay updated on engineering, medical, management, commerce, law, design, science and common entrance exams in India."
      />
      <section className="container py-12">
        <div className="reference-panel mb-8 flex flex-wrap items-center gap-2 p-4">
          <Link href="/exams" className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${!category ? "border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]" : "border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-elev))]"}`}>
            All
          </Link>
          {["Engineering", "Medical", "Management", "Commerce & Banking", "Law", "Design", "Sciences", "Education"].map((item) => (
            <Link
              key={item}
              href={`/exams?category=${encodeURIComponent(item)}`}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                category === item
                  ? "border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
                  : "border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-elev))]"
              }`}
            >
              {item}
            </Link>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((e) => {
            const image = safeImageSrc(realImageOr(e.heroImage, examImageFor({ name: e.name, category: e.category })), "");
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
