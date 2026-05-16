import { PageHero } from "@/components/ui/PageHero";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { ReferenceVisual } from "@/components/ui/ReferenceVisual";
import { safeImageSrc } from "@/lib/utils";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd, webPageJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const c = await db.category.findUnique({ where: { slug: params.slug } });
  if (!c) return buildMetadata({ title: "Category" });
  return buildMetadata({ title: c.name, description: c.description ?? `Articles in ${c.name}`, path: `/blog/category/${c.slug}` });
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await db.category.findUnique({ where: { slug: params.slug } });
  if (!category) notFound();
  const posts = await db.post.findMany({
    where: { published: true, categoryId: category.id },
    orderBy: { createdAt: "desc" }
  });
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: `/blog/category/${category.slug}`,
            name: `${category.name} articles`,
            description: category.description ?? `Latest news and guides in ${category.name}.`
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: category.name, path: `/blog/category/${category.slug}` }
          ]),
          itemListJsonLd({
            path: `/blog/category/${category.slug}`,
            name: `${category.name} articles`,
            items: posts.map((post) => ({
              name: post.title,
              path: `/blog/${post.slug}`,
              description: post.excerpt
            }))
          })
        ]}
      />
      <PageHero
        eyebrow="Category"
        title={<>{category.name} <span className="gradient-text">Articles</span></>}
        description={category.description ?? `Latest news and guides in ${category.name}.`}
      />
      <section className="container py-12">
        {posts.length === 0 ? (
          <p className="text-[rgb(var(--fg-muted))]">No articles in this category yet.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => {
              const image = safeImageSrc(p.coverImage, "");
              return (
              <Link key={p.id} href={`/blog/${p.slug}`} className="soft-card group flex h-full flex-col overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-blue-50 to-sky-100 dark:from-slate-900 dark:to-blue-950">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" decoding="async" />
                  ) : (
                    <ReferenceVisual name="blog" className="h-full w-full object-contain p-5 transition duration-300 group-hover:scale-105" />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="badge mb-3"><CalendarDays className="h-3 w-3" /> {new Date(p.createdAt).toLocaleDateString()}</span>
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
