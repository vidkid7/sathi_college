import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { canonicalUrl, getSiteUrl } from "@/lib/seo";
import { mockTests } from "@/lib/exam-catalog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entry = (path: string, lastModified: Date = now, priority = 0.7, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly") => ({
    url: canonicalUrl(path),
    lastModified,
    changeFrequency,
    priority
  });
  const staticRoutes = [
    entry("/", now, 1, "daily"),
    entry("/colleges", now, 0.95, "daily"),
    entry("/exams", now, 0.95, "daily"),
    entry("/rank-predictor", now, 0.9, "weekly"),
    entry("/college-predictor", now, 0.9, "weekly"),
    entry("/college-comparison", now, 0.85, "weekly"),
    entry("/mock-test", now, 0.85, "weekly"),
    entry("/community", now, 0.8, "daily"),
    entry("/blog", now, 0.8, "daily"),
    entry("/ap-eapcet-ai-chatbot", now, 0.75, "weekly"),
    entry("/scholarship", now, 0.7, "monthly"),
    entry("/about", now, 0.6, "monthly"),
    entry("/contact", now, 0.55, "monthly"),
    entry("/privacy-policy", now, 0.2, "yearly"),
    entry("/terms-of-service", now, 0.2, "yearly")
  ];
  const mockRoutes = mockTests.map((test) => entry(`/mock-test/${test.slug}`, now, 0.75, "monthly"));

  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const [exams, colleges, posts, categories, communityPosts] = await Promise.all([
      db.exam.findMany({ select: { slug: true, updatedAt: true } }),
      db.college.findMany({ select: { slug: true, updatedAt: true } }),
      db.post.findMany({ where: { published: true }, select: { slug: true, updatedAt: true, category: { select: { slug: true } } } }),
      db.category.findMany({ select: { slug: true, updatedAt: true } }),
      db.communityPost.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } })
    ]);
    dynamicRoutes = [
      ...exams.flatMap((e) => [
        entry(`/exams/${e.slug}`, e.updatedAt, 0.9, "weekly"),
        entry(`/rank-predictor/${e.slug}`, e.updatedAt, 0.85, "weekly"),
        entry(`/college-predictor/${e.slug}`, e.updatedAt, 0.85, "weekly")
      ]),
      ...colleges.flatMap((c) => [
        entry(`/colleges/${c.slug}`, c.updatedAt, 0.9, "weekly"),
        entry(`/college-comparison/${c.slug}`, c.updatedAt, 0.7, "monthly")
      ]),
      ...categories.map((c) => entry(`/blog/category/${c.slug}`, c.updatedAt, 0.6, "weekly")),
      ...posts.flatMap((p) => [
        entry(`/blog/${p.slug}`, p.updatedAt, 0.75, "weekly"),
        ...(p.category?.slug ? [entry(`/blog/${p.category.slug}/${p.slug}`, p.updatedAt, 0.65, "weekly")] : [])
      ]),
      ...communityPosts.map((p) => entry(`/community/post/${p.slug}`, p.updatedAt, 0.55, "daily"))
    ];
  } catch {}

  const unique = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const route of [...staticRoutes, ...mockRoutes, ...dynamicRoutes]) {
    if (route.url.startsWith(getSiteUrl())) unique.set(route.url, route);
  }
  return Array.from(unique.values());
}
