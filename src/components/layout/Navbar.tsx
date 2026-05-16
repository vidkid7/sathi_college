"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Search, ChevronDown, UserRound, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import { safeImageSrc } from "@/lib/utils";

const directLinks = [
  { href: "/", label: "Home" },
  { href: "/community", label: "Community" }
];

const navGroups = [
  {
    label: "Colleges",
    items: [
      { href: "/colleges", label: "All colleges" },
      { href: "/colleges?type=Government", label: "Government colleges" },
      { href: "/colleges?type=Private", label: "Private colleges" },
      { href: "/college-comparison", label: "Compare colleges" }
    ]
  },
  {
    label: "Predictors",
    items: [
      { href: "/rank-predictor", label: "Rank predictor" },
      { href: "/college-predictor", label: "College predictor" },
      { href: "/college-comparison", label: "Cutoff comparison" }
    ]
  },
  {
    label: "Explore",
    items: [
      { href: "/exams", label: "Entrance exams" },
      { href: "/mock-test", label: "Mock tests" },
      { href: "/scholarship", label: "Scholarships" },
      { href: "/ap-eapcet-ai-chatbot", label: "AI chatbot" }
    ]
  },
  {
    label: "More",
    items: [
      { href: "/blog", label: "Blog" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy-policy", label: "Privacy policy" }
    ]
  }
];

const instituteSuggestions = [
  { name: "IIT Bombay", href: "/colleges/iit-bombay", logo: "/assets/institutes/iit-bombay.png", meta: "Mumbai, Maharashtra" },
  { name: "IIT Delhi", href: "/colleges/iit-delhi", logo: "/assets/institutes/iit-delhi.png", meta: "New Delhi, Delhi" },
  { name: "NIT Warangal", href: "/colleges/nit-warangal", logo: "/assets/institutes/nit-warangal.png", meta: "Warangal, Telangana" },
  { name: "BITS Pilani", href: "/colleges/bits-pilani", logo: "/assets/institutes/bits-pilani.png", meta: "Pilani, Rajasthan" },
  { name: "VIT Vellore", href: "/colleges/vit-vellore", logo: "/assets/institutes/vit-vellore.png", meta: "Vellore, Tamil Nadu" },
  { name: "IIIT Hyderabad", href: "/colleges/iiit-hyderabad", logo: "/assets/institutes/iiit-hyderabad.png", meta: "Hyderabad, Telangana" }
];

export type NavbarProps = {
  siteName: string;
  shortName: string;
  logoUrl: string | null;
  whatsappHref: string;
};

export function Navbar({ siteName, shortName, logoUrl, whatsappHref }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const brandRestRaw = siteName.toLowerCase().startsWith(shortName.toLowerCase())
    ? siteName.slice(shortName.length)
    : siteName.replace(shortName, "").trim();
  const brandRest = brandRestRaw ? `${brandRestRaw.charAt(0).toUpperCase()}${brandRestRaw.slice(1)}` : "College";
  const brandLogoSrc = safeImageSrc(logoUrl, "/assets/brand/sathi-logo.png");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setActiveGroup(null);
    setOpen(false);
    setSearchFocused(false);
  }, [pathname]);

  useEffect(() => {
    const closeMenus = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-nav-dropdown]")) setActiveGroup(null);
    };
    window.addEventListener("pointerdown", closeMenus);
    return () => window.removeEventListener("pointerdown", closeMenus);
  }, []);

  const brand = (
    <Link href="/" className="flex shrink-0 items-center gap-2 no-tap" aria-label={siteName}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={brandLogoSrc} alt={`${siteName} logo`} className="h-11 w-11 rounded-xl object-contain shadow-lg shadow-blue-500/20" />
      <span className="whitespace-nowrap font-display text-xl font-extrabold">
        <span className="text-[rgb(var(--primary))]">{shortName}</span>
        <span>{brandRest}</span>
      </span>
    </Link>
  );

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/colleges?search=${encodeURIComponent(q)}` : "/colleges");
    setOpen(false);
  }
  const searchMatches = instituteSuggestions
    .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()) || item.meta.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  return (
    <header className={`sticky top-0 z-50 transition-all ${scrolled ? "nav-blur" : "bg-white/72 dark:bg-[rgb(var(--bg))]/72 backdrop-blur-xl"}`}>
      <div className="container flex h-16 items-center justify-between gap-4">
        {brand}

        <nav className="ml-3 hidden items-center gap-1 xl:flex">
          {directLinks.slice(0, 1).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-[rgb(var(--primary))] transition hover:bg-[rgb(var(--primary))]/10"
            >
              {l.label}
            </Link>
          ))}
          {navGroups.slice(0, 3).map((group) => (
            <div key={group.label} data-nav-dropdown className="relative">
              <button
                type="button"
                onClick={() => setActiveGroup((current) => current === group.label ? null : group.label)}
                aria-expanded={activeGroup === group.label}
                className="flex cursor-pointer list-none items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[rgb(var(--fg-muted))] transition hover:bg-[rgb(var(--bg-elev))] hover:text-[rgb(var(--fg))]"
              >
                {group.label}
                <ChevronDown className={`h-3.5 w-3.5 transition ${activeGroup === group.label ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {activeGroup === group.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="glass-strong absolute left-0 top-11 z-50 grid w-56 gap-1 rounded-lg p-2 shadow-xl"
                  >
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setActiveGroup(null)}
                        className="rounded-lg px-3 py-2 text-sm text-[rgb(var(--fg-muted))] transition hover:bg-[rgb(var(--primary))]/10 hover:text-[rgb(var(--fg))]"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          {directLinks.slice(1).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-[rgb(var(--fg-muted))] transition hover:bg-[rgb(var(--bg-elev))] hover:text-[rgb(var(--fg))]"
            >
              {l.label}
            </Link>
          ))}
          {navGroups.slice(3).map((group) => (
            <div key={group.label} data-nav-dropdown className="relative">
              <button
                type="button"
                onClick={() => setActiveGroup((current) => current === group.label ? null : group.label)}
                aria-expanded={activeGroup === group.label}
                className="flex cursor-pointer list-none items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[rgb(var(--fg-muted))] transition hover:bg-[rgb(var(--bg-elev))] hover:text-[rgb(var(--fg))]"
              >
                {group.label}
                <ChevronDown className={`h-3.5 w-3.5 transition ${activeGroup === group.label ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {activeGroup === group.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="glass-strong absolute left-0 top-11 z-50 grid w-56 gap-1 rounded-lg p-2 shadow-xl"
                  >
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setActiveGroup(null)}
                        className="rounded-lg px-3 py-2 text-sm text-[rgb(var(--fg-muted))] transition hover:bg-[rgb(var(--primary))]/10 hover:text-[rgb(var(--fg))]"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <form onSubmit={onSearch} className="flex min-w-[210px] items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-white/80 px-3 py-2 shadow-sm dark:bg-[rgb(var(--bg-elev))]/70 lg:min-w-[240px]">
              <Search className="h-4 w-4 text-[rgb(var(--fg-muted))]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
                onFocus={() => setSearchFocused(true)}
                onClick={() => setSearchFocused(true)}
                onBlur={() => window.setTimeout(() => setSearchFocused(false), 160)}
                placeholder="Search colleges, exams..."
                className="w-full bg-transparent text-xs outline-none placeholder:text-[rgb(var(--fg-muted))]"
              />
            </form>
            {searchFocused && searchMatches.length > 0 && (
              <div className="glass-strong absolute right-0 top-12 z-[70] grid w-[320px] gap-1 rounded-lg p-2 shadow-2xl">
                {searchMatches.map((item) => (
                  <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-[rgb(var(--primary))]/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.logo} alt={`${item.name} logo`} className="h-9 w-9 rounded-lg bg-white object-contain p-1 shadow-sm" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{item.name}</span>
                      <span className="block truncate text-xs text-[rgb(var(--fg-muted))]">{item.meta}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <ThemeToggle />
          {session?.user ? (
            <>
              <Link href={session.user.role === "ADMIN" || session.user.role === "EDITOR" ? "/admin" : "/community"} className="hidden btn-ghost max-w-[150px] truncate whitespace-nowrap px-4 py-2 md:inline-flex">
                <UserRound className="h-4 w-4 shrink-0" />
                <span className="truncate">{session.user.name || session.user.email}</span>
              </Link>
              <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="hidden btn-primary whitespace-nowrap px-4 py-2 md:inline-flex">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden btn-ghost whitespace-nowrap px-4 py-2 md:inline-flex">
                <UserRound className="h-4 w-4" />
                Sign In
              </Link>
              <Link href="/signup" className="hidden btn-primary whitespace-nowrap px-4 py-2 md:inline-flex">
                <ShieldCheck className="h-4 w-4" />
                Sign Up
              </Link>
            </>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Open menu"
            className="glass grid h-10 w-10 place-items-center rounded-lg xl:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden"
          >
            <div className="container glass-strong mx-4 mb-4 rounded-lg p-4 sm:mx-auto">
              <form onSubmit={onSearch} className="mb-3 flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-white/80 px-3 py-2 dark:bg-[rgb(var(--bg-elev))]/70">
                <Search className="h-4 w-4 text-[rgb(var(--fg-muted))]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
                  placeholder="Search colleges, exams..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[rgb(var(--fg-muted))]"
                />
              </form>
              {query.trim() && searchMatches.length > 0 && (
                <div className="mb-3 grid gap-1 rounded-lg border border-[rgb(var(--border))] bg-white/78 p-2 dark:bg-[rgb(var(--bg-elev))]/70">
                  {searchMatches.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-[rgb(var(--primary))]/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.logo} alt={`${item.name} logo`} className="h-9 w-9 rounded-lg bg-white object-contain p-1 shadow-sm" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold">{item.name}</span>
                        <span className="block truncate text-xs text-[rgb(var(--fg-muted))]">{item.meta}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              <div className="grid gap-1">
                {directLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[rgb(var(--bg-elev))]"
                  >
                    {l.label}
                  </Link>
                ))}
                {navGroups.map((group) => (
                  <details key={group.label} className="rounded-lg">
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-[rgb(var(--fg-muted))] hover:bg-[rgb(var(--bg-elev))] [&::-webkit-details-marker]:hidden">
                      {group.label}
                      <ChevronDown className="h-4 w-4" />
                    </summary>
                    <div className="grid gap-1 py-1 pl-3">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="rounded-lg px-3 py-2 text-sm text-[rgb(var(--fg-muted))] hover:bg-[rgb(var(--bg-elev))]"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </details>
                ))}
                {session?.user ? (
                  <div className="mt-2 grid gap-2">
                    <Link href={session.user.role === "ADMIN" || session.user.role === "EDITOR" ? "/admin" : "/community"} onClick={() => setOpen(false)} className="btn-ghost">
                      {session.user.name || session.user.email}
                    </Link>
                    <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="btn-primary">
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Link href="/login" onClick={() => setOpen(false)} className="btn-ghost">
                      Sign In
                    </Link>
                    <Link href="/signup" onClick={() => setOpen(false)} className="btn-primary">
                      Sign Up
                    </Link>
                  </div>
                )}
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-ghost mt-2">
                  Join WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
