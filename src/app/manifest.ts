import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getSettings();
  const siteUrl = getSiteUrl();
  return {
    id: siteUrl,
    name: s.siteName,
    short_name: s.shortName,
    description: s.seo.metaDescription,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#070a14",
    theme_color: "#2563eb",
    categories: ["education", "productivity", "utilities"],
    icons: [
      { src: s.faviconUrl || "/favicon.svg", sizes: "any", type: "image/svg+xml" }
    ]
  };
}
