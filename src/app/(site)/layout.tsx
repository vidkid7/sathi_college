import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingContactActions } from "@/components/layout/FloatingContactActions";
import { getSettings, whatsappLinkFromSettings } from "@/lib/settings";
import { getNavbarData } from "@/lib/navbar-data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, menuData] = await Promise.all([getSettings(), getNavbarData()]);
  const whatsappHref = whatsappLinkFromSettings(settings);
  return (
    <>
      <Navbar
        siteName={settings.siteName}
        shortName={settings.shortName}
        logoUrl={settings.logoUrl}
        whatsappHref={whatsappHref}
        menuData={menuData}
      />
      <main className="min-h-[60vh]">{children}</main>
      <Footer settings={settings} />
      <FloatingContactActions whatsappHref={whatsappHref} />
    </>
  );
}
