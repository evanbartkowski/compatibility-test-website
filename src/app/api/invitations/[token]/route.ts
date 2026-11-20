import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  consentSettingsSchema,
  questionAnswerSchema,
  sharingPreferencesSchema,
} from "@/lib/assessment/validation";
import { getReadOnlyVerifiedUid } from "@/lib/server/firebase-auth";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { attachSessionCookie, getOrCreateSessionKey } from "@/lib/server/session";
import {
  getPublicInvitationByToken,
  resolveAssessment,
  submitPartnerInvitationResponse,
} from "@/lib/server/store";

const partnerSubmitSchema = z.object({
  consent: consentSettingsSchema,
  partnerSharing: sharingPreferencesSchema,
  answers: z.record(z.string(), questionAnswerSchema),
});

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const rl = checkRateLimit(`invite-lookup:${ip}`, 40, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const { token } = await context.params;
  const { invitation, error } = getPublicInvitationByToken(token);
  if (!invitation) {
    return NextResponse.json({ error: error || "Invalid invitation." }, { status: 404 });
  }

  const assessment = resolveAssessment(invitation.assessmentSlug);
  return NextResponse.json({
    invitation,
    assessment,
  });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const rl = checkRateLimit(`invite-submit:${ip}`, 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const { token } = await context.params;
  try {
    const body = await req.json();
    const parsed = partnerSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid partner submission or missing consent." },
        { status: 400 }
      );
    }

    const { sessionKey, isNew } = await getOrCreateSessionKey(req.headers.get("x-between-us-sid"));
    const partnerUid = await getReadOnlyVerifiedUid(req);
    const outcome = submitPartnerInvitationResponse({
      token,
      partnerSessionKey: sessionKey,
      ...(partnerUid ? { partnerUid } : {}),
      ...parsed.data,
    });

    const res = NextResponse.json({
      compatibilityId: outcome.compatibility.compatibilityId,
      compatibility: outcome.compatibility,
      partnerResultId: outcome.partnerResult.resultId,
    });
    if (isNew) attachSessionCookie(res, sessionKey);
    return res;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to submit partner responses." },
      { status: 400 }
    );
  }
}
