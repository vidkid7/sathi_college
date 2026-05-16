import { Hero } from "@/components/home/Hero";
import { Tools } from "@/components/home/Tools";
import { Communities } from "@/components/home/Communities";
import { About } from "@/components/home/About";
import { CtaBanner } from "@/components/home/CtaBanner";
import { db } from "@/lib/db";
import { getSettings, resolveCta, whatsappLinkFromSettings } from "@/lib/settings";
import { JsonLd } from "@/components/seo/JsonLd";
import { itemListJsonLd, softwareApplicationJsonLd, webPageJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSettings();
  const whatsappHref = whatsappLinkFromSettings(settings);

  let communities: any[] = [];
  try {
    communities = await db.community.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  } catch {
    communities = [];
  }

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/",
            name: `${settings.siteName} engineering admissions guidance`,
            description: settings.description
          }),
          itemListJsonLd({
            path: "/",
            name: "SathiCollege core admission tools",
            items: [
              { name: "Rank Predictor", path: "/rank-predictor", description: "Estimate engineering entrance exam rank from marks and category." },
              { name: "College Predictor", path: "/college-predictor", description: "Find likely engineering colleges from rank and category." },
              { name: "Mock Tests", path: "/mock-test", description: "Practice entrance exam mock tests with solutions." },
              { name: "Student Communities", path: "/community", description: "Join exam-specific student discussion communities." }
            ]
          }),
          softwareApplicationJsonLd({
            path: "/rank-predictor",
            name: "SathiCollege Rank Predictor",
            description: "Free web tool to estimate engineering entrance exam ranks."
          })
        ]}
      />
      <Hero
        eyebrow={settings.hero.eyebrow}
        titleLine1={settings.hero.titleLine1}
        titleHighlight={settings.hero.titleHighlight}
        titleLine2={settings.hero.titleLine2}
        description={settings.hero.description}
        primaryCta={{ label: settings.hero.primaryCtaLabel, href: resolveCta(settings.hero.primaryCtaHref, settings) }}
        secondaryCta={{ label: settings.hero.secondaryCtaLabel, href: resolveCta(settings.hero.secondaryCtaHref, settings) }}
        stats={settings.hero.stats}
      />
      <Tools />
      <Communities items={communities} />
      <About title={settings.about.title} body={settings.about.body} whatsappHref={whatsappHref} />
      <CtaBanner whatsappHref={whatsappHref} />
    </>
  );
}
