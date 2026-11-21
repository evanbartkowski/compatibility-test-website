import { describe, expect, it } from "vitest";
import { getArchivedAssessmentBySlug as getAssessmentBySlug } from "@/data/assessments/catalog";
import { computeCoupleCompatibility } from "@/lib/assessment/compatibility";
import { scoreAssessmentSubmission } from "@/lib/assessment/scoring";
import type {
  QuestionAnswer,
  SharingPreferences,
} from "@/lib/assessment/types";
import {
  generateCompatibilityCsv,
  generateCompatibilityPdf,
  generateResultCsv,
  generateResultPdf,
} from "@/lib/exports/pdf-generator";
import {
  isEmailProviderConfigured,
  sendTransactionalEmail,
} from "@/lib/server/email";

const fullShare: SharingPreferences = {
  shareCategoryScores: true,
  shareAlignedHighlights: true,
  shareComplementaryHighlights: true,
  shareSharedCuriosities: true,
  shareHighLevelBoundariesWithoutDetails: true,
  neverExposeRawPrivateAnswers: true,
};

function makeAnswersFor(slug: string): Record<string, QuestionAnswer> {
  const assessment = getAssessmentBySlug(slug)!;
  const now = new Date().toISOString();
  const out: Record<string, QuestionAnswer> = {};
  for (const q of assessment.questions) {
    if (q.inputType === "curiosity_map") {
      out[q.id] = {
        questionId: q.id,
        curiosityLevel: "very_interested",
        revealRule: "mutual_only",
        updatedAt: now,
      };
    } else if (
      (q.inputType === "multiple_choice" ||
        q.inputType === "forced_choice" ||
        q.inputType === "situational" ||
        q.inputType === "partner_prediction" ||
        q.inputType === "would_rather_vote") &&
      q.options?.length
    ) {
      out[q.id] = {
        questionId: q.id,
        customValue: q.options[0].value,
        importance: "important",
        updatedAt: now,
      };
    } else if (q.inputType === "ranking" && q.options?.length) {
      out[q.id] = {
        questionId: q.id,
        customValue: q.options.map((o) => o.value),
        updatedAt: now,
      };
    } else if (q.inputType === "slider" && q.sliderConfig) {
      out[q.id] = {
        questionId: q.id,
        customValue: q.sliderConfig.max,
        updatedAt: now,
      };
    } else {
      out[q.id] = {
        questionId: q.id,
        enjoyment: 5,
        experienceFrequency: 2,
        importance: "important",
        updatedAt: now,
      };
    }
  }
  return out;
}

describe("PDF & CSV Exporters, Transactional Email Guardrails, and Profile Aggregator", () => {
  it("generates valid binary multi-page PDF and CSV exports for personal and compatibility reports", async () => {
    const attachmentDef = getAssessmentBySlug("attachment-style-discovery")!;
    const attResult = scoreAssessmentSubmission({
      resultId: "res_att_pdf",
      assessment: attachmentDef,
      mode: "complete",
      perspective: "primary",
      answers: makeAnswersFor("attachment-style-discovery"),
    });

    const pdfBytes = await generateResultPdf(attResult);
    const header = Buffer.from(pdfBytes.slice(0, 5)).toString("ascii");
    expect(header).toBe("%PDF-");
    expect(pdfBytes.length).toBeGreaterThan(1500);

    const intimacyDefForPdf = getAssessmentBySlug(
      "intimacy-partner-preferences",
    )!;
    const intResult = scoreAssessmentSubmission({
      resultId: "res_int_pdf",
      assessment: intimacyDefForPdf,
      mode: "complete",
      perspective: "primary",
      answers: makeAnswersFor("intimacy-partner-preferences"),
    });
    const intPdfBytes = await generateResultPdf(intResult);
    expect(Buffer.from(intPdfBytes.slice(0, 5)).toString("ascii")).toBe(
      "%PDF-",
    );
    expect(intPdfBytes.length).toBeGreaterThan(2000);

    const csv = generateResultCsv(attResult);
    expect(csv).toContain(
      '"Section","Dimension/Item","Response/Score","Importance","Boundary"',
    );
    expect(csv).toContain(attResult.qaSummary![0].prompt.slice(0, 20));

    for (const slug of [
      "private-fantasy-matcher",
      "couples-bucket-list-matcher",
      "how-well-do-you-know-your-partner",
    ]) {
      const def = getAssessmentBySlug(slug)!;
      const ans = makeAnswersFor(slug);
      const comp = computeCoupleCompatibility({
        compatibilityId: `cmp_${slug}`,
        inviteId: `inv_${slug}`,
        assessment: def,
        mode: "complete",
        primaryAnswers: ans,
        partnerAnswers: ans,
        creatorSharing: fullShare,
        partnerSharing: fullShare,
      });
      const compPdf = await generateCompatibilityPdf(comp);
      expect(Buffer.from(compPdf.slice(0, 5)).toString("ascii")).toBe("%PDF-");
      expect(compPdf.length).toBeGreaterThan(1500);

      const compCsv = generateCompatibilityCsv(comp);
      expect(compCsv).toContain('"Group","Topic","Note/Explanation","Score"');
    }
  });

  it("reports email delivery cleanly as not configured when Resend/SMTP env vars are missing", async () => {
    if (!isEmailProviderConfigured().configured) {
      const outcome = await sendTransactionalEmail({
        to: "verify@example.com",
        subject: "Test",
        text: "Test message",
        html: "<p>Test message</p>",
      });
      expect(outcome.ok).toBe(false);
      expect(outcome.notConfigured).toBe(true);
      expect(outcome.provider).toBe("none");
    }
  });
});
