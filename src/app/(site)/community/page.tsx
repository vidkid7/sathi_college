import { CommunityFeed } from "@/components/community/CommunityFeed";
import { CtaBanner } from "@/components/home/CtaBanner";
import { db } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { getSettings, whatsappLinkFromSettings } from "@/lib/settings";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listCommunityPosts } from "@/lib/community";

export const metadata = buildMetadata({
  title: "Student Communities",
  description: "Exam-specific communities for JEE, EAMCET, KCET, MHT CET, KEAM, TNEA, WBJEE and private engineering entrance aspirants."
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
      <CommunityFeed communities={communities} posts={posts} currentUser={session?.user ?? null} activeView="home" />
      <CtaBanner whatsappHref={whatsappLinkFromSettings(settings)} />
    </>
  );
}
