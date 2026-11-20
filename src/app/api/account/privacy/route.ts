import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getReadOnlyVerifiedUid } from "@/lib/server/firebase-auth";
import { attachSessionCookie, getOrCreateSessionKey } from "@/lib/server/session";
import {
  deleteAllSessionData,
  getUserPrivacyPreferences,
  listInvitationsForSession,
  listSubmissionsForSession,
  upsertUserPrivacyPreferences,
} from "@/lib/server/store";

const patchPrefsSchema = z.object({
  displayName: z.string().max(40).optional(),
  defaultCommunityOptIn: z.boolean().optional(),
  notifyNewTests: z.boolean().optional(),
  notifyPartnerReports: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const { sessionKey, isNew } = await getOrCreateSessionKey(req.headers.get("x-between-us-sid"));
  const uid = await getReadOnlyVerifiedUid(req);
  const prefs = getUserPrivacyPreferences(sessionKey, uid);
  const submissions = listSubmissionsForSession(sessionKey, uid);
  const invitations = listInvitationsForSession(sessionKey, uid);

  const res = NextResponse.json({
    prefs,
    submissionCount: submissions.length,
    invitationCount: invitations.length,
  });
  if (isNew) attachSessionCookie(res, sessionKey);
  return res;
}

export async function PATCH(req: NextRequest) {
  const { sessionKey, isNew } = await getOrCreateSessionKey(req.headers.get("x-between-us-sid"));
  const uid = await getReadOnlyVerifiedUid(req);
  const json = await req.json().catch(() => null);
  const parsed = patchPrefsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid preferences payload." }, { status: 400 });
  }

  const prefs = upsertUserPrivacyPreferences({
    sessionKey,
    ...(uid ? { uid } : {}),
    ...parsed.data,
  });
  const res = NextResponse.json({ prefs });
  if (isNew) attachSessionCookie(res, sessionKey);
  return res;
}

export async function DELETE(req: NextRequest) {
  const { sessionKey } = await getOrCreateSessionKey(req.headers.get("x-between-us-sid"));
  const uid = await getReadOnlyVerifiedUid(req);
  const deleted = deleteAllSessionData(sessionKey, uid);
  return NextResponse.json({ deleted: true, ...deleted });
}
