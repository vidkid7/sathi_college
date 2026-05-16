import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Providers from "./providers";
import { getSettings } from "@/lib/settings";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    metadataBase: new URL(url),
    title: { default: s.seo.metaTitle, template: `%s • ${s.siteName}` },
    description: s.seo.metaDescription,
    keywords: s.seo.keywords,
    openGraph: {
      title: s.seo.metaTitle,
      description: s.seo.metaDescription,
      url,
      siteName: s.siteName,
      type: "website",
      images: [{ url: s.seo.ogImage, width: 1200, height: 630 }]
    },
    twitter: {
      card: "summary_large_image",
      title: s.seo.metaTitle,
      description: s.seo.metaDescription,
      images: [s.seo.ogImage]
    },
    robots: { index: true, follow: true },
    alternates: { canonical: url },
    icons: { icon: s.faviconUrl || "/favicon.svg" }
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${display.variable}`}>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
