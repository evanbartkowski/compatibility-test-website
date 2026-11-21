import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

export const UID_COOKIE_NAME = "between_us_uid";

export interface VerifiedFirebaseUser {
  uid: string;
  email?: string;
  displayName?: string;
}
export function isAccountSessionConfigured(): boolean {
  return getSigningSecret() !== null;
}

function getSigningSecret(): string | null {
  const configured = process.env.BETWEEN_US_UID_SECRET?.trim();
  if (configured && configured.length >= 32) return configured;
  return process.env.NODE_ENV === "production"
    ? null
    : "truth-desire-local-uid-signing-secret";
}

export function signUidCookie(uid: string): string {
  const secret = getSigningSecret();
  if (!secret)
    throw new Error(
      "Set BETWEEN_US_UID_SECRET to at least 32 random characters before enabling production accounts.",
    );
  const payload = Buffer.from(
    JSON.stringify({
      uid,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 5 * 24 * 60 * 60 * 1000,
    }),
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySignedUidCookie(
  raw: string | undefined | null,
): string | null {
  if (!raw) return null;
  const secret = getSigningSecret();
  if (!secret) return null;
  const idx = raw.lastIndexOf(".");
  if (idx <= 0 || idx === raw.length - 1) return null;
  const payload = raw.slice(0, idx);
  const sig = raw.slice(idx + 1);
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (
      typeof data.uid !== "string" ||
      data.uid.length < 4 ||
      data.uid.length > 128 ||
      !Number.isFinite(data.expiresAt) ||
      !Number.isFinite(data.issuedAt) ||
      data.issuedAt > Date.now() + 30000 ||
      data.expiresAt <= Date.now() ||
      data.expiresAt - data.issuedAt > 5 * 24 * 60 * 60 * 1000
    )
      return null;
    return data.uid;
  } catch {
    return null;
  }
}

export async function verifyFirebaseIdToken(
  idToken: string,
): Promise<VerifiedFirebaseUser | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  if (!apiKey || !idToken || idToken.length < 32) {
    return null;
  }

  try {
    const emulator = process.env.FIREBASE_AUTH_EMULATOR_HOST;
    const base = emulator
      ? `http://${emulator}/identitytoolkit.googleapis.com`
      : "https://identitytoolkit.googleapis.com";
    const res = await fetch(
      `${base}/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        cache: "no-store",
      },
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

export async function getReadOnlyVerifiedUid(
  req?: NextRequest,
): Promise<string | null> {
  const rawCookie = req
    ? req.cookies.get(UID_COOKIE_NAME)?.value
    : (await cookies()).get(UID_COOKIE_NAME)?.value;
  const uid = verifySignedUidCookie(rawCookie);
  if (!uid || !rawCookie) return null;
  const { isAccountSessionRevoked } = await import("./store");
  const issuedAt = JSON.parse(
    Buffer.from(rawCookie.split(".")[0], "base64url").toString(),
  ).issuedAt;
  return isAccountSessionRevoked(uid, issuedAt) ? null : uid;
}

export function attachUidCookie(res: NextResponse, uid: string): NextResponse {
  const isSecure =
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_HTTP_LOCALHOST !== "true";
  res.cookies.set(UID_COOKIE_NAME, signUidCookie(uid), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 5,
    secure: isSecure,
  });
  return res;
}

export function clearUidCookie(res: NextResponse): NextResponse {
  res.cookies.delete(UID_COOKIE_NAME);
  return res;
}
