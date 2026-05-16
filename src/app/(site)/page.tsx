import { Hero } from "@/components/home/Hero";
import { Tools } from "@/components/home/Tools";
import { Communities } from "@/components/home/Communities";
import { About } from "@/components/home/About";
import { CtaBanner } from "@/components/home/CtaBanner";
import { db } from "@/lib/db";
import { getSettings, resolveCta, whatsappLinkFromSettings } from "@/lib/settings";

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
