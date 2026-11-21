import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      ...["api", "profile", "settings", "shared", "studio", "admin"].map(
        (path) => ({
          source: `/${path}/:path*`,
          headers: [
            { key: "Cache-Control", value: "private, no-store" },
            { key: "X-Robots-Tag", value: "noindex, nofollow" },
          ],
        }),
      ),
      {
        source: "/results/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/compatibility/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/invite/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
