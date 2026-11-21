import { readJsonBody } from "@/lib/server/request-body";
import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/server/admin-auth";
import { scoreAssessmentSubmission } from "@/lib/assessment/scoring";
import { resolveAssessment } from "@/lib/server/store";
import type { QuestionAnswer } from "@/lib/assessment/types";
import { z } from "zod";

const simulateSchema = z.object({
  assessmentSlug: z.string().min(1),
  preset: z.enum(["balanced", "high_exploration", "boundary_focused", "reserved"]),
});

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Administrator access required." }, { status: 401 });
  }

  const json = await readJsonBody(req).catch(() => null);
  const parsed = simulateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid simulation request." }, { status: 400 });
  }

  const assessment = resolveAssessment(parsed.data.assessmentSlug);
  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
  }

  const now = new Date().toISOString();
  const answers: Record<string, QuestionAnswer> = {};
  const preset = parsed.data.preset;

  for (let i = 0; i < assessment.questions.length; i++) {
    const q = assessment.questions[i];
    const baseScore: 1 | 2 | 3 | 4 | 5 =
      preset === "high_exploration"
        ? 5
        : preset === "reserved"
          ? 2
          : preset === "boundary_focused"
            ? i % 3 === 0
              ? 1
              : 3
            : i % 2 === 0
              ? 4
              : 3;

    if (q.inputType === "curiosity_map") {
      answers[q.id] = {
        questionId: q.id,
        curiosityLevel:
          preset === "high_exploration"
            ? "very_interested"
            : preset === "boundary_focused"
              ? i % 2 === 0
                ? "firm_boundary"
                : "not_interested"
              : "curious_uncertain",
        revealRule:
          preset === "boundary_focused" ? "private_never_share" : "mutual_only",
        firmBoundary: preset === "boundary_focused" && i % 2 === 0,
        updatedAt: now,
      };
    } else if (
      (q.inputType === "multiple_choice" ||
        q.inputType === "forced_choice" ||
        q.inputType === "situational" ||
        q.inputType === "partner_prediction" ||
        q.inputType === "would_rather_vote") &&
      q.options &&
      q.options.length > 0
    ) {
      const idx =
        preset === "high_exploration"
          ? 0
          : preset === "reserved"
            ? q.options.length - 1
            : i % q.options.length;
      answers[q.id] = {
        questionId: q.id,
        customValue: q.options[idx].value,
        importance: preset === "boundary_focused" ? "essential" : "important",
        updatedAt: now,
      };
    } else if (q.inputType === "ranking" && q.options) {
      const vals = q.options.map((o) => o.value);
      answers[q.id] = {
        questionId: q.id,
        customValue: preset === "reserved" ? [...vals].reverse() : vals,
        updatedAt: now,
      };
    } else if (q.inputType === "multi_select" && q.options) {
      answers[q.id] = {
        questionId: q.id,
        customValue: q.options.slice(0, preset === "high_exploration" ? 4 : 2).map((o) => o.value),
        updatedAt: now,
      };
    } else if (q.inputType === "slider" && q.sliderConfig) {
      const { min, max } = q.sliderConfig;
      const ratio =
        preset === "high_exploration" ? 0.85 : preset === "reserved" ? 0.25 : 0.55;
      answers[q.id] = {
        questionId: q.id,
        customValue: Math.round(min + (max - min) * ratio),
        updatedAt: now,
      };
    } else {
      answers[q.id] = {
        questionId: q.id,
        enjoyment: baseScore,
        experienceFrequency: preset === "high_exploration" ? 4 : 2,
        importance: preset === "boundary_focused" ? "essential" : "important",
        firmBoundary: preset === "boundary_focused" && i % 4 === 0,
        updatedAt: now,
      };
    }
  }

  const simulatedResult = scoreAssessmentSubmission({
    resultId: "sim_preview",
    assessment,
    mode: "complete",
    perspective: "primary",
    answers,
  });

  return NextResponse.json({ simulatedResult });
}
