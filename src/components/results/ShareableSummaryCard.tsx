"use client";

import React, { useState } from "react";
import { Download, Image as ImageIcon, ShieldCheck } from "lucide-react";
import { brandConfig } from "@/config/brand";
import type { ScoredAssessmentResult } from "@/lib/assessment/types";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSafeCardSvg(result: ScoredAssessmentResult): string {
  const topDims = result.radar.slice(0, 7);
  const height = Math.max(400, 230 + topDims.length * 34);
  const dims = topDims
    .map(
      (d, idx) =>
        `<text x="48" y="${210 + idx * 32}" font-family="system-ui, sans-serif" font-size="13.5" fill="#DFC2D1">${escapeXml(
          d.label.length > 26 ? `${d.label.slice(0, 24)}...` : d.label
        )}</text>
         <rect x="240" y="${198 + idx * 32}" width="270" height="10" rx="5" fill="#271C2B"/>
         <rect x="240" y="${198 + idx * 32}" width="${Math.round(
           (d.score / 100) * 270
         )}" height="10" rx="5" fill="#FF5C9E"/>
         <text x="526" y="${210 + idx * 32}" font-family="monospace" font-size="13" fill="#FDF2F7">${
           d.score
         }</text>`
    )
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="${height}" viewBox="0 0 600 ${height}">
    <rect width="600" height="${height}" rx="24" fill="#08060A"/>
    <rect x="16" y="16" width="568" height="${height - 32}" rx="18" fill="#110C13" stroke="#5E3B55"/>
    <text x="48" y="60" font-family="Georgia, serif" font-size="15" fill="#E5BC87">${escapeXml(
      brandConfig.name
    )} · ${escapeXml(result.assessmentTitle ?? result.assessmentSlug)}</text>
    <text x="48" y="108" font-family="Georgia, serif" font-size="30" fill="#FDF2F7">${escapeXml(
      result.profile.archetypeName
    )}</text>
    <text x="48" y="142" font-family="system-ui, sans-serif" font-size="12.5" fill="#DFC2D1">High-level summary card · Private answers &amp; boundaries omitted</text>
    <line x1="48" y1="168" x2="552" y2="168" stroke="#2F202D"/>
    ${dims}
    <text x="48" y="${height - 36}" font-family="system-ui, sans-serif" font-size="11" fill="#AE8E9E">Reflective summary (v${escapeXml(
      result.scoringEngineVersion
    )}) · Not a clinical diagnosis</text>
  </svg>`;
}

export function ShareableSummaryCard({ result }: { result: ScoredAssessmentResult }) {
  const [downloadedType, setDownloadedType] = useState<"svg" | "png" | null>(null);

  const safeSlug = result.profile.archetypeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const handleDownloadSvg = () => {
    const svg = buildSafeCardSvg(result);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `truth-desire-card-${safeSlug || "profile"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadedType("svg");
    setTimeout(() => setDownloadedType(null), 2500);
  };

  const handleDownloadPng = () => {
    const svg = buildSafeCardSvg(result);
    const img = new window.Image();
    const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = img.height * 2 || 960;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            const pngUrl = URL.createObjectURL(pngBlob);
            const a = document.createElement("a");
            a.href = pngUrl;
            a.download = `truth-desire-card-${safeSlug || "profile"}.png`;
            a.click();
            URL.revokeObjectURL(pngUrl);
          }
        }, "image/png");
      }
      URL.revokeObjectURL(url);
      setDownloadedType("png");
      setTimeout(() => setDownloadedType(null), 2500);
    };
    img.src = url;
  };

  return (
    <div
      className="flex flex-col justify-between gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center no-print"
      style={{
        backgroundColor: "var(--bg-subtle)",
        borderColor: "var(--border-hairline)",
      }}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--accent-sage)]">
          <ShieldCheck className="h-4 w-4" />
          Privacy-screened summary card
        </div>
        <p className="text-sm font-medium text-[var(--ink-primary)]">
          Shareable Summary Card ({result.profile.archetypeName})
        </p>
        <p className="text-xs text-[var(--ink-secondary)]">
          Exports only your archetype and high-level dimension bars. Specific acts, private answers,
          and boundaries stay hidden.
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          onClick={handleDownloadPng}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-elevated)]"
          style={{ borderColor: "var(--border-strong)" }}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          {downloadedType === "png" ? "PNG Saved" : "Save PNG"}
        </button>
        <button
          type="button"
          onClick={handleDownloadSvg}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-elevated)]"
          style={{ borderColor: "var(--border-hairline)" }}
        >
          <Download className="h-3.5 w-3.5" />
          {downloadedType === "svg" ? "SVG Saved" : "Download Safe Summary Card"}
        </button>
      </div>
    </div>
  );
}
