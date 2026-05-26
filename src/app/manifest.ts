import { MetadataRoute } from "next";
import { BRAND_DISPLAY_NAME, BRAND_READABLE_NAME, brandMetaDescription, getSiteUrl } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getSettings();
  const siteUrl = getSiteUrl();
  return {
    id: `${siteUrl}/`,
    name: `${BRAND_DISPLAY_NAME} (${BRAND_READABLE_NAME})`,
    short_name: BRAND_DISPLAY_NAME,
    description: brandMetaDescription(s.seo.metaDescription),
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#070a14",
    theme_color: "#2563eb",
    categories: ["education", "productivity", "utilities"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  };
}
