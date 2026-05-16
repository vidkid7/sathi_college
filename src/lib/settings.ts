import "server-only";
import { db } from "./db";
import { cache } from "react";
import { DEFAULT_SETTINGS, type SiteSettings, type FooterColumn } from "./settings-defaults";
import { isSafeUrl } from "./security";

export { DEFAULT_SETTINGS };
export type { SiteSettings, FooterColumn };

const SETTINGS_KEY = "site";

function deepMerge<T>(target: T, source: Partial<T>): T {
  if (Array.isArray(target) || Array.isArray(source)) {
    return (source as any) ?? target;
  }
  if (typeof target === "object" && target !== null && typeof source === "object" && source !== null) {
    const out: any = { ...target };
    for (const k of Object.keys(source)) {
      const sv = (source as any)[k];
      const tv = (target as any)[k];
      out[k] = sv === undefined ? tv : deepMerge(tv, sv);
    }
    return out;
  }
  return (source as any) ?? target;
}

export const getSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const row = await db.setting.findUnique({ where: { key: SETTINGS_KEY } });
    if (!row?.value) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(row.value) as Partial<SiteSettings>;
    return deepMerge(DEFAULT_SETTINGS, parsed);
  } catch {
    return DEFAULT_SETTINGS;
  }
});

export async function saveSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSettings();
  const merged = sanitizeSettings(deepMerge(current, patch));
  await db.setting.upsert({
    where: { key: SETTINGS_KEY },
    update: { value: JSON.stringify(merged) },
    create: { key: SETTINGS_KEY, value: JSON.stringify(merged) }
  });
  return merged;
}

function sanitizeSettings(settings: SiteSettings): SiteSettings {
  const clean = { ...settings, social: { ...settings.social }, seo: { ...settings.seo } };
  clean.logoUrl = clean.logoUrl && isSafeUrl(clean.logoUrl, { allowRelative: true }) ? clean.logoUrl : DEFAULT_SETTINGS.logoUrl;
  clean.faviconUrl = clean.faviconUrl && isSafeUrl(clean.faviconUrl, { allowRelative: true }) ? clean.faviconUrl : DEFAULT_SETTINGS.faviconUrl;
  clean.seo.ogImage = isSafeUrl(clean.seo.ogImage, { allowRelative: true }) ? clean.seo.ogImage : DEFAULT_SETTINGS.seo.ogImage;
  for (const key of Object.keys(clean.social) as Array<keyof SiteSettings["social"]>) {
    const value = clean.social[key];
    if (value && !isSafeUrl(value)) delete clean.social[key];
  }
  return clean;
}

export function whatsappLinkFromSettings(s: SiteSettings, text = "Hi, I want to know more about sathicollege") {
  return `https://api.whatsapp.com/send/?phone=${s.whatsapp}&text=${encodeURIComponent(text)}`;
}

export function resolveCta(href: string, s: SiteSettings) {
  if (!href) return "/";
  if (href === "whatsapp") return whatsappLinkFromSettings(s);
  return href;
}
