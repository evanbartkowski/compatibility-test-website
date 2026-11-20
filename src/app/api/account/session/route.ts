import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  attachUidCookie,
  clearUidCookie,
  getReadOnlyVerifiedUid,
  verifyFirebaseIdToken,
} from "@/lib/server/firebase-auth";
import { attachSessionCookie, getOrCreateSessionKey } from "@/lib/server/session";
import { claimGuestSessionData } from "@/lib/server/store";

const sessionSchema = z.object({
  idToken: z.string().min(32).max(8192),
});

export async function GET(req: NextRequest) {
  const uid = await getReadOnlyVerifiedUid(req);
  return NextResponse.json(
    { signedIn: Boolean(uid), uid },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = sessionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Valid Firebase idToken is required." }, { status: 400 });
  }

  const verified = await verifyFirebaseIdToken(parsed.data.idToken);
  if (!verified) {
    return NextResponse.json(
      { error: "Unable to verify Firebase session token." },
      { status: 401 }
    );
  }

  const { sessionKey, isNew } = await getOrCreateSessionKey(req.headers.get("x-between-us-sid"));
  const claimed = claimGuestSessionData({
    sessionKey,
    uid: verified.uid,
    email: verified.email,
    displayName: verified.displayName,
  });

  const res = NextResponse.json({
    ok: true,
    uid: verified.uid,
    email: verified.email,
    displayName: verified.displayName,
    ...claimed,
  });
  attachUidCookie(res, verified.uid);
  if (isNew) attachSessionCookie(res, sessionKey);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true, signedOut: true });
  clearUidCookie(res);
  return res;
}
