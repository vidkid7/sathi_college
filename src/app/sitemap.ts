import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/seo";
import { mockTests } from "@/lib/exam-catalog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const staticRoutes = [
    "", "/about", "/contact", "/privacy", "/privacy-policy", "/terms", "/terms-of-service",
    "/blog", "/colleges", "/exams", "/community", "/college-comparison",
    "/rank-predictor", "/college-predictor", "/mock-test", "/ap-eapcet-ai-chatbot",
    "/scholarship", "/scholarship/apply", "/scholarship/privacy-policy",
    "/scholarship/cookie-policy", "/scholarship/partners", "/scholarship/testimonials",
    "/scholarship/about", "/scholarship/terms-of-service"
  ].map((p) => ({ url: `${base}${p}`, lastModified: new Date() }));
  const mockRoutes = mockTests.map((test) => ({ url: `${base}/mock-test/${test.slug}`, lastModified: new Date() }));

  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const [exams, colleges, posts] = await Promise.all([
      db.exam.findMany({ select: { slug: true, updatedAt: true } }),
      db.college.findMany({ select: { slug: true, updatedAt: true } }),
      db.post.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } })
    ]);
    dynamicRoutes = [
      ...exams.flatMap((e) => [
        { url: `${base}/exams/${e.slug}`, lastModified: e.updatedAt },
        { url: `${base}/rank-predictor/${e.slug}`, lastModified: e.updatedAt },
        { url: `${base}/college-predictor/${e.slug}`, lastModified: e.updatedAt }
      ]),
      ...colleges.map((c) => ({ url: `${base}/colleges/${c.slug}`, lastModified: c.updatedAt })),
      ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt }))
    ];
  } catch {}

  return [...staticRoutes, ...mockRoutes, ...dynamicRoutes];
}
