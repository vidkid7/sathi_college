import { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api",
          "/login",
          "/signup",
          "/*?callbackUrl=",
          "/*?error="
        ]
      }
    ],
    sitemap: canonicalUrl("/sitemap.xml"),
    host: canonicalUrl("/")
  };
}
