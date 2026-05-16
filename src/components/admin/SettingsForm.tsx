"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Save, Plus, Trash2 } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";

type Section = "general" | "hero" | "about" | "footer" | "seo";

export function SettingsForm({ section }: { section: Section }) {
  const [data, setData] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((d) => setData(d.settings));
  }, []);

  async function save(patch: Partial<SiteSettings>) {
    setSaving(true);
    setStatus("idle");
    try {
      const r = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch)
      });
      const d = await r.json();
      if (!r.ok) throw new Error();
      setData(d.settings);
      setStatus("ok");
    } catch {
      setStatus("err");
    } finally {
      setSaving(false);
      setTimeout(() => setStatus("idle"), 2500);
    }
  }

  if (!data) return <div className="text-sm text-[rgb(var(--fg-muted))]">Loading...</div>;

  return (
    <div className="grid gap-6">
      {section === "general" && <GeneralForm data={data} onSave={save} saving={saving} />}
      {section === "hero" && <HeroForm data={data} onSave={save} saving={saving} />}
      {section === "about" && <AboutForm data={data} onSave={save} saving={saving} />}
      {section === "footer" && <FooterForm data={data} onSave={save} saving={saving} />}
      {section === "seo" && <SeoForm data={data} onSave={save} saving={saving} />}
      {status === "ok" && <p className="text-sm text-emerald-500">Saved.</p>}
      {status === "err" && <p className="text-sm text-red-500">Failed to save.</p>}
    </div>
  );
}

type FormProps = {
  data: SiteSettings;
  onSave: (patch: Partial<SiteSettings>) => Promise<void>;
  saving: boolean;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function GeneralForm({ data, onSave, saving }: FormProps) {
  const [s, setS] = useState(data);
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          siteName: s.siteName,
          shortName: s.shortName,
          tagline: s.tagline,
          description: s.description,
          logoUrl: s.logoUrl,
          faviconUrl: s.faviconUrl,
          email: s.email,
          phone: s.phone,
          whatsapp: s.whatsapp,
          address: s.address,
          social: s.social
        });
      }}
    >
      <GlassCard>
        <h3 className="mb-4 font-display text-lg font-bold">Brand</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Site name"><input className="input" value={s.siteName} onChange={(e) => setS({ ...s, siteName: e.target.value })} /></Field>
          <Field label="Short name"><input className="input" value={s.shortName} onChange={(e) => setS({ ...s, shortName: e.target.value })} /></Field>
          <Field label="Tagline"><input className="input" value={s.tagline} onChange={(e) => setS({ ...s, tagline: e.target.value })} /></Field>
          <Field label="Logo URL (optional)"><input className="input" value={s.logoUrl ?? ""} onChange={(e) => setS({ ...s, logoUrl: e.target.value || null })} placeholder="https://..." /></Field>
          <Field label="Favicon URL"><input className="input" value={s.faviconUrl ?? ""} onChange={(e) => setS({ ...s, faviconUrl: e.target.value || null })} /></Field>
        </div>
        <div className="mt-4">
          <Field label="Description"><textarea rows={3} className="input resize-none" value={s.description} onChange={(e) => setS({ ...s, description: e.target.value })} /></Field>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="mb-4 font-display text-lg font-bold">Contact</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email"><input className="input" value={s.email} onChange={(e) => setS({ ...s, email: e.target.value })} /></Field>
          <Field label="Phone"><input className="input" value={s.phone} onChange={(e) => setS({ ...s, phone: e.target.value })} /></Field>
          <Field label="WhatsApp number (digits only)"><input className="input" value={s.whatsapp} onChange={(e) => setS({ ...s, whatsapp: e.target.value })} placeholder="919281014900" /></Field>
          <Field label="Address"><input className="input" value={s.address} onChange={(e) => setS({ ...s, address: e.target.value })} /></Field>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="mb-4 font-display text-lg font-bold">Social links</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {(["facebook", "instagram", "youtube", "twitter", "linkedin", "telegram"] as const).map((k) => (
            <Field key={k} label={k.charAt(0).toUpperCase() + k.slice(1)}>
              <input
                className="input"
                value={s.social?.[k] ?? ""}
                onChange={(e) => setS({ ...s, social: { ...s.social, [k]: e.target.value || undefined } })}
                placeholder="https://..."
              />
            </Field>
          ))}
        </div>
      </GlassCard>

      <button disabled={saving} className="btn-primary w-fit"><Save className="h-4 w-4" /> {saving ? "Saving..." : "Save changes"}</button>
    </form>
  );
}

function HeroForm({ data, onSave, saving }: FormProps) {
  const [s, setS] = useState(data.hero);
  function setStat(i: number, key: "value" | "label", v: string) {
    const next = [...s.stats];
    next[i] = { ...next[i], [key]: v };
    setS({ ...s, stats: next });
  }
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ hero: s });
      }}
    >
      <GlassCard>
        <h3 className="mb-4 font-display text-lg font-bold">Hero</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Eyebrow"><input className="input" value={s.eyebrow} onChange={(e) => setS({ ...s, eyebrow: e.target.value })} /></Field>
          <Field label="Title — line 1"><input className="input" value={s.titleLine1} onChange={(e) => setS({ ...s, titleLine1: e.target.value })} /></Field>
          <Field label="Title — highlight (gradient)"><input className="input" value={s.titleHighlight} onChange={(e) => setS({ ...s, titleHighlight: e.target.value })} /></Field>
          <Field label="Title — line 2"><input className="input" value={s.titleLine2} onChange={(e) => setS({ ...s, titleLine2: e.target.value })} /></Field>
          <Field label="Primary CTA label"><input className="input" value={s.primaryCtaLabel} onChange={(e) => setS({ ...s, primaryCtaLabel: e.target.value })} /></Field>
          <Field label="Primary CTA href (use 'whatsapp' to open WhatsApp)"><input className="input" value={s.primaryCtaHref} onChange={(e) => setS({ ...s, primaryCtaHref: e.target.value })} /></Field>
          <Field label="Secondary CTA label"><input className="input" value={s.secondaryCtaLabel} onChange={(e) => setS({ ...s, secondaryCtaLabel: e.target.value })} /></Field>
          <Field label="Secondary CTA href"><input className="input" value={s.secondaryCtaHref} onChange={(e) => setS({ ...s, secondaryCtaHref: e.target.value })} /></Field>
        </div>
        <div className="mt-4">
          <Field label="Description"><textarea rows={3} className="input resize-none" value={s.description} onChange={(e) => setS({ ...s, description: e.target.value })} /></Field>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">Hero stats</h3>
          <button type="button" className="btn-ghost text-xs" onClick={() => setS({ ...s, stats: [...s.stats, { value: "", label: "" }] })}>
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
        <div className="grid gap-3">
          {s.stats.map((st, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
              <input className="input" value={st.value} placeholder="3,00,000+" onChange={(e) => setStat(i, "value", e.target.value)} />
              <input className="input" value={st.label} placeholder="Students" onChange={(e) => setStat(i, "label", e.target.value)} />
              <button type="button" className="btn-ghost text-red-500" onClick={() => setS({ ...s, stats: s.stats.filter((_, idx) => idx !== i) })}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

      <button disabled={saving} className="btn-primary w-fit"><Save className="h-4 w-4" /> {saving ? "Saving..." : "Save changes"}</button>
    </form>
  );
}

function AboutForm({ data, onSave, saving }: FormProps) {
  const [s, setS] = useState(data.about);
  return (
    <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); onSave({ about: s }); }}>
      <GlassCard>
        <h3 className="mb-4 font-display text-lg font-bold">About section</h3>
        <Field label="Title"><input className="input" value={s.title} onChange={(e) => setS({ ...s, title: e.target.value })} /></Field>
        <div className="mt-4">
          <Field label="Body"><textarea rows={8} className="input resize-none" value={s.body} onChange={(e) => setS({ ...s, body: e.target.value })} /></Field>
        </div>
      </GlassCard>
      <button disabled={saving} className="btn-primary w-fit"><Save className="h-4 w-4" /> {saving ? "Saving..." : "Save changes"}</button>
    </form>
  );
}

function FooterForm({ data, onSave, saving }: FormProps) {
  const [s, setS] = useState(data.footer);

  function updateColumn(ci: number, patch: Partial<SiteSettings["footer"]["columns"][number]>) {
    const next = [...s.columns];
    next[ci] = { ...next[ci], ...patch };
    setS({ ...s, columns: next });
  }
  function updateLink(ci: number, li: number, key: "label" | "href", v: string) {
    const next = [...s.columns];
    const links = [...next[ci].links];
    links[li] = { ...links[li], [key]: v };
    next[ci] = { ...next[ci], links };
    setS({ ...s, columns: next });
  }

  return (
    <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); onSave({ footer: s }); }}>
      <GlassCard>
        <h3 className="mb-4 font-display text-lg font-bold">Footer text</h3>
        <Field label="About text"><textarea rows={3} className="input resize-none" value={s.aboutText} onChange={(e) => setS({ ...s, aboutText: e.target.value })} /></Field>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Copyright"><input className="input" value={s.copyright} onChange={(e) => setS({ ...s, copyright: e.target.value })} /></Field>
          <Field label="Bottom note"><input className="input" value={s.bottomNote} onChange={(e) => setS({ ...s, bottomNote: e.target.value })} /></Field>
        </div>
      </GlassCard>

      {s.columns.map((col, ci) => (
        <GlassCard key={ci}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <input className="input max-w-xs font-semibold" value={col.title} onChange={(e) => updateColumn(ci, { title: e.target.value })} />
            <div className="flex gap-2">
              <button type="button" className="btn-ghost text-xs" onClick={() => updateColumn(ci, { links: [...col.links, { label: "New link", href: "/" }] })}>
                <Plus className="h-3 w-3" /> Add link
              </button>
              <button type="button" className="btn-ghost text-xs text-red-500" onClick={() => setS({ ...s, columns: s.columns.filter((_, i) => i !== ci) })}>
                <Trash2 className="h-3 w-3" /> Remove column
              </button>
            </div>
          </div>
          <div className="grid gap-3">
            {col.links.map((l, li) => (
              <div key={li} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
                <input className="input" value={l.label} placeholder="Label" onChange={(e) => updateLink(ci, li, "label", e.target.value)} />
                <input className="input" value={l.href} placeholder="/path or https://" onChange={(e) => updateLink(ci, li, "href", e.target.value)} />
                <button type="button" className="btn-ghost text-red-500" onClick={() => updateColumn(ci, { links: col.links.filter((_, i) => i !== li) })}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      ))}

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-ghost" onClick={() => setS({ ...s, columns: [...s.columns, { title: "New Column", links: [] }] })}>
          <Plus className="h-4 w-4" /> Add column
        </button>
        <button disabled={saving} className="btn-primary"><Save className="h-4 w-4" /> {saving ? "Saving..." : "Save changes"}</button>
      </div>
    </form>
  );
}

function SeoForm({ data, onSave, saving }: FormProps) {
  const [s, setS] = useState(data.seo);
  return (
    <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); onSave({ seo: s }); }}>
      <GlassCard>
        <h3 className="mb-4 font-display text-lg font-bold">SEO defaults</h3>
        <div className="grid gap-4">
          <Field label="Meta title"><input className="input" value={s.metaTitle} onChange={(e) => setS({ ...s, metaTitle: e.target.value })} /></Field>
          <Field label="Meta description"><textarea rows={3} className="input resize-none" value={s.metaDescription} onChange={(e) => setS({ ...s, metaDescription: e.target.value })} /></Field>
          <Field label="Keywords (comma-separated)"><input className="input" value={s.keywords.join(", ")} onChange={(e) => setS({ ...s, keywords: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} /></Field>
          <Field label="OG image URL"><input className="input" value={s.ogImage} onChange={(e) => setS({ ...s, ogImage: e.target.value })} /></Field>
        </div>
      </GlassCard>
      <button disabled={saving} className="btn-primary w-fit"><Save className="h-4 w-4" /> {saving ? "Saving..." : "Save changes"}</button>
    </form>
  );
}
