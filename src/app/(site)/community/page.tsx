import { CommunityFeed } from "@/components/community/CommunityFeed";
import { CtaBanner } from "@/components/home/CtaBanner";
import { db } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { getSettings, whatsappLinkFromSettings } from "@/lib/settings";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listCommunityPosts } from "@/lib/community";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd, webPageJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Student Communities",
  description: "Join student communities for admissions, exams, study abroad planning, university shortlisting, scholarships and peer guidance.",
  path: "/community",
  keywords: ["student community", "study abroad community", "admissions community", "exam community", "scholarship guidance", "university shortlisting"]
});

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const session = await getServerSession(authOptions);
  const settings = await getSettings();
  let communities: any[] = [];
  let posts: any[] = [];
  try {
    communities = await db.community.findMany({ where: { active: true }, orderBy: { order: "asc" } });
    posts = await listCommunityPosts(session?.user?.id);
  } catch {}

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/community",
            name: "Engineering student communities",
            description: "Exam-specific discussion communities for engineering aspirants across India."
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Community", path: "/community" }
          ]),
          itemListJsonLd({
            path: "/community",
            name: "SathiCollege student communities",
            items: communities.map((community) => ({
              name: community.name,
              path: `/community/${community.slug}`,
              description: community.description
            }))
          })
        ]}
      />
      <CommunityFeed communities={communities} posts={posts} currentUser={session?.user ?? null} activeView="home" />
      <CtaBanner whatsappHref={whatsappLinkFromSettings(settings)} />
    </>
  );
}
