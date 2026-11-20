import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  attachUidCookie,
  getReadOnlyVerifiedUid,
  verifyFirebaseIdToken,
} from "@/lib/server/firebase-auth";
import { attachSessionCookie, getOrCreateSessionKey } from "@/lib/server/session";
import { claimGuestSessionData } from "@/lib/server/store";

const claimSchema = z.object({
  idToken: z.string().min(32).max(8192).optional(),
  email: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  const { sessionKey, isNew } = await getOrCreateSessionKey(req.headers.get("x-between-us-sid"));
  const json = await req.json().catch(() => ({}));
  const parsed = claimSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid claim payload." }, { status: 400 });
  }

  let verifiedUid: string | null = null;
  let verifiedEmail: string | undefined = parsed.data.email;
  let verifiedDisplayName: string | undefined;

  if (parsed.data.idToken) {
    const verified = await verifyFirebaseIdToken(parsed.data.idToken);
    if (!verified) {
      return NextResponse.json({ error: "Invalid Firebase ID token." }, { status: 401 });
    }
    verifiedUid = verified.uid;
    verifiedEmail = verified.email ?? verifiedEmail;
    verifiedDisplayName = verified.displayName;
  } else {
    verifiedUid = await getReadOnlyVerifiedUid(req);
  }

  if (!verifiedUid) {
    return NextResponse.json(
      { error: "Verified account session required to link guest results." },
      { status: 401 }
    );
  }

  const outcome = claimGuestSessionData({
    sessionKey,
    uid: verifiedUid,
    email: verifiedEmail,
    displayName: verifiedDisplayName,
  });

  const res = NextResponse.json({ ok: true, uid: verifiedUid, ...outcome });
  if (parsed.data.idToken) {
    attachUidCookie(res, verifiedUid);
  }
  if (isNew) attachSessionCookie(res, sessionKey);
  return res;
}
