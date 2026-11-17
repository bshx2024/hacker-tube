import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=86400, stale-while-revalidate=86400, stale-if-error=604800",
          },
        ],
      },
      {
        source: "/v/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=604800, stale-while-revalidate=86400, stale-if-error=2592000",
          },
        ],
      },
      {
        source: "/topic/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=604800, stale-while-revalidate=86400, stale-if-error=2592000",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
