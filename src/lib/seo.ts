import type { Metadata } from "next";
import { getSettings } from "./settings";
import type { SiteSettings } from "./settings-defaults";

const FALLBACK_SITE_URL = "https://sathicollege.com";
const DEFAULT_OG_IMAGE = "/assets/generated/hero-campus-generated.png";
const BRAND_LOGO_PATH = "/assets/brand/sathi-logo-glass-160.png";

export const BRAND_DISPLAY_NAME = "SathiCollege";
export const BRAND_READABLE_NAME = "Sathi College";
export const BRAND_LEGAL_NAME = BRAND_READABLE_NAME;

const BRAND_ALIASES = [
  BRAND_DISPLAY_NAME,
  BRAND_READABLE_NAME,
  "sathicollege",
  "sathi college",
  "Sathi Collage",
  "sathicollage"
];

type MetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string | null;
  type?: "website" | "article";
  keywords?: string[];
  noIndex?: boolean;
  publishedTime?: Date | string | null;
  modifiedTime?: Date | string | null;
};

type BreadcrumbItem = {
  name: string;
  path: string;
};

type JsonLdRecord = Record<string, unknown>;

function trimDescription(description: string) {
  const normalized = description.replace(/\s+/g, " ").trim();
  return normalized.length > 165 ? `${normalized.slice(0, 162).trim()}...` : normalized;
}

function uniqueText(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[]));
}

export function brandMetaDescription(description?: string | null) {
  const fallback = `${BRAND_DISPLAY_NAME} (${BRAND_READABLE_NAME}) official website for global program search, university comparison, scholarships, tuition, intakes and admission planning.`;
  const clean = trimDescription(description || fallback);
  return /SathiCollege/i.test(clean) && /Sathi\s+College/i.test(clean) ? clean : fallback;
}

function normalizeBaseUrl(value?: string | null) {
  const raw = value || process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || FALLBACK_SITE_URL;
  try {
    const url = new URL(raw);
    url.pathname = "";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return FALLBACK_SITE_URL;
  }
}

function normalizePath(path = "/") {
  if (!path || path === "/") return "/";
  if (/^https?:\/\//i.test(path)) return new URL(path).pathname || "/";
  return `/${path.replace(/^\/+/, "")}`.replace(/\/{2,}/g, "/");
}

export function getSiteUrl() {
  return normalizeBaseUrl();
}

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${getSiteUrl()}${normalizePath(path)}`;
}

export function canonicalUrl(path = "/") {
  return absoluteUrl(normalizePath(path));
}

function imageUrl(path?: string | null) {
  const normalized = path?.trim();
  const safePath = !normalized || /(^|\/)og\.png(\?|$)/.test(normalized) ? DEFAULT_OG_IMAGE : normalized;
  return absoluteUrl(safePath);
}

export function resolveSeoImageUrl(path?: string | null) {
  return imageUrl(path);
}

function searchableKeywords(input?: string[]) {
  return Array.from(new Set([...(input || []), ...BRAND_ALIASES, ...siteConfig.keywords])).slice(0, 40);
}

function verification(): Metadata["verification"] | undefined {
  const google = process.env.GOOGLE_SITE_VERIFICATION || process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  return google ? { google } : undefined;
}

export function brandPageTitle(title?: string | null) {
  const clean = title?.replace(/\s+/g, " ").trim().replace(/\bsathicollege\b/gi, BRAND_DISPLAY_NAME);
  const globalTitle = `${BRAND_DISPLAY_NAME} Official Website | Course Finder`;
  if (!clean) return globalTitle;
  if (/engineering rank predictor|college predictor\s*&\s*admissions|engineering admissions/i.test(clean)) return globalTitle;
  if (/sathi\s*college/i.test(clean) && /program search|universit|scholarship|study abroad/i.test(clean)) return clean;
  if (/sathi\s*college/i.test(clean)) return `${clean} | Global Program Search, Universities & Scholarships`;
  return `${BRAND_DISPLAY_NAME} (${BRAND_READABLE_NAME}) | ${clean}`;
}

export function brandTitleTemplate() {
  return `%s | ${BRAND_DISPLAY_NAME}`;
}

export function brandAliases() {
  return BRAND_ALIASES;
}

function robots(noIndex?: boolean): Metadata["robots"] {
  if (noIndex) {
    return { index: false, follow: false, nocache: true };
  }
  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  };
}

export async function buildPageMetadata(input?: MetadataInput): Promise<Metadata> {
  const s = await getSettings();
  const base = getSiteUrl();
  const path = normalizePath(input?.path);
  const url = canonicalUrl(path);
  const title = input?.title || s.seo.metaTitle;
  const description = trimDescription(input?.description || s.seo.metaDescription);
  const ogImage = imageUrl(input?.image || s.seo.ogImage);
  return {
    metadataBase: new URL(base),
    title,
    description,
    keywords: searchableKeywords(input?.keywords || s.seo.keywords),
    applicationName: BRAND_DISPLAY_NAME,
    authors: [{ name: BRAND_DISPLAY_NAME, url: base }],
    creator: BRAND_DISPLAY_NAME,
    publisher: BRAND_DISPLAY_NAME,
    category: "education",
    alternates: { canonical: url, languages: { en: url } },
    robots: robots(input?.noIndex),
    verification: verification(),
    openGraph: {
      title,
      description,
      url,
      siteName: BRAND_DISPLAY_NAME,
      locale: "en_US",
      type: input?.type || "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${BRAND_DISPLAY_NAME} preview` }],
      ...(input?.publishedTime ? { publishedTime: new Date(input.publishedTime).toISOString() } : {}),
      ...(input?.modifiedTime ? { modifiedTime: new Date(input.modifiedTime).toISOString() } : {})
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
    other: {
      "format-detection": "telephone=no",
      classification: "Education",
      subject: "Global university search, program search, scholarships, admissions and counselling"
    }
  };
}

// Backwards-compatible sync helper for places where settings cannot be awaited.
export const siteConfig = {
  url: getSiteUrl(),
  name: BRAND_DISPLAY_NAME,
  ogImage: DEFAULT_OG_IMAGE,
  keywords: [
    "SathiCollege",
    "Sathi College",
    "sathicollege",
    "sathi college",
    "sathicollage",
    "global program search",
    "study abroad program finder",
    "university search",
    "USA universities",
    "UK universities",
    "Australia universities",
    "Canada universities",
    "scholarship search",
    "course finder",
    "international admissions"
  ]
};

export function buildMetadata(input?: MetadataInput): Metadata {
  const base = getSiteUrl();
  const path = normalizePath(input?.path);
  const url = canonicalUrl(path);
  const title = input?.title || `${siteConfig.name} Global Program Search`;
  const description = trimDescription(
    input?.description ||
      "Search global universities, programs, scholarships, tuition, intakes and eligibility requirements across the USA, UK, Australia and Canada."
  );
  const ogImage = imageUrl(input?.image || siteConfig.ogImage);
  return {
    metadataBase: new URL(base),
    title,
    description,
    keywords: searchableKeywords(input?.keywords),
    applicationName: BRAND_DISPLAY_NAME,
    authors: [{ name: BRAND_DISPLAY_NAME, url: base }],
    creator: BRAND_DISPLAY_NAME,
    publisher: BRAND_DISPLAY_NAME,
    category: "education",
    alternates: { canonical: url, languages: { en: url } },
    robots: robots(input?.noIndex),
    verification: verification(),
    openGraph: {
      title,
      description,
      url,
      type: input?.type || "website",
      siteName: siteConfig.name,
      locale: "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${siteConfig.name} preview` }],
      ...(input?.publishedTime ? { publishedTime: new Date(input.publishedTime).toISOString() } : {}),
      ...(input?.modifiedTime ? { modifiedTime: new Date(input.modifiedTime).toISOString() } : {})
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
    other: {
      "format-detection": "telephone=no",
      classification: "Education",
      subject: "Global university search, program search, scholarships, admissions and counselling"
    }
  };
}

export function jsonLd(data: JsonLdRecord | JsonLdRecord[]) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationJsonLd(settings: SiteSettings): JsonLdRecord {
  const sameAs = Object.values(settings.social).filter(Boolean);
  const logo = imageUrl(settings.logoUrl || BRAND_LOGO_PATH);
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${getSiteUrl()}/#organization`,
    name: BRAND_DISPLAY_NAME,
    legalName: BRAND_LEGAL_NAME,
    alternateName: uniqueText([settings.shortName, settings.siteName, ...BRAND_ALIASES]),
    url: getSiteUrl(),
    inLanguage: "en-IN",
    logo: {
      "@type": "ImageObject",
      url: logo,
      width: 512,
      height: 512
    },
    image: logo,
    description: brandMetaDescription(settings.description || settings.seo.metaDescription),
    email: settings.email,
    telephone: settings.phone,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "admissions guidance",
      email: settings.email,
      telephone: settings.phone,
      availableLanguage: ["English", "Hindi"]
    },
    areaServed: ["India", "Nepal", "United States", "United Kingdom", "Canada", "Australia"],
    knowsAbout: [
      "college admissions",
      "program search",
      "rank prediction",
      "college prediction",
      "entrance exams",
      "scholarships",
      "study abroad counselling"
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
      addressLocality: settings.address
    },
    sameAs
  };
}

export function websiteJsonLd(settings: SiteSettings): JsonLdRecord {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${getSiteUrl()}/#website`,
    name: BRAND_DISPLAY_NAME,
    alternateName: uniqueText([BRAND_READABLE_NAME, settings.siteName, settings.shortName, ...BRAND_ALIASES]),
    url: getSiteUrl(),
    inLanguage: "en-IN",
    description: brandMetaDescription(settings.seo.metaDescription),
    publisher: { "@id": `${getSiteUrl()}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${getSiteUrl()}/search-program?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

export function webPageJsonLd(input: { path: string; name: string; description: string; type?: string }): JsonLdRecord {
  const url = canonicalUrl(input.path);
  return {
    "@context": "https://schema.org",
    "@type": input.type || "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: input.name,
    description: trimDescription(input.description),
    inLanguage: "en-IN",
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    publisher: { "@id": `${getSiteUrl()}/#organization` }
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]): JsonLdRecord {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path)
    }))
  };
}

export function itemListJsonLd(input: { path: string; name: string; items: Array<{ name: string; path: string; description?: string | null }> }): JsonLdRecord {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.name,
    url: canonicalUrl(input.path),
    itemListElement: input.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: canonicalUrl(item.path),
      name: item.name,
      ...(item.description ? { description: trimDescription(item.description) } : {})
    }))
  };
}

export function courseJsonLd(input: {
  path: string;
  name: string;
  description: string;
  providerName?: string | null;
  providerPath?: string | null;
  image?: string | null;
  courseCode?: string | number | null;
  courseMode?: string | null;
  educationalLevel?: string | null;
  durationMonths?: number | null;
  tuitionAmount?: string | number | null;
  currency?: string | null;
}) {
  const url = canonicalUrl(input.path);
  const providerUrl = input.providerPath ? canonicalUrl(input.providerPath) : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${url}#course`,
    name: input.name,
    description: trimDescription(input.description),
    url,
    image: imageUrl(input.image),
    courseCode: input.courseCode ? String(input.courseCode) : undefined,
    courseMode: input.courseMode || undefined,
    educationalLevel: input.educationalLevel || undefined,
    provider: input.providerName
      ? {
          "@type": "CollegeOrUniversity",
          name: input.providerName,
          ...(providerUrl ? { url: providerUrl } : {})
        }
      : { "@id": `${getSiteUrl()}/#organization` },
    ...(input.durationMonths
      ? {
          timeRequired: `P${input.durationMonths}M`,
          hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: input.courseMode || "Onsite",
            courseWorkload: `P${input.durationMonths}M`
          }
        }
      : {}),
    ...(input.tuitionAmount
      ? {
          offers: {
            "@type": "Offer",
            price: String(input.tuitionAmount),
            priceCurrency: input.currency || "USD",
            availability: "https://schema.org/InStock",
            url
          }
        }
      : {})
  };
}

export function occupationJsonLd(input: {
  path: string;
  name: string;
  description: string;
  category?: string | null;
  image?: string | null;
}) {
  const url = canonicalUrl(input.path);
  return {
    "@context": "https://schema.org",
    "@type": "Occupation",
    "@id": `${url}#occupation`,
    name: input.name,
    description: trimDescription(input.description),
    mainEntityOfPage: url,
    occupationalCategory: input.category || undefined,
    image: imageUrl(input.image)
  };
}

export function dataCatalogJsonLd(input: {
  path: string;
  name: string;
  description: string;
  keywords?: string[];
}) {
  const url = canonicalUrl(input.path);
  return {
    "@context": "https://schema.org",
    "@type": "DataCatalog",
    "@id": `${url}#data-catalog`,
    name: input.name,
    description: trimDescription(input.description),
    url,
    keywords: input.keywords?.join(", "),
    publisher: { "@id": `${getSiteUrl()}/#organization` },
    inLanguage: "en"
  };
}

export function articleJsonLd(input: { path: string; title: string; description: string; datePublished?: Date | string | null; dateModified?: Date | string | null; image?: string | null; authorName?: string | null }): JsonLdRecord {
  const url = canonicalUrl(input.path);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: input.title,
    description: trimDescription(input.description),
    url,
    image: imageUrl(input.image),
    datePublished: new Date(input.datePublished || Date.now()).toISOString(),
    dateModified: new Date(input.dateModified || input.datePublished || Date.now()).toISOString(),
    author: { "@type": "Organization", name: input.authorName || siteConfig.name },
    publisher: { "@id": `${getSiteUrl()}/#organization` },
    mainEntityOfPage: { "@id": `${url}#webpage` }
  };
}

export function educationalOrganizationJsonLd(input: { path: string; name: string; description: string; image?: string | null; city?: string | null; state?: string | null; rating?: number | null }): JsonLdRecord {
  const url = canonicalUrl(input.path);
  return {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    "@id": `${url}#college`,
    name: input.name,
    url,
    description: trimDescription(input.description),
    image: imageUrl(input.image),
    address: {
      "@type": "PostalAddress",
      addressLocality: input.city || undefined,
      addressRegion: input.state || undefined,
      addressCountry: "IN"
    },
    ...(input.rating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: input.rating, bestRating: 5, ratingCount: 1 } } : {})
  };
}

export function softwareApplicationJsonLd(input: { path: string; name: string; description: string; applicationCategory?: string }): JsonLdRecord {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: input.name,
    url: canonicalUrl(input.path),
    description: trimDescription(input.description),
    applicationCategory: input.applicationCategory || "EducationApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    publisher: { "@id": `${getSiteUrl()}/#organization` }
  };
}
