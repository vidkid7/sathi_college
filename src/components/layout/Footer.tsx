import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Twitter, Linkedin, Send } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import { safeImageSrc } from "@/lib/utils";

export function Footer({ settings }: { settings: SiteSettings }) {
  const s = settings;
  const social: { key: keyof SiteSettings["social"]; icon: any; label: string }[] = [
    { key: "facebook", icon: Facebook, label: "Facebook" },
    { key: "instagram", icon: Instagram, label: "Instagram" },
    { key: "youtube", icon: Youtube, label: "YouTube" },
    { key: "twitter", icon: Twitter, label: "Twitter / X" },
    { key: "linkedin", icon: Linkedin, label: "LinkedIn" },
    { key: "telegram", icon: Send, label: "Telegram" }
  ];

  return (
    <footer className="relative mt-20 border-t border-[rgb(var(--border))]/70 bg-white/48 backdrop-blur dark:bg-[rgb(var(--bg))]/48">
      <div className="container py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={safeImageSrc(s.logoUrl, "/assets/brand/sathi-logo.png")} alt={`${s.siteName} logo`} className="h-10 w-10 rounded-xl object-contain shadow-lg shadow-blue-500/20" />
              <span className="font-display text-lg font-extrabold">{s.siteName}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-[rgb(var(--fg-muted))]">{s.footer.aboutText}</p>
            <div className="mt-5 space-y-2 text-sm text-[rgb(var(--fg-muted))]">
              {s.phone && (
                <a href={`tel:${s.phone}`} className="flex items-center gap-2 hover:text-[rgb(var(--fg))]">
                  <Phone className="h-4 w-4" /> {s.phone}
                </a>
              )}
              {s.email && (
                <a href={`mailto:${s.email}`} className="flex items-center gap-2 hover:text-[rgb(var(--fg))]">
                  <Mail className="h-4 w-4" /> {s.email}
                </a>
              )}
              {s.address && (
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {s.address}</p>
              )}
            </div>
            <div className="mt-5 flex gap-2">
              {social.map((it) => {
                const url = s.social?.[it.key];
                if (!url) return null;
                const Icon = it.icon;
                return (
                  <a
                    key={it.key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={it.label}
                    className="glass grid h-9 w-9 place-items-center rounded-lg transition hover:scale-105"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {s.footer.columns.map((c) => (
            <div key={c.title}>
              <h4 className="mb-3 text-sm font-semibold">{c.title}</h4>
              <ul className="space-y-2 text-sm text-[rgb(var(--fg-muted))]">
                {c.links.map((l) => (
                  <li key={`${c.title}-${l.href}-${l.label}`}>
                    <Link href={l.href} className="hover:text-[rgb(var(--fg))]">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[rgb(var(--border))] pt-6 text-xs text-[rgb(var(--fg-muted))] sm:flex-row">
          <p>{s.footer.copyright}</p>
          <p>{s.footer.bottomNote}</p>
        </div>
      </div>
    </footer>
  );
}
