import { NextRequest, NextResponse } from "next/server";
import { getReadOnlyVerifiedUid } from "@/lib/server/firebase-auth";
import { attachSessionCookie, getOrCreateSessionKey } from "@/lib/server/session";
import {
  deleteAllSessionData,
  listInvitationsForSession,
  listSubmissionsForSession,
} from "@/lib/server/store";

export async function GET(req: NextRequest) {
  const { sessionKey, isNew } = await getOrCreateSessionKey(req.headers.get("x-between-us-sid"));
  const uid = await getReadOnlyVerifiedUid(req);
  const submissions = listSubmissionsForSession(sessionKey, uid).map((s) => ({
    submissionId: s.submissionId,
    assessmentSlug: s.assessmentSlug,
    assessmentVersion: s.assessmentVersion,
    mode: s.mode,
    perspective: s.perspective,
    optInCommunityStats: s.consent.optInCommunityStats,
    createdAt: s.createdAt,
    result: s.result,
  }));
  const invitations = listInvitationsForSession(sessionKey, uid);

  const res = NextResponse.json({ submissions, invitations });
  if (isNew) attachSessionCookie(res, sessionKey);
  return res;
}

export async function DELETE(req: NextRequest) {
  const { sessionKey } = await getOrCreateSessionKey(req.headers.get("x-between-us-sid"));
  const uid = await getReadOnlyVerifiedUid(req);
  const deleted = deleteAllSessionData(sessionKey, uid);
  return NextResponse.json({ deleted: true, ...deleted });
}
