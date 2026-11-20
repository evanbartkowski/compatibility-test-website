import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

export const UID_COOKIE_NAME = "between_us_uid";

export interface VerifiedFirebaseUser {
  uid: string;
  email?: string;
  displayName?: string;
}

function getSigningSecret(): string {
  return (
    process.env.BETWEEN_US_UID_SECRET ||
    process.env.BETWEEN_US_ADMIN_KEY ||
    "truth-desire-local-uid-signing-secret"
  );
}

export function signUidCookie(uid: string): string {
  const sig = crypto.createHmac("sha256", getSigningSecret()).update(uid).digest("base64url");
  return `${uid}.${sig}`;
}

export function verifySignedUidCookie(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const idx = raw.lastIndexOf(".");
  if (idx <= 0 || idx === raw.length - 1) return null;
  const uid = raw.slice(0, idx);
  const sig = raw.slice(idx + 1);
  if (uid.length < 4 || uid.length > 128) return null;

  const expected = crypto.createHmac("sha256", getSigningSecret()).update(uid).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  return uid;
}

export async function verifyFirebaseIdToken(
  idToken: string
): Promise<VerifiedFirebaseUser | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  if (!apiKey || !idToken || idToken.length < 32) {
    return null;
  }

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      users?: Array<{
        localId?: string;
        email?: string;
        displayName?: string;
        disabled?: boolean;
      }>;
    };
    const user = data.users?.[0];
    if (!user?.localId || user.disabled) {
      return null;
    }
    return {
      uid: user.localId,
      email: user.email,
      displayName: user.displayName,
    };
  } catch {
    return null;
  }
}

export async function getReadOnlyVerifiedUid(req?: NextRequest): Promise<string | null> {
  const rawCookie = req
    ? req.cookies.get(UID_COOKIE_NAME)?.value
    : (await cookies()).get(UID_COOKIE_NAME)?.value;
  return verifySignedUidCookie(rawCookie);
}

export function attachUidCookie(res: NextResponse, uid: string): NextResponse {
  const isSecure =
    process.env.NODE_ENV === "production" && process.env.ALLOW_HTTP_LOCALHOST !== "true";
  res.cookies.set(UID_COOKIE_NAME, signUidCookie(uid), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
    secure: isSecure,
  });
  return res;
}

export function clearUidCookie(res: NextResponse): NextResponse {
  res.cookies.delete(UID_COOKIE_NAME);
  return res;
}
