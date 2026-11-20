import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { brandConfig } from "@/config/brand";
import type { CompatibilityReport, ScoredAssessmentResult } from "@/lib/assessment/types";

function sanitizeWinAnsi(input: string): string {
  return (input || "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u2265/g, ">=")
    .replace(/\u2264/g, "<=")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, " ");
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const safe = sanitizeWinAnsi(text);
  const words = safe.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = words[0];
  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

class PdfWriter {
  private doc: PDFDocument;
  private page!: PDFPage;
  private y = 740;
  private serif!: PDFFont;
  private sans!: PDFFont;
  private sansBold!: PDFFont;

  constructor(doc: PDFDocument) {
    this.doc = doc;
  }

  async init() {
    this.serif = await this.doc.embedFont(StandardFonts.TimesRomanBold);
    this.sans = await this.doc.embedFont(StandardFonts.Helvetica);
    this.sansBold = await this.doc.embedFont(StandardFonts.HelveticaBold);
    this.addPage();
  }

  addPage() {
    this.page = this.doc.addPage([612, 792]);
    this.y = 742;
    this.page.drawText(sanitizeWinAnsi(`${brandConfig.name} - Private Relationship & Self-Discovery`), {
      x: 52,
      y: 764,
      size: 8.5,
      font: this.sans,
      color: rgb(0.45, 0.38, 0.42),
    });
    this.page.drawLine({
      start: { x: 52, y: 756 },
      end: { x: 560, y: 756 },
      thickness: 0.6,
      color: rgb(0.86, 0.81, 0.77),
    });
  }

  ensureSpace(heightNeeded: number) {
    if (this.y - heightNeeded < 64) {
      this.addPage();
    }
  }

  drawHeading(text: string, size = 20) {
    const lines = wrapText(text, this.serif, size, 508);
    this.ensureSpace(lines.length * (size + 5) + 12);
    for (const line of lines) {
      this.page.drawText(line, {
        x: 52,
        y: this.y,
        size,
        font: this.serif,
        color: rgb(0.14, 0.1, 0.12),
      });
      this.y -= size + 5;
    }
    this.y -= 4;
  }

  drawSubheading(text: string) {
    this.ensureSpace(26);
    this.page.drawText(sanitizeWinAnsi(text), {
      x: 52,
      y: this.y,
      size: 12,
      font: this.sansBold,
      color: rgb(0.71, 0.11, 0.35),
    });
    this.y -= 18;
  }

  drawParagraph(text: string, size = 10, muted = false) {
    const lines = wrapText(text, this.sans, size, 508);
    this.ensureSpace(lines.length * (size + 4) + 6);
    const color = muted ? rgb(0.42, 0.36, 0.39) : rgb(0.18, 0.15, 0.17);
    for (const line of lines) {
      this.page.drawText(line, {
        x: 52,
        y: this.y,
        size,
        font: this.sans,
        color,
      });
      this.y -= size + 4;
    }
    this.y -= 6;
  }

  drawScoreRow(label: string, scoreText: string, pct: number | null) {
    this.ensureSpace(26);
    this.page.drawText(sanitizeWinAnsi(label), {
      x: 52,
      y: this.y,
      size: 10,
      font: this.sansBold,
      color: rgb(0.18, 0.15, 0.17),
    });
    this.page.drawText(sanitizeWinAnsi(scoreText), {
      x: 492,
      y: this.y,
      size: 10,
      font: this.sansBold,
      color: rgb(0.71, 0.11, 0.35),
    });
    this.y -= 9;
    this.page.drawRectangle({
      x: 52,
      y: this.y,
      width: 508,
      height: 5,
      color: rgb(0.92, 0.89, 0.86),
    });
    if (pct !== null && pct > 0) {
      this.page.drawRectangle({
        x: 52,
        y: this.y,
        width: Math.max(4, Math.min(508, (pct / 100) * 508)),
        height: 5,
        color: rgb(0.71, 0.11, 0.35),
      });
    }
    this.y -= 15;
  }

  drawFooterNote(text: string) {
    const pages = this.doc.getPages();
    const safe = sanitizeWinAnsi(text);
    pages.forEach((pg, idx) => {
      pg.drawLine({
        start: { x: 52, y: 46 },
        end: { x: 560, y: 46 },
        thickness: 0.5,
        color: rgb(0.86, 0.81, 0.77),
      });
      pg.drawText(`${safe}  |  Page ${idx + 1} of ${pages.length}`, {
        x: 52,
        y: 32,
        size: 8,
        font: this.sans,
        color: rgb(0.45, 0.39, 0.42),
      });
    });
  }
}

export async function generateResultPdf(
  result: ScoredAssessmentResult,
  options?: { includeQaSummary?: boolean }
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const writer = new PdfWriter(doc);
  await writer.init();

  writer.drawHeading(`${result.assessmentTitle} - Personal Report`, 22);
  writer.drawParagraph(
    `Result Archetype: ${result.profile.archetypeName} | Answered ${result.answeredCount}/${result.totalEligibleInMode} (${result.coveragePercent}%) | Completed ${result.createdAt.slice(0, 10)}`,
    9.5,
    true
  );
  writer.drawParagraph(result.profile.summaryParagraph, 10.5);

  if (result.whatYouAreInto) {
    writer.drawSubheading(result.whatYouAreInto.headline || "What You Are Into");
    if (result.whatYouAreInto.roleOrDynamicLean) {
      writer.drawParagraph(
        `Role & Dynamic Lean: ${result.whatYouAreInto.roleOrDynamicLean.label} - ${result.whatYouAreInto.roleOrDynamicLean.detail}`,
        9.5
      );
    }
    if (result.whatYouAreInto.coreTurnOns.length > 0) {
      writer.drawParagraph("Core Turn-Ons & Anchors:", 9.5);
      for (const item of result.whatYouAreInto.coreTurnOns.slice(0, 8)) {
        const dimNote =
          item.linkedDimensions.length > 0
            ? ` [${item.linkedDimensions.map((d) => d.label).join(", ")}]`
            : "";
        writer.drawParagraph(
          `- ${item.shortLabel}: ${item.answerLabel}${dimNote}`,
          9
        );
      }
    }
    if (result.whatYouAreInto.wantMoreOf.length > 0) {
      writer.drawParagraph("High Desire / Want More Of:", 9.5);
      for (const item of result.whatYouAreInto.wantMoreOf.slice(0, 5)) {
        writer.drawParagraph(
          `- ${item.shortLabel} (${item.detail || item.answerLabel})`,
          9
        );
      }
    }
    if (result.whatYouAreInto.curiousExplorations.length > 0) {
      writer.drawParagraph("Curious To Explore:", 9.5);
      for (const item of result.whatYouAreInto.curiousExplorations.slice(0, 5)) {
        writer.drawParagraph(`- ${item.shortLabel}`, 9);
      }
    }
  }

  writer.drawSubheading("Dimension Scores");
  for (const dim of result.radar) {
    writer.drawScoreRow(dim.label, `${dim.score} / 100`, dim.score);
  }

  if (result.dimensionInteractions && result.dimensionInteractions.length > 0) {
    writer.drawSubheading("How Your Scores Connect");
    for (const inter of result.dimensionInteractions) {
      writer.drawParagraph(`${inter.title}: ${inter.summary}`, 9.5);
    }
  }

  if (result.dualChannelScores && result.dualChannelScores.length > 0) {
    writer.drawSubheading("Receiving vs. Expressing Balance");
    for (const ch of result.dualChannelScores) {
      writer.drawScoreRow(
        `${ch.label} (Need ${ch.receiveOrNeedScore} vs Offer ${ch.expressOrOfferScore})`,
        `Gap ${ch.gap}`,
        ch.receiveOrNeedScore
      );
    }
  }

  if (result.priorityRanking && result.priorityRanking.length > 0) {
    writer.drawSubheading("Top Ranked Priorities & Non-Negotiables");
    for (const pr of result.priorityRanking.slice(0, 10)) {
      writer.drawParagraph(`#${pr.rank} ${pr.label} (${pr.tier.toUpperCase()} - ${pr.score}/100)`, 9.5);
    }
  }

  writer.drawSubheading("Key Personalized Insights");
  for (const ins of result.groundedInsights) {
    writer.drawParagraph(`- ${ins}`, 9.5);
  }

  if (result.unmetPreferences.length > 0) {
    writer.drawSubheading("High-Desire, Low-Frequency Opportunities");
    for (const u of result.unmetPreferences.slice(0, 6)) {
      writer.drawParagraph(`- ${u.message}`, 9.5);
    }
  }

  if (result.buckets.firmBoundaries.length > 0) {
    writer.drawSubheading("Explicit Firm Boundaries (Protected Private Anchor)");
    for (const b of result.buckets.firmBoundaries) {
      writer.drawParagraph(`- ${b.prompt}`, 9.5);
    }
  }

  if (options?.includeQaSummary && result.qaSummary && result.qaSummary.length > 0) {
    writer.addPage();
    writer.drawHeading("Question & Answer Record", 18);
    for (const row of result.qaSummary) {
      writer.drawParagraph(`[${row.sectionTitle}] ${row.prompt}`, 9.5);
      writer.drawParagraph(
        `Response: ${row.answerLabel}${row.firmBoundary ? " (Firm Boundary)" : ""}`,
        9,
        true
      );
    }
  }

  writer.drawFooterNote(`${result.profile.disclaimer}`);
  return await doc.save();
}

export async function generateCompatibilityPdf(report: CompatibilityReport): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const writer = new PdfWriter(doc);
  await writer.init();

  writer.drawHeading(`${report.assessmentTitle} - Couples Compatibility`, 22);
  writer.drawParagraph(
    `Overall Compatibility: ${report.overallScore}/100 (${report.label}) | Coverage ${report.coveragePercent}% | Generated ${report.createdAt.slice(0, 10)}`,
    10,
    true
  );
  writer.drawParagraph(report.disclaimer, 9.5, true);

  writer.drawSubheading("Dimension Alignment Breakdown");
  for (const dim of report.dimensionScores) {
    writer.drawScoreRow(
      dim.dimension,
      dim.score !== null ? `${dim.score} / 100` : "Private",
      dim.score
    );
  }

  writer.drawSubheading("Couple Insights");
  for (const ins of report.coupleInsights) {
    writer.drawParagraph(`- ${ins}`, 9.5);
  }

  if (report.conversationStarters.length > 0) {
    writer.drawSubheading("Recommended Conversation Starters");
    for (const cs of report.conversationStarters) {
      writer.drawParagraph(`- "${cs}"`, 9.5);
    }
  }

  if (report.whereYouAlign.length > 0) {
    writer.drawSubheading("Strongest Alignments");
    for (const a of report.whereYouAlign.slice(0, 12)) {
      writer.drawParagraph(`- ${a.promptSummary}: ${a.explanation}`, 9.5);
    }
  }

  if (report.boundaryConsiderations.length > 0) {
    writer.drawSubheading("Boundary Considerations (Zero-Leak Protected)");
    for (const b of report.boundaryConsiderations) {
      writer.drawParagraph(`- ${b.promptSummary}: ${b.explanation}`, 9.5);
    }
  }

  if (report.fantasyReveals) {
    writer.drawSubheading("Mutually Matched Fantasy Items (Zero-Exposure Protocol)");
    for (const m of report.fantasyReveals.mutuallySelected) {
      writer.drawParagraph(`- [${m.category}] ${m.label}`, 9.5);
    }
  }

  if (report.bucketListMatches) {
    writer.drawSubheading("Shared Couples Bucket List");
    for (const item of report.bucketListMatches.sharedItems) {
      writer.drawParagraph(
        `- [${item.completed ? "DONE" : "TODO"}] ${item.label} (${item.category})`,
        9.5
      );
    }
  }

  writer.drawFooterNote(`Generated deterministically by ${brandConfig.name} · Private couple report`);
  return await doc.save();
}

function escapeCsvCell(val: unknown): string {
  const s = String(val ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

export function generateResultCsv(result: ScoredAssessmentResult): string {
  const header = ["Section", "Dimension/Item", "Response/Score", "Importance", "Boundary"];
  const rows: string[][] = [];
  for (const d of result.radar) {
    rows.push(["Dimension Score", d.label, `${d.score}/100`, `${d.answeredCount} items`, ""]);
  }
  for (const qa of result.qaSummary || []) {
    rows.push([
      qa.sectionTitle,
      qa.prompt,
      qa.answerLabel,
      qa.importance,
      qa.firmBoundary ? "Yes" : "No",
    ]);
  }
  return [header.map(escapeCsvCell).join(","), ...rows.map((r) => r.map(escapeCsvCell).join(","))].join(
    "\r\n"
  );
}

export function generateCompatibilityCsv(report: CompatibilityReport): string {
  const header = ["Group", "Topic", "Note/Explanation", "Score"];
  const rows: string[][] = [];
  for (const d of report.dimensionScores) {
    rows.push(["Dimension", d.dimension, d.note, d.score !== null ? String(d.score) : "Private"]);
  }
  for (const a of report.whereYouAlign) {
    rows.push(["Aligned", a.promptSummary, a.explanation, "Match"]);
  }
  for (const c of report.whereYouComplement) {
    rows.push(["Complementary", c.promptSummary, c.explanation, "Complementary"]);
  }
  for (const d of report.whereYouDiffer) {
    rows.push(["Difference", d.promptSummary, d.explanation, "Discuss"]);
  }
  for (const b of report.boundaryConsiderations) {
    rows.push(["Boundary", b.promptSummary, b.explanation, "Protected"]);
  }
  return [header.map(escapeCsvCell).join(","), ...rows.map((r) => r.map(escapeCsvCell).join(","))].join(
    "\r\n"
  );
}
