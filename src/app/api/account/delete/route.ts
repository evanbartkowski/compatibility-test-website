import { readJsonBody } from "@/lib/server/request-body";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  verifyFirebaseIdToken,
  clearUidCookie,
  getReadOnlyVerifiedUid,
} from "@/lib/server/firebase-auth";
import {
  getReadOnlySessionKey,
  SESSION_COOKIE_NAME,
} from "@/lib/server/session";
import {
  deleteAllSessionData,
  revokeAccountSessions,
} from "@/lib/server/store";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { isFirebaseProfileSyncEnabled } from "@/lib/firebase/config";
export async function POST(req: NextRequest) {
  const uid = await getReadOnlyVerifiedUid(req);
  if (!uid)
    return NextResponse.json(
      { error: "Sign in before deleting an account." },
      { status: 401 },
    );
  if (!checkRateLimit(`account-delete:${uid}`, 5, 3600000).allowed)
    return NextResponse.json(
      { error: "Too many deletion attempts. Try again later." },
      { status: 429 },
    );
  const body = z
    .object({
      idToken: z.string().min(32).max(8192),
      confirmation: z.literal("DELETE"),
    })
    .safeParse(await readJsonBody(req).catch(() => null));
  if (!body.success)
    return NextResponse.json(
      {
        error:
          "A fresh sign-in and explicit deletion confirmation are required.",
      },
      { status: 400 },
    );
  const verified = await verifyFirebaseIdToken(body.data.idToken);
  if (verified?.uid !== uid)
    return NextResponse.json(
      { error: "Sign in again to confirm account ownership." },
      { status: 401 },
    );
  let authTime = 0;
  try {
    authTime = JSON.parse(
      Buffer.from(body.data.idToken.split(".")[1], "base64url").toString(),
    ).auth_time;
  } catch {}
  if (!authTime || Date.now() / 1000 - authTime > 300)
    return NextResponse.json(
      {
        error:
          "Sign out and sign back in before deleting your account. The confirmation must be within five minutes.",
      },
      { status: 401 },
    );
  try {
    // Only a deployment that explicitly enables profile copies requires Firestore.
    if (isFirebaseProfileSyncEnabled()) {
      const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST
        ? `http://${process.env.FIRESTORE_EMULATOR_HOST}`
        : "https://firestore.googleapis.com";
      const profile = await fetch(
        `${firestoreHost}/v1/projects/${project}/databases/(default)/documents/users/${encodeURIComponent(uid)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${body.data.idToken}` },
          cache: "no-store",
        },
      );
      if (!profile.ok && profile.status !== 404) {
        throw new Error(
          "The cloud profile could not be erased. Retry once the data service is available.",
        );
      }
    }
    const sessionKey = await getReadOnlySessionKey();
    const deleted = deleteAllSessionData(sessionKey, uid);
    const host = process.env.FIREBASE_AUTH_EMULATOR_HOST
      ? `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com`
      : "https://identitytoolkit.googleapis.com";
    const removed = await fetch(
      `${host}/v1/accounts:delete?key=${encodeURIComponent(process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "")}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: body.data.idToken }),
        cache: "no-store",
      },
    );
    if (!removed.ok)
      throw new Error(
        "Your app data was erased, but the identity service could not delete the account. Sign in again and retry.",
      );
    revokeAccountSessions(uid);
    const response = NextResponse.json({
      deleted: true,
      accountDeleted: true,
      ...deleted,
    });
    clearUidCookie(response);
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete the account.",
      },
      { status: 503 },
    );
  }
}
