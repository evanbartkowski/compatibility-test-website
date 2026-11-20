import { describe, expect, it } from "vitest";
import { builtInAssessments, getAssessmentBySlug } from "@/data/assessments/catalog";
import { computeCoupleCompatibility } from "@/lib/assessment/compatibility";
import {
  DISCOVERY_DOMAIN_DEFINITIONS,
  aggregateDiscoveryProfile,
} from "@/lib/assessment/profile-aggregator";
import { scoreAssessmentSubmission } from "@/lib/assessment/scoring";
import type { QuestionAnswer, SharingPreferences } from "@/lib/assessment/types";
import {
  generateCompatibilityCsv,
  generateCompatibilityPdf,
  generateResultCsv,
  generateResultPdf,
} from "@/lib/exports/pdf-generator";
import { isEmailProviderConfigured, sendTransactionalEmail } from "@/lib/server/email";

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
  it("verifies every targetSlug referenced by Discovery Domains exists in catalog", () => {
    for (const dom of DISCOVERY_DOMAIN_DEFINITIONS) {
      for (const s of dom.targetSlugs) {
        expect(getAssessmentBySlug(s), `Missing slug ${s} in domain ${dom.domainKey}`).toBeDefined();
      }
    }
  });

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

    const intimacyDefForPdf = getAssessmentBySlug("intimacy-partner-preferences")!;
    const intResult = scoreAssessmentSubmission({
      resultId: "res_int_pdf",
      assessment: intimacyDefForPdf,
      mode: "complete",
      perspective: "primary",
      answers: makeAnswersFor("intimacy-partner-preferences"),
    });
    const intPdfBytes = await generateResultPdf(intResult);
    expect(Buffer.from(intPdfBytes.slice(0, 5)).toString("ascii")).toBe("%PDF-");
    expect(intPdfBytes.length).toBeGreaterThan(2000);

    const csv = generateResultCsv(attResult);
    expect(csv).toContain('"Section","Dimension/Item","Response/Score","Importance","Boundary"');
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
    if (!isEmailProviderConfigured()) {
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

  it("enforces zero fabricated insights in Discovery Profile below 2 assessments and synthesizes traceable insights above 2", () => {
    const intimacyDef = getAssessmentBySlug("intimacy-partner-preferences")!;
    const attachmentDef = getAssessmentBySlug("attachment-style-discovery")!;

    const sub1 = scoreAssessmentSubmission({
      resultId: "sub_1",
      assessment: intimacyDef,
      mode: "complete",
      perspective: "primary",
      answers: makeAnswersFor("intimacy-partner-preferences"),
    });
    const singleProfile = aggregateDiscoveryProfile([
      {
        submissionId: "sub_1",
        assessmentSlug: intimacyDef.slug,
        createdAt: sub1.createdAt,
        result: sub1,
      },
    ]);

    expect(singleProfile.totalAssessmentsInPlatform).toBe(builtInAssessments.length);
    expect(singleProfile.completedUniqueCount).toBe(1);
    expect(singleProfile.crossTestInsights).toEqual([]);
    expect(
      singleProfile.domains.find((d) => d.domainKey === "temperament")?.averageScore
    ).toBeNull();

    const sub2 = scoreAssessmentSubmission({
      resultId: "sub_2",
      assessment: attachmentDef,
      mode: "complete",
      perspective: "primary",
      answers: makeAnswersFor("attachment-style-discovery"),
    });
    const multiProfile = aggregateDiscoveryProfile([
      {
        submissionId: "sub_1",
        assessmentSlug: intimacyDef.slug,
        createdAt: sub1.createdAt,
        result: sub1,
      },
      {
        submissionId: "sub_2",
        assessmentSlug: attachmentDef.slug,
        createdAt: sub2.createdAt,
        result: sub2,
      },
    ]);

    expect(multiProfile.completedUniqueCount).toBe(2);
    expect(multiProfile.crossTestInsights.length).toBeGreaterThan(0);
    expect(multiProfile.crossTestInsights[0].sources).toContain("Attachment Style Discovery");
    expect(multiProfile.whatYouAreIntoDigest).toBeDefined();
    expect(multiProfile.whatYouAreIntoDigest!.topTurnOns.length).toBeGreaterThan(0);
  });
});
