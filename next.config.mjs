/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }
    ];
    const iconCacheHeaders = [
      {
        key: "Cache-Control",
        value: "public, max-age=86400, stale-while-revalidate=604800"
      }
    ];

    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/favicon.ico", headers: iconCacheHeaders },
      { source: "/favicon.svg", headers: iconCacheHeaders },
      { source: "/icon-192.png", headers: iconCacheHeaders },
      { source: "/icon-512.png", headers: iconCacheHeaders },
      { source: "/apple-touch-icon.png", headers: iconCacheHeaders },
      { source: "/assets/brand/sathi-logo.png", headers: iconCacheHeaders },
      { source: "/assets/brand/sathi-logo-160.webp", headers: iconCacheHeaders },
      { source: "/assets/brand/sathi-logo-glass-160.webp", headers: iconCacheHeaders }
    ];
  },
  images: {
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: "https", hostname: "sathicollege.in" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" }
    ]
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"]
  }
};

export default nextConfig;
