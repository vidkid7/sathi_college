"use client";

import Link from "next/link";

const tabs = [
  { href: "/admin/settings", label: "General" },
  { href: "/admin/settings/hero", label: "Hero" },
  { href: "/admin/settings/about", label: "About" },
  { href: "/admin/settings/footer", label: "Footer" },
  { href: "/admin/settings/seo", label: "SEO" }
];

export function SettingsTabs({ active }: { active: string }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`rounded-full border px-4 py-1.5 text-sm transition ${
            active === t.href
              ? "border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
              : "border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-elev))]"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
