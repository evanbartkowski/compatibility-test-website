"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Download, LockKeyhole, Image as ImageIcon } from "lucide-react";
import type { ScoredAssessmentResult } from "@/lib/assessment/types";
import {
  projectResultForSharing,
  buildShareCardSvg,
  type ResultShareSelection,
} from "@/lib/assessment/sharing";
function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
export function ShareableSummaryCard({
  result,
}: {
  result: ScoredAssessmentResult;
}) {
  const [selection, setSelection] = useState<ResultShareSelection>({
    dimensionKeys: [],
    includeArchetype: false,
    includeAssessmentTitle: false,
    allowSensitive: false,
  });
  const [error, setError] = useState(""),
    [saving, setSaving] = useState(false),
    [status, setStatus] = useState("");
  const preview = useMemo(() => {
    try {
      return buildShareCardSvg(projectResultForSharing(result, selection));
    } catch {
      return null;
    }
  }, [result, selection]);
  const sensitive =
    result.adultsOnly || result.assessmentCategory === "sexuality-intimacy";
  const exportCard = async (format: "svg" | "png") => {
    setError("");
    setStatus("");
    setSaving(true);
    try {
      const svg = buildShareCardSvg(projectResultForSharing(result, selection));
      if (format === "svg")
        download(
          new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
          "truth-desire-selected-profile.svg",
        );
      else {
        const image = new window.Image(),
          url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
        try {
          await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () =>
              reject(
                new Error(
                  "The image could not be rendered. Try the SVG download.",
                ),
              );
            image.src = url;
          });
          const canvas = document.createElement("canvas");
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          const context = canvas.getContext("2d");
          if (!context)
            throw new Error(
              "Image export is unavailable in this browser. Download the SVG instead.",
            );
          context.drawImage(image, 0, 0);
          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/png"),
          );
          if (!blob)
            throw new Error("PNG export failed. Download the SVG instead.");
          download(blob, "truth-desire-selected-profile.png");
        } finally {
          URL.revokeObjectURL(url);
        }
      }
      setStatus(
        `${format.toUpperCase()} download started. Only your selected fields are included.`,
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to create the result card.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <section className="share-card-editor no-print">
      <div>
        <span className="intro-pill">
          <LockKeyhole size={13} />
          Selected by you
        </span>
        <h3 className="font-display text-2xl mt-4">Make your result card.</h3>
        <p className="text-sm leading-relaxed text-[var(--ink-muted)] mt-3">
          Choose exactly what appears in the image. Private answers are never
          included.
        </p>
        <div className="share-selection-fields !border-0 !px-0">
          <label>
            <input
              type="checkbox"
              checked={selection.includeArchetype}
              onChange={(e) =>
                setSelection((s) => ({
                  ...s,
                  includeArchetype: e.target.checked,
                }))
              }
            />
            Include archetype & description
          </label>
          <label>
            <input
              type="checkbox"
              checked={selection.includeAssessmentTitle}
              onChange={(e) =>
                setSelection((s) => ({
                  ...s,
                  includeAssessmentTitle: e.target.checked,
                }))
              }
            />
            Include test title
          </label>
          {result.radar
            .filter((d) => d.answeredCount > 0)
            .map((d) => (
              <label key={d.dimension}>
                <input
                  type="checkbox"
                  checked={selection.dimensionKeys.includes(d.dimension)}
                  onChange={(e) =>
                    setSelection((s) => ({
                      ...s,
                      dimensionKeys: e.target.checked
                        ? [...s.dimensionKeys, d.dimension]
                        : s.dimensionKeys.filter((key) => key !== d.dimension),
                    }))
                  }
                />
                {d.label}
                <span>{d.score}%</span>
              </label>
            ))}
          {sensitive && (
            <label className="sensitive-ack">
              <input
                type="checkbox"
                checked={selection.allowSensitive}
                onChange={(e) =>
                  setSelection((s) => ({
                    ...s,
                    allowSensitive: e.target.checked,
                  }))
                }
              />
              I choose to include the selected sensitive result fields in this
              image.
            </label>
          )}
        </div>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-3 mt-5">
          <button
            className="button button-primary"
            onClick={() => exportCard("png")}
            disabled={saving}
          >
            <ImageIcon size={15} />
            Download PNG
          </button>
          <button
            className="button button-secondary"
            onClick={() => exportCard("svg")}
            disabled={saving}
          >
            <Download size={15} />
            Download SVG
          </button>
        </div>
        {status && (
          <p role="status" className="text-sm text-[var(--accent-sage)] mt-4">
            {status}
          </p>
        )}
      </div>
      <div className="result-card-preview">
        {preview ? (
          <Image
            unoptimized
            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(preview)}`}
            width="1200"
            height={Math.max(
              630,
              410 + Math.ceil(selection.dimensionKeys.length / 2) * 68,
            )}
            alt="Preview of the result fields selected for sharing"
          />
        ) : (
          <div className="empty-state">
            <LockKeyhole className="mx-auto mb-4" />
            <p>Select the fields you’d like to include to preview your card.</p>
          </div>
        )}
      </div>
    </section>
  );
}
