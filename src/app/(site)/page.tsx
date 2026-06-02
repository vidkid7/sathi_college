import { Hero } from "@/components/home/Hero";
import { Tools } from "@/components/home/Tools";
import { Communities } from "@/components/home/Communities";
import { About } from "@/components/home/About";
import { CtaBanner } from "@/components/home/CtaBanner";
import { db } from "@/lib/db";
import { getSettings, resolveCta, whatsappLinkFromSettings } from "@/lib/settings";
import { JsonLd } from "@/components/seo/JsonLd";
import { BRAND_DISPLAY_NAME, BRAND_READABLE_NAME, brandMetaDescription, itemListJsonLd, softwareApplicationJsonLd, webPageJsonLd } from "@/lib/seo";

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
            name: `${BRAND_DISPLAY_NAME} (${BRAND_READABLE_NAME}) global program search`,
            description: brandMetaDescription(settings.description)
          }),
          itemListJsonLd({
            path: "/",
            name: "SathiCollege global study tools",
            items: [
              { name: "Program Search", path: "/search-program", description: "Search global programs by country, tuition, scholarship and eligibility." },
              { name: "University Directory", path: "/colleges", description: "Browse universities and imported program records." },
              { name: "Scholarship Finder", path: "/search-program?quick=scholarship", description: "Find programs with scholarship indicators." },
              { name: "Student Communities", path: "/community", description: "Join student discussions and study planning communities." }
            ]
          }),
          softwareApplicationJsonLd({
            path: "/search-program",
            name: "SathiCollege Program Search",
            description: "Free web tool to search global programs, universities, tuition, scholarships and eligibility."
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
