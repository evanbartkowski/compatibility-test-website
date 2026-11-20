import type { MetadataRoute } from "next";
import { builtInAssessments } from "@/data/assessments/catalog";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://truthdesire.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/explore`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/assessments`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/couples`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE_URL}/community`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
  ];

  const assessmentPages: MetadataRoute.Sitemap = builtInAssessments.map((a) => ({
    url: `${BASE_URL}/assess/${a.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: a.isFeatured ? 0.9 : 0.75,
  }));

  return [...staticPages, ...assessmentPages];
}
