import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/server/admin-auth";
import {
  parseAssessmentDefinition,
  validateAssessmentAnswers,
} from "@/lib/assessment/definition";
import { answersMapSchema } from "@/lib/assessment/validation";
import { scoreAssessmentSubmission } from "@/lib/assessment/scoring";
import { checkRateLimit } from "@/lib/server/rate-limit";
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req)))
    return NextResponse.json(
      { error: "Administrator authentication required." },
      { status: 401 },
    );
  if (!checkRateLimit("studio-preview", 60).allowed)
    return NextResponse.json(
      { error: "Preview rate limit reached." },
      { status: 429 },
    );
  try {
    const body = await req.json(),
      assessment = parseAssessmentDefinition(body.assessment),
      answers = answersMapSchema.parse(body.answers);
    validateAssessmentAnswers(assessment, answers);
    const result = scoreAssessmentSubmission({
      assessment,
      answers,
      mode: body.mode === "quick" ? "quick" : "complete",
      perspective: "primary",
      createdAt: new Date().toISOString(),
      resultId: "unsaved-admin-preview",
    });
    return NextResponse.json(
      { result },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid preview." },
      { status: 400 },
    );
  }
}
