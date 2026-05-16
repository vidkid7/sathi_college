import { CommunityFeed } from "@/components/community/CommunityFeed";
import { CtaBanner } from "@/components/home/CtaBanner";
import { db } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
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
    description: "Browse SathiCollege community posts, exam discussions, trends and entrance exam rooms."
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

  return (
    <>
      <CommunityFeed communities={communities} posts={posts} currentUser={session?.user ?? null} activeView={params.view as View} />
      <CtaBanner whatsappHref={whatsappLinkFromSettings(settings)} />
    </>
  );
}
