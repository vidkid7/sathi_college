import { PageHero } from "@/components/ui/PageHero";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { ReferenceVisual } from "@/components/ui/ReferenceVisual";
import { safeImageSrc } from "@/lib/utils";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd, webPageJsonLd } from "@/lib/seo";
import { postImageFor, realImageOr } from "@/lib/real-images";

export const metadata = buildMetadata({
  title: "Study Abroad and Admissions Blog",
  description: "Guides on universities, programs, scholarships, intakes, exams, admissions planning and student decision-making.",
  path: "/blog",
  keywords: ["study abroad blog", "admissions guides", "scholarship tips", "university comparison", "course finder guides", "exam tips"]
});
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  let posts: any[] = [];
  let categories: any[] = [];
  try {
    posts = await db.post.findMany({
      where: { published: true },
      include: { category: true },
      orderBy: { createdAt: "desc" }
    });
    categories = await db.category.findMany({ orderBy: { name: "asc" } });
  } catch {}
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/blog",
            name: "Engineering admission blog",
            description: "Exam tips, counselling guides, cutoff updates and career planning articles for engineering aspirants."
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" }
          ]),
          itemListJsonLd({
            path: "/blog",
            name: "Latest SathiCollege articles",
            items: posts.slice(0, 50).map((post) => ({
              name: post.title,
              path: `/blog/${post.slug}`,
              description: post.excerpt
            }))
          })
        ]}
      />
      <PageHero
        eyebrow="Insights"
        title={<>Latest <span className="gradient-text">Updates</span></>}
        description="Tips, guides and updates on engineering exams, counselling and career planning."
      />
      <section className="container py-12">
        {categories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Link href="/blog" className="rounded-lg border border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 px-4 py-2 text-sm font-semibold text-[rgb(var(--primary))]">
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/blog/category/${c.slug}`}
                className="rounded-lg border border-[rgb(var(--border))] px-4 py-2 text-sm font-semibold transition hover:bg-[rgb(var(--bg-elev))]"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}

        {posts.length === 0 ? (
          <p className="text-[rgb(var(--fg-muted))]">No articles yet.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => {
              const image = safeImageSrc(realImageOr(p.coverImage, postImageFor({ title: p.title, category: p.category?.name })), "");
              return (
              <Link key={p.id} href={`/blog/${p.slug}`} className="soft-card group flex h-full flex-col overflow-hidden">
                <div className="h-44 bg-gradient-to-br from-blue-50 to-sky-100 dark:from-slate-900 dark:to-blue-950">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" decoding="async" />
                  ) : (
                    <ReferenceVisual name="blog" className="h-full w-full object-contain p-5 transition duration-300 group-hover:scale-105" />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="badge"><CalendarDays className="h-3 w-3" /> {new Date(p.createdAt).toLocaleDateString()}</span>
                    {p.category && <span className="badge">{p.category.name}</span>}
                  </div>
                  <h3 className="font-display text-lg font-bold leading-tight">{p.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-[rgb(var(--fg-muted))]">{p.excerpt}</p>
                  <span className="subtle-link mt-4">Read article <ArrowRight className="h-4 w-4" /></span>
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
