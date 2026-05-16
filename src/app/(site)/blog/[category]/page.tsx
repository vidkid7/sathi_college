import { PageHero } from "@/components/ui/PageHero";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { fallbackArticle } from "@/lib/blog-fallback";
import { safeImageSrc } from "@/lib/utils";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleJsonLd, breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { category: string } }) {
  const post = await db.post.findUnique({ where: { slug: params.category } });
  if (post) {
    return buildMetadata({
      title: post.title,
      description: post.excerpt,
      path: `/blog/${post.slug}`,
      image: post.coverImage,
      type: "article",
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt
    });
  }
  const fallback = fallbackArticle(undefined, params.category);
  return buildMetadata({ title: fallback.title, description: fallback.excerpt, path: `/blog/${params.category}`, type: "article" });
}

export default async function PostPage({ params }: { params: { category: string } }) {
  const post = await db.post.findUnique({
    where: { slug: params.category },
    include: { category: true }
  });
  if (post && !post.published) notFound();
  const fallback = post ? null : fallbackArticle(undefined, params.category);
  const title = post?.title ?? fallback!.title;
  const excerpt = post?.excerpt ?? fallback!.excerpt;
  const content = post?.content ?? fallback!.content;
  const coverImage = safeImageSrc(post?.coverImage, "");
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: `/blog/${params.category}`,
            name: title,
            description: excerpt
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: title, path: `/blog/${params.category}` }
          ]),
          articleJsonLd({
            path: `/blog/${params.category}`,
            title,
            description: excerpt,
            datePublished: post?.createdAt,
            dateModified: post?.updatedAt,
            image: post?.coverImage
          })
        ]}
      />
      <PageHero title={<>{title}</>} description={excerpt}>
        <div className="flex flex-wrap gap-2">
          <span className="badge"><CalendarDays className="h-3 w-3" /> {new Date(post?.createdAt ?? Date.now()).toLocaleDateString()}</span>
          {post?.category ? (
            <Link href={`/blog/category/${post.category.slug}`} className="badge hover:bg-[rgb(var(--bg-elev))]">
              {post.category.name}
            </Link>
          ) : (
            <span className="badge">Editorial shell</span>
          )}
        </div>
      </PageHero>
      <article className="container py-12">
        {coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt="" className="mb-6 h-72 w-full rounded-lg border border-[rgb(var(--border))] object-cover shadow-xl" loading="eager" decoding="async" />
        )}
        <div className="reference-panel prose prose-lg max-w-3xl whitespace-pre-line p-6 dark:prose-invert sm:p-8">
          {content}
        </div>
      </article>
    </>
  );
}
