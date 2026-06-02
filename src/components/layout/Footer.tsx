import Link from "next/link";
import {
  ArrowRight,
  Bot,
  ChevronDown,
  Facebook,
  GraduationCap,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Send,
  Sparkles,
  Twitter,
  Youtube
} from "lucide-react";
import { whatsappLinkFromSettings, type SiteSettings } from "@/lib/settings";
import { safeImageSrc } from "@/lib/utils";

export function Footer({ settings }: { settings: SiteSettings }) {
  const s = settings;
  const whatsappHref = whatsappLinkFromSettings(s);
  const social: { key: keyof SiteSettings["social"]; icon: any; label: string }[] = [
    { key: "facebook", icon: Facebook, label: "Facebook" },
    { key: "instagram", icon: Instagram, label: "Instagram" },
    { key: "youtube", icon: Youtube, label: "YouTube" },
    { key: "twitter", icon: Twitter, label: "Twitter / X" },
    { key: "linkedin", icon: Linkedin, label: "LinkedIn" },
    { key: "telegram", icon: Send, label: "Telegram" }
  ];

  return (
    <footer className="page-visual-bg relative mt-20 overflow-hidden border-t border-white/60 dark:border-white/10">
      <div className="container pb-44 pt-8 sm:pb-36 sm:pt-14 lg:py-16">
        <div className="liquid-panel overflow-hidden p-4 sm:p-6 lg:p-8">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="flex min-w-0 items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-xl shadow-blue-500/25">
                <Bot className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[rgb(var(--primary))]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Sathi AI
                </p>
                <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight sm:text-3xl">Plan admissions with one connected workspace.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[rgb(var(--fg-muted))]">
                  Search programs, compare universities, review scholarships, check eligibility and keep study decisions organized with SathiCollege.
                </p>
              </div>
            </div>
            <Link href="/search-program" className="btn-primary w-full px-5 py-3 sm:w-auto">
              Search Programs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:hidden">
          <div className="liquid-surface p-4">
            <Link href="/" className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={safeImageSrc(s.logoUrl, "/assets/brand/sathi-logo-glass.png")} alt={`${s.siteName} logo`} className="h-10 w-10 rounded-xl object-contain shadow-lg shadow-blue-500/20" />
              <span className="font-display text-lg font-extrabold">{s.siteName}</span>
            </Link>
            <p className="mt-3 text-sm leading-6 text-[rgb(var(--fg-muted))]">{s.footer.aboutText}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link href="/search-program" className="btn-primary h-11 justify-center px-3 text-sm">
                <Search className="h-4 w-4" />
                Search
              </Link>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-ghost h-11 justify-center px-3 text-sm">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-[rgb(var(--fg-muted))]">
              {s.phone && (
                <a href={`tel:${s.phone}`} className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-2 transition hover:bg-white/48 hover:text-[rgb(var(--fg))] dark:hover:bg-white/5">
                  <Phone className="h-4 w-4 shrink-0 text-[rgb(var(--primary))]" /> <span className="truncate">{s.phone}</span>
                </a>
              )}
              {s.email && (
                <a href={`mailto:${s.email}`} className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-2 transition hover:bg-white/48 hover:text-[rgb(var(--fg))] dark:hover:bg-white/5">
                  <Mail className="h-4 w-4 shrink-0 text-[rgb(var(--primary))]" /> <span className="truncate">{s.email}</span>
                </a>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            {s.footer.columns.map((c, index) => (
              <details key={c.title} className="group liquid-surface overflow-hidden px-4 py-3" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-extrabold marker:content-none">
                  <span className="flex min-w-0 items-center gap-2">
                    <GraduationCap className="h-4 w-4 shrink-0 text-[rgb(var(--primary))]" />
                    <span className="truncate">{c.title}</span>
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-[rgb(var(--fg-muted))] transition group-open:rotate-180" />
                </summary>
                <ul className="mt-3 grid grid-cols-1 gap-1 text-sm text-[rgb(var(--fg-muted))]">
                  {c.links.map((l) => (
                    <li key={`${c.title}-${l.href}-${l.label}`}>
                      <Link href={l.href} className="block rounded-lg px-2 py-2 transition hover:bg-white/48 hover:text-[rgb(var(--primary))] dark:hover:bg-white/5">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>

          <div className="liquid-surface flex items-center justify-between gap-3 p-3">
            <span className="text-xs font-bold text-[rgb(var(--fg-muted))]">Follow SathiCollege</span>
            <div className="flex shrink-0 gap-2">
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
                    className="glass grid h-9 w-9 place-items-center rounded-lg transition hover:scale-105 hover:text-[rgb(var(--primary))]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 hidden gap-5 md:grid md:grid-cols-2 lg:grid-cols-6">
          <div className="liquid-surface p-5 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={safeImageSrc(s.logoUrl, "/assets/brand/sathi-logo-glass.png")} alt={`${s.siteName} logo`} className="h-11 w-11 rounded-xl object-contain shadow-lg shadow-blue-500/20" />
              <span className="font-display text-xl font-extrabold">{s.siteName}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[rgb(var(--fg-muted))]">{s.footer.aboutText}</p>
            <div className="mt-5 grid gap-2 text-sm text-[rgb(var(--fg-muted))]">
              {s.phone && (
                <a href={`tel:${s.phone}`} className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-white/48 hover:text-[rgb(var(--fg))] dark:hover:bg-white/5">
                  <Phone className="h-4 w-4 shrink-0 text-[rgb(var(--primary))]" /> <span className="truncate">{s.phone}</span>
                </a>
              )}
              {s.email && (
                <a href={`mailto:${s.email}`} className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-white/48 hover:text-[rgb(var(--fg))] dark:hover:bg-white/5">
                  <Mail className="h-4 w-4 shrink-0 text-[rgb(var(--primary))]" /> <span className="truncate">{s.email}</span>
                </a>
              )}
              {s.address && (
                <p className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5"><MapPin className="h-4 w-4 shrink-0 text-[rgb(var(--primary))]" /> <span className="truncate">{s.address}</span></p>
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
                    className="glass grid h-10 w-10 place-items-center rounded-lg transition hover:scale-105 hover:text-[rgb(var(--primary))]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {s.footer.columns.map((c) => (
            <div key={c.title} className="liquid-surface p-5">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-extrabold">
                <GraduationCap className="h-4 w-4 text-[rgb(var(--primary))]" />
                {c.title}
              </h4>
              <ul className="grid gap-1.5 text-sm text-[rgb(var(--fg-muted))]">
                {c.links.map((l) => (
                  <li key={`${c.title}-${l.href}-${l.label}`}>
                    <Link href={l.href} className="block rounded-lg px-2 py-1.5 transition hover:bg-white/48 hover:text-[rgb(var(--primary))] dark:hover:bg-white/5">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="liquid-surface mt-5 flex flex-col items-center justify-between gap-3 px-4 py-3 text-center text-xs text-[rgb(var(--fg-muted))] sm:flex-row sm:text-left">
          <p>{s.footer.copyright}</p>
          <p>{s.footer.bottomNote}</p>
        </div>
      </div>
    </footer>
  );
}
