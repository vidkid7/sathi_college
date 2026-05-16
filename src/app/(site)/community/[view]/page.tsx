import { CommunityFeed } from "@/components/community/CommunityFeed";
import { CtaBanner } from "@/components/home/CtaBanner";
import { db } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { getSettings, whatsappLinkFromSettings } from "@/lib/settings";
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
  const settings = await getSettings();
  let communities: any[] = [];
  try {
    communities = await db.community.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  } catch {}

  return (
    <>
      <CommunityFeed communities={communities} activeView={params.view as View} />
      <CtaBanner whatsappHref={whatsappLinkFromSettings(settings)} />
    </>
  );
}
