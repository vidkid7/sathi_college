import { CommunityFeed } from "@/components/community/CommunityFeed";
import { CtaBanner } from "@/components/home/CtaBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { db } from "@/lib/db";
import { breadcrumbJsonLd, buildMetadata, itemListJsonLd, webPageJsonLd } from "@/lib/seo";
import { getSettings, whatsappLinkFromSettings } from "@/lib/settings";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listCommunityPosts } from "@/lib/community";
import { notFound } from "next/navigation";

const views = ["trending", "explore", "all"] as const;
type View = typeof views[number];

export async function generateMetadata({ params }: { params: { view: string } }) {
  const label = params.view === "trending" ? "Trending Community Posts" : params.view === "explore" ? "Explore Communities" : "All Community Posts";
  return buildMetadata({
    title: label,
    description: "Browse SathiCollege community posts, exam discussions, trends and entrance exam rooms.",
    path: `/community/${params.view}`,
    keywords: ["student community", "entrance exam community", "college discussion forum", "SathiCollege community"]
  });
}

export const dynamic = "force-dynamic";

export default async function CommunityViewPage({ params }: { params: { view: string } }) {
  if (!views.includes(params.view as View)) notFound();
  const session = await getServerSession(authOptions);
  const settings = await getSettings();
  let communities: any[] = [];
  let posts: any[] = [];
  try {
    communities = await db.community.findMany({ where: { active: true }, orderBy: { order: "asc" } });
    posts = await listCommunityPosts(session?.user?.id);
  } catch {}
  const label = params.view === "trending" ? "Trending Community Posts" : params.view === "explore" ? "Explore Communities" : "All Community Posts";
  const listItems = (params.view === "explore" ? communities : posts).slice(0, 30).map((item: any, index) => ({
    name: item.title || item.name,
    path: item.slug ? (item.title ? `/community/post/${item.slug}` : `/community?room=${item.slug}`) : `/community/${params.view}`,
    description: item.body || item.description || "SathiCollege community discussion"
  }));

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: label,
            description: "Student-led entrance exam discussions, college decisions and counselling updates on SathiCollege.",
            path: `/community/${params.view}`
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Community", path: "/community" },
            { name: label, path: `/community/${params.view}` }
          ]),
          itemListJsonLd({
            path: `/community/${params.view}`,
            name: `${label} on SathiCollege`,
            items: listItems
          })
        ]}
      />
      <CommunityFeed communities={communities} posts={posts} currentUser={session?.user ?? null} activeView={params.view as View} />
      <CtaBanner whatsappHref={whatsappLinkFromSettings(settings)} />
    </>
  );
}
