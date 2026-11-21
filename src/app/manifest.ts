import type { MetadataRoute } from "next";
import { brandConfig } from "@/config/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${brandConfig.name} - Viral Tests: BDSM, Kink, IQ, Love & Compatibility`,
    short_name: brandConfig.name,
    description: brandConfig.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#0c0c12",
    theme_color: "#ff5722",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
