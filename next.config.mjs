/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async headers() {
    const iconCacheHeaders = [
      {
        key: "Cache-Control",
        value: "public, max-age=86400, stale-while-revalidate=604800"
      }
    ];

    return [
      { source: "/favicon.ico", headers: iconCacheHeaders },
      { source: "/favicon.svg", headers: iconCacheHeaders },
      { source: "/icon-192.png", headers: iconCacheHeaders },
      { source: "/icon-512.png", headers: iconCacheHeaders },
      { source: "/apple-touch-icon.png", headers: iconCacheHeaders },
      { source: "/assets/brand/sathi-logo.png", headers: iconCacheHeaders }
    ];
  },
  images: {
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
