import { CommunityFeed } from "@/components/community/CommunityFeed";
import { CtaBanner } from "@/components/home/CtaBanner";
import { db } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { getSettings, whatsappLinkFromSettings } from "@/lib/settings";

export const metadata = buildMetadata({
  title: "Student Communities",
  description: "Exam-specific communities for JEE, EAMCET, KCET, MHT CET, KEAM, TNEA, WBJEE and private engineering entrance aspirants."
});

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const settings = await getSettings();
  let communities: any[] = [];
  try {
    communities = await db.community.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  } catch {}

  return (
    <>
      <CommunityFeed communities={communities} activeView="home" />
      <CtaBanner whatsappHref={whatsappLinkFromSettings(settings)} />
    </>
  );
}
