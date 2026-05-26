import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Providers from "./providers";
import { getSettings } from "@/lib/settings";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  BRAND_DISPLAY_NAME,
  BRAND_READABLE_NAME,
  brandAliases,
  brandMetaDescription,
  brandPageTitle,
  brandTitleTemplate,
  getSiteUrl,
  organizationJsonLd,
  resolveSeoImageUrl,
  websiteJsonLd
} from "@/lib/seo";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const url = getSiteUrl();
  const homeUrl = `${url}/`;
  const ogImage = resolveSeoImageUrl(s.seo.ogImage);
  const title = brandPageTitle(s.seo.metaTitle);
  const description = brandMetaDescription(s.seo.metaDescription);
  const keywords = Array.from(new Set([...s.seo.keywords, ...brandAliases(), BRAND_DISPLAY_NAME, BRAND_READABLE_NAME]));
  return {
    metadataBase: new URL(url),
    title: { default: title, template: brandTitleTemplate() },
    description,
    keywords,
    applicationName: BRAND_DISPLAY_NAME,
    authors: [{ name: BRAND_DISPLAY_NAME, url: homeUrl }],
    creator: BRAND_DISPLAY_NAME,
    publisher: BRAND_DISPLAY_NAME,
    openGraph: {
      title,
      description,
      url: homeUrl,
      siteName: BRAND_DISPLAY_NAME,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${BRAND_DISPLAY_NAME} preview` }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage]
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1
      }
    },
    alternates: { canonical: homeUrl },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined
    },
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
      ],
      shortcut: "/favicon.ico",
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
    },
    appleWebApp: {
      capable: true,
      title: BRAND_DISPLAY_NAME,
      statusBarStyle: "default"
    },
    other: {
      "apple-mobile-web-app-title": BRAND_DISPLAY_NAME
    }
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#070a14" }
  ]
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${display.variable}`}>
      <head>
        <link rel="search" type="application/opensearchdescription+xml" title="SathiCollege Search" href="/opensearch.xml" />
        <link rel="alternate" type="application/rss+xml" title="SathiCollege Blog" href="/feed.xml" />
      </head>
      <body className="min-h-screen antialiased">
        <JsonLd data={[organizationJsonLd(settings), websiteJsonLd(settings)]} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
