import type { ScoredAssessmentResult } from "./types";
export interface ResultShareSelection {
  dimensionKeys: string[];
  includeArchetype: boolean;
  includeAssessmentTitle: boolean;
  allowSensitive: boolean;
}
export interface SharedResultSummary {
  assessmentTitle?: string;
  archetype?: { name: string; tagline: string };
  dimensions: Array<{ key: string; label: string; score: number }>;
  assessmentVersion: string;
  scoringEngineVersion: string;
}
export interface SharedProfileView {
  displayName: string;
  createdAt: string;
  expiresAt: string;
  results: SharedResultSummary[];
}
export function projectResultForSharing(
  result: ScoredAssessmentResult,
  selection: ResultShareSelection,
): SharedResultSummary {
  if (
    !selection.dimensionKeys.length &&
    !selection.includeArchetype &&
    !selection.includeAssessmentTitle
  )
    throw new Error("Select the result fields you want to share.");
  if (
    (result.assessmentCategory === "sexuality-intimacy" || result.adultsOnly) &&
    !selection.allowSensitive
  )
    throw new Error(
      "Confirm that you want to include selected sensitive result information.",
    );
  const keys = [...new Set(selection.dimensionKeys)];
  const measured = result.radar.filter((d) => d.answeredCount > 0);
  if (keys.some((key) => !measured.some((d) => d.dimension === key)))
    throw new Error("Only measured dimensions can be shared.");
  return {
    ...(selection.includeAssessmentTitle
      ? { assessmentTitle: result.assessmentTitle }
      : {}),
    ...(selection.includeArchetype && measured.length
      ? {
          archetype: {
            name: result.profile.archetypeName,
            tagline: result.profile.archetypeTagline,
          },
        }
      : {}),
    dimensions: measured
      .filter((d) => keys.includes(d.dimension))
      .map((d) => ({ key: d.dimension, label: d.label, score: d.score })),
    assessmentVersion: result.assessmentVersion,
    scoringEngineVersion: result.scoringEngineVersion,
  };
}

function escapeXml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[char]!,
  );
}
function lines(value: string, max: number) {
  const words = value.split(/\s+/),
    rows: string[] = [];
  let row = "";
  for (const word of words) {
    if (row.length + word.length > max && row) {
      rows.push(row);
      row = "";
    }
    row += (row ? " " : "") + word;
  }
  if (row) rows.push(row);
  return rows;
}
export function buildShareCardSvg(
  summary: SharedResultSummary,
  brand = "Truth Desire",
): string {
  const title = summary.archetype?.name || "Your chosen patterns";
  const subtitle =
    summary.archetype?.tagline ||
    "Shared by choice. A small window into a bigger picture.";
  const titleRows = lines(title, 38).slice(0, 2),
    subtitleRows = lines(subtitle, 85).slice(0, 2);
  const rows = Math.ceil(summary.dimensions.length / 2),
    height = Math.max(630, 350 + rows * 68 + 60);
  const bars = summary.dimensions
    .map((dimension, index) => {
      const x = index % 2 ? 650 : 72,
        y = 345 + Math.floor(index / 2) * 68;
      return `<text x="${x}" y="${y}" fill="#d8d4e8" font-size="17">${escapeXml(dimension.label.slice(0, 38))}</text><text x="${x + 465}" y="${y}" fill="#c3a7ff" font-size="18" text-anchor="end">${Math.round(dimension.score)}%</text><rect x="${x}" y="${y + 13}" width="465" height="7" rx="4" fill="#252333"/><rect x="${x}" y="${y + 13}" width="${(465 * Math.max(0, Math.min(100, dimension.score))) / 100}" height="7" rx="4" fill="${index % 2 ? "#67e8f9" : "#ac8aff"}"/>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}" role="img"><title>${escapeXml(title)}</title><defs><radialGradient id="halo"><stop stop-color="#a781ff" stop-opacity=".15"/><stop offset="1" stop-color="#a781ff" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="${height}" rx="28" fill="#070709"/><rect x="22" y="22" width="1156" height="${height - 44}" rx="20" fill="#111019" stroke="#3b324e"/><circle cx="1010" cy="155" r="210" fill="url(#halo)"/><g fill="none" stroke="#ac8aff" stroke-width="1.5" opacity=".6"><ellipse cx="1010" cy="155" rx="112" ry="38" transform="rotate(20 1010 155)"/><ellipse cx="1010" cy="155" rx="112" ry="38" transform="rotate(80 1010 155)"/><ellipse cx="1010" cy="155" rx="112" ry="38" transform="rotate(140 1010 155)"/><circle cx="1010" cy="155" r="45" stroke="#67e8f9" opacity=".7"/></g><g font-family="system-ui,sans-serif"><text x="72" y="76" fill="#c3a7ff" font-size="20">${escapeXml(brand)}</text>${summary.assessmentTitle ? `<text x="72" y="111" fill="#918da6" font-size="15">${escapeXml(summary.assessmentTitle.slice(0, 75))}</text>` : ""}${titleRows.map((row, i) => `<text x="72" y="${175 + i * 52}" fill="#f3f1fa" font-size="43" letter-spacing="-1.5">${escapeXml(row)}</text>`).join("")}${subtitleRows.map((row, i) => `<text x="72" y="${250 + i * 27}" fill="#b4b1c5" font-size="18">${escapeXml(row)}</text>`).join("")}<line x1="72" y1="302" x2="1128" y2="302" stroke="#292633"/>${bars}<text x="72" y="${height - 55}" fill="#918da6" font-size="13">Selected self-report patterns · Assessment v${escapeXml(summary.assessmentVersion)} · Exploratory, not diagnostic</text></g></svg>`;
}
