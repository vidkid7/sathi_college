import type { Metadata } from "next";
import { getSettings } from "./settings";

export async function buildPageMetadata(input?: { title?: string; description?: string }): Promise<Metadata> {
  const s = await getSettings();
  const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const title = input?.title ? `${input.title} • ${s.siteName}` : s.seo.metaTitle;
  const description = input?.description || s.seo.metaDescription;
  return {
    metadataBase: new URL(url),
    title,
    description,
    keywords: s.seo.keywords,
    openGraph: {
      title, description, url, siteName: s.siteName, type: "website",
      images: [{ url: s.seo.ogImage, width: 1200, height: 630 }]
    },
    twitter: { card: "summary_large_image", title, description, images: [s.seo.ogImage] }
  };
}

// Backwards-compatible sync helper for places where settings cannot be awaited.
export const siteConfig = {
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  name: "sathicollege",
  ogImage: "/og.png"
};

export function buildMetadata(input?: { title?: string; description?: string }): Metadata {
  const url = siteConfig.url;
  const title = input?.title ? `${input.title} • ${siteConfig.name}` : `${siteConfig.name} • Engineering Aspirants Community`;
  const description = input?.description || "India's leading community for engineering aspirants.";
  return {
    metadataBase: new URL(url),
    title,
    description,
    openGraph: { title, description, url, type: "website" }
  };
}
