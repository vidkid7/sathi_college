import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { getSettings, whatsappLinkFromSettings } from "@/lib/settings";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const whatsappHref = whatsappLinkFromSettings(settings);
  return (
    <>
      <Navbar
        siteName={settings.siteName}
        shortName={settings.shortName}
        logoUrl={settings.logoUrl}
        whatsappHref={whatsappHref}
      />
      <main className="min-h-[60vh]">{children}</main>
      <Footer settings={settings} />
      <WhatsAppFab href={whatsappHref} />
    </>
  );
}
