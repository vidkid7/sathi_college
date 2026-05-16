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
  description: "Join exam-specific student communities for JEE, EAMCET, KCET, MHT CET, KEAM, TNEA, WBJEE and private engineering entrance aspirants.",
  path: "/community",
  keywords: ["engineering student community", "JEE community", "EAMCET community", "KCET community", "engineering counselling community"]
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
