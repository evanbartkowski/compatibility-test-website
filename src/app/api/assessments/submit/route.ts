import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  consentSettingsSchema,
  questionAnswerSchema,
} from "@/lib/assessment/validation";
import { getReadOnlyVerifiedUid } from "@/lib/server/firebase-auth";
import { checkRateLimit } from "@/lib/server/rate-limit";
import {
  attachSessionCookie,
  getOrCreateSessionKey,
} from "@/lib/server/session";
import { saveAssessmentSubmission } from "@/lib/server/store";

const submissionSchema = z.object({
  assessmentSlug: z.string().min(1),
  assessmentVersion: z.string().max(40).optional(),
  mode: z.enum(["quick", "complete"]),
  perspective: z.enum(["primary", "partner"]).default("primary"),
  consent: consentSettingsSchema,
  answers: z.record(z.string(), questionAnswerSchema),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const rl = checkRateLimit(`submit:${ip}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many submission attempts. Please wait a moment." },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const parsed = submissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid submission payload or missing adult consent." },
        { status: 400 },
      );
    }

    const { sessionKey, isNew } = await getOrCreateSessionKey(
      req.headers.get("x-between-us-sid"),
    );
    const ownerUid = await getReadOnlyVerifiedUid(req);
    const saved = saveAssessmentSubmission({
      sessionKey,
      ...(ownerUid ? { ownerUid } : {}),
      ...parsed.data,
    });

    const res = NextResponse.json({
      submissionId: saved.submissionId,
      result: saved.result,
    });
    if (isNew) attachSessionCookie(res, sessionKey);
    return res;
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to save assessment.",
      },
      { status: 400 },
    );
  }
}
