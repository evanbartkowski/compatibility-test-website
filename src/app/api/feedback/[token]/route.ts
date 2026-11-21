import { readJsonBody } from "@/lib/server/request-body";
import { NextRequest, NextResponse } from "next/server";
import {
  getPublicMultiRaterInviteByToken,
  resolveAssessment,
  submitMultiRaterResponse,
} from "@/lib/server/store";
import { answersMapSchema } from "@/lib/assessment/validation";
import { z } from "zod";

const multiRaterBodySchema = z.object({
  relationshipType: z.enum(["partner", "close_friend", "friend", "colleague"]),
  answers: answersMapSchema,
});

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const pub = getPublicMultiRaterInviteByToken(token);
  if (!pub.invite) {
    return NextResponse.json({ error: pub.error || "Invalid link." }, { status: 404 });
  }

  const assessment = resolveAssessment(pub.invite.assessmentSlug);
  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
  }

  return NextResponse.json({
    invite: pub.invite,
    questions: assessment.questions.map((q) => ({
      id: q.id,
      order: q.order,
      sectionTitle: q.sectionTitle,
      prompt: q.observerPrompt || q.partnerPrompt || q.prompt,
      helperText: q.helperText,
      scaleConfig: q.scaleConfig,
    })),
  });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const json = await readJsonBody(req).catch(() => null);
  const parsed = multiRaterBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid feedback payload.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const outcome = submitMultiRaterResponse({
    token,
    relationshipType: parsed.data.relationshipType,
    answers: parsed.data.answers,
  });

  if (!outcome.ok) {
    return NextResponse.json({ error: outcome.error || "Unable to submit." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    respondentCount: outcome.respondentCount,
    minRespondents: outcome.minRespondents,
  });
}
