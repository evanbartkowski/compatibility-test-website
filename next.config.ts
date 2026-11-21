import type { NextConfig } from "next";
import securityHeaders from "./security-headers.json";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: "/assess/private-fantasy-matcher", destination: "/assess/sexual-interests-curiosity-map", permanent: true },
      { source: "/assess/couples-communication-conflict-matching", destination: "/assess/conflict-communication-personality", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: Object.entries(securityHeaders).map(([key, value]) => ({ key, value: process.env.NODE_ENV === "development" && key === "Content-Security-Policy" ? value.replace("script-src 'self'", "script-src 'self' 'unsafe-eval'").replace("connect-src 'self'", "connect-src 'self' ws://localhost:* ws://127.0.0.1:*") : value })),
      },
      ...["api", "profile", "settings", "shared", "studio", "admin", "results", "compatibility", "invite", "feedback", "dashboard"].map(
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
