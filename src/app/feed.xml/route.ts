import { db } from "@/lib/db";
import { canonicalUrl, getSiteUrl } from "@/lib/seo";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  let posts: Array<{ title: string; slug: string; excerpt: string; updatedAt: Date; createdAt: Date }> = [];
  try {
    posts = await db.post.findMany({
      where: { published: true },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: { title: true, slug: true, excerpt: true, updatedAt: true, createdAt: true }
    });
  } catch {}

  const items = posts
    .map((post) => {
      const url = canonicalUrl(`/blog/${post.slug}`);
      return `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${url}</link>
  <guid isPermaLink="true">${url}</guid>
  <description>${escapeXml(post.excerpt)}</description>
  <pubDate>${post.createdAt.toUTCString()}</pubDate>
  <lastBuildDate>${post.updatedAt.toUTCString()}</lastBuildDate>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>SathiCollege Blog</title>
  <link>${getSiteUrl()}</link>
  <description>Engineering admission guides, rank predictor updates, college predictor guidance, counselling tips and student community posts.</description>
  <language>en-IN</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${canonicalUrl("/feed.xml")}" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800"
    }
  });
}
