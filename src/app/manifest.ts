import { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getSettings();
  return {
    name: s.siteName,
    short_name: s.shortName,
    description: s.seo.metaDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#070a14",
    theme_color: "#2563eb",
    icons: [
      { src: s.faviconUrl || "/favicon.svg", sizes: "any", type: "image/svg+xml" }
    ]
  };
}
