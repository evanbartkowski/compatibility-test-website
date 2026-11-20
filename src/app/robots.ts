import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://truthdesire.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/explore", "/assessments", "/assess/", "/couples", "/community"],
        disallow: [
          "/api/",
          "/results",
          "/compatibility",
          "/invite",
          "/feedback",
          "/profile",
          "/settings",
          "/dashboard",
          "/admin",
          "/studio",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
