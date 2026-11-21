import { readJsonBody } from "@/lib/server/request-body";
import { NextRequest, NextResponse } from "next/server";
import { getReadOnlyVerifiedUid } from "@/lib/server/firebase-auth";
import { attachSessionCookie, getOrCreateSessionKey, getReadOnlySessionKey } from "@/lib/server/session";
import {
  canAccessResult,
  createMultiRaterInvite,
  getMultiRaterSummaryForSubmission,
} from "@/lib/server/store";

export async function GET(req: NextRequest) {
  const submissionId = req.nextUrl.searchParams.get("submissionId");
  if (!submissionId) {
    return NextResponse.json({ error: "submissionId required." }, { status: 400 });
  }
  const sessionKey = await getReadOnlySessionKey(req.headers.get("x-between-us-sid"));
  const uid = await getReadOnlyVerifiedUid(req);
  if (!canAccessResult({ resultId: submissionId, sessionKey, uid })) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 404 });
  }
  const summary = getMultiRaterSummaryForSubmission({ submissionId, sessionKey, uid });
  return NextResponse.json({ summary });
}

export async function POST(req: NextRequest) {
  const { sessionKey, isNew } = await getOrCreateSessionKey(req.headers.get("x-between-us-sid"));
  const uid = await getReadOnlyVerifiedUid(req);
  const body = await readJsonBody(req).catch((): Record<string, unknown> => ({}));
  const submissionId = typeof body.submissionId === "string" ? body.submissionId : "";
  const displayName = typeof body.displayName === "string" ? body.displayName : "Someone close to you";

  if (!submissionId) {
    return NextResponse.json({ error: "submissionId is required." }, { status: 400 });
  }

  const created = createMultiRaterInvite({
    submissionId,
    sessionKey,
    uid,
    displayName,
  });

  if (!created) {
    return NextResponse.json({ error: "Result not found or unauthorized." }, { status: 404 });
  }

  const origin = req.nextUrl.origin;
  const res = NextResponse.json({
    ...created,
    inviteUrl: `${origin}/feedback/${created.token}`,
  });
  if (isNew) attachSessionCookie(res, sessionKey);
  return res;
}
