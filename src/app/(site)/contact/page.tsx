import { PageHero } from "@/components/ui/PageHero";
import { ContactForm } from "@/components/site/ContactForm";
import { getSettings, whatsappLinkFromSettings } from "@/lib/settings";
import { Mail, MessageCircle, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const s = await getSettings();
  const wa = whatsappLinkFromSettings(s);
  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title={<>Talk to <span className="gradient-text">{s.siteName}</span></>}
        description="Have questions about exams, counselling or branch selection? Reach out — we're here to help."
      />
      <section className="container grid gap-8 py-12 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <a href={wa} target="_blank" rel="noopener noreferrer" className="glass-card flex items-center gap-4">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500/15 text-emerald-500"><MessageCircle className="h-5 w-5" /></span>
            <div>
              <p className="text-xs text-[rgb(var(--fg-muted))]">WhatsApp</p>
              <p className="font-semibold">{s.phone}</p>
            </div>
          </a>
          <a href={`mailto:${s.email}`} className="glass-card flex items-center gap-4">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-500/15 text-brand-500"><Mail className="h-5 w-5" /></span>
            <div>
              <p className="text-xs text-[rgb(var(--fg-muted))]">Email</p>
              <p className="font-semibold">{s.email}</p>
            </div>
          </a>
          <div className="glass-card flex items-center gap-4">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent-500/15 text-accent-500"><Phone className="h-5 w-5" /></span>
            <div>
              <p className="text-xs text-[rgb(var(--fg-muted))]">Phone</p>
              <p className="font-semibold">{s.phone}</p>
            </div>
          </div>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
