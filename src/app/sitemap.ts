import type { MetadataRoute } from "next";
import { builtInAssessments } from "@/data/assessments/catalog";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://truth-desire.web.app";

const TOP_VIRAL_SLUGS = new Set([
  "bdsm-power-dynamics-test",
  "kink-curiosity-catalog",
  "relationship-readiness-core",
  "big-five-personality-profile",
  "emotional-availability-reflection",
  "communication-language-profile",
  "desire-reality-map",
  "intimacy-partner-preferences",
  "attachment-style-discovery",
  "relationship-dealbreakers-boundaries",
  "sexual-interests-curiosity-map",
  "erotic-blueprint-style",
]);

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/explore`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${BASE_URL}/couples`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/assessments`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE_URL}/community`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const assessmentPages: MetadataRoute.Sitemap = builtInAssessments.map((a) => ({
    url: `${BASE_URL}/assess/${a.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: TOP_VIRAL_SLUGS.has(a.slug) ? 0.9 : 0.8,
  }));

  return [...staticPages, ...assessmentPages];
}
