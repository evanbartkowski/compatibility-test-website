import { NextRequest, NextResponse } from "next/server";
import { getReadOnlySessionKey } from "@/lib/server/session";
import { getReadOnlyVerifiedUid } from "@/lib/server/firebase-auth";
import {
  getUserPrivacyPreferences,
  listInvitationsForSession,
  listSubmissionsForSession,
  listSharedProfiles,
} from "@/lib/server/store";
export async function GET(req: NextRequest) {
  const sessionKey = await getReadOnlySessionKey(
      req.headers.get("x-between-us-sid"),
    ),
    uid = await getReadOnlyVerifiedUid(req);
  if (!sessionKey && !uid)
    return NextResponse.json(
      { error: "No private session is available." },
      { status: 401 },
    );
  return NextResponse.json(
    {
      exportedAt: new Date().toISOString(),
      preferences: getUserPrivacyPreferences(sessionKey, uid),
      submissions: listSubmissionsForSession(sessionKey, uid).map((s) => ({
        submissionId: s.submissionId,
        assessmentSlug: s.assessmentSlug,
        assessmentVersion: s.assessmentVersion,
        mode: s.mode,
        perspective: s.perspective,
        consent: s.consent,
        answers: s.answers,
        result: s.result,
        createdAt: s.createdAt,
      })),
      invitations: listInvitationsForSession(sessionKey, uid).map((i) => ({
        inviteId: i.inviteId,
        assessmentSlug: i.assessmentSlug,
        assessmentVersion: i.assessmentVersion,
        status: i.status,
        createdAt: i.createdAt,
        expiresAt: i.expiresAt,
      })),
      sharedProfiles: listSharedProfiles(sessionKey, uid),
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition":
          'attachment; filename="truth-desire-private-export.json"',
      },
    },
  );
}
