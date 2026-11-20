import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

export const ADMIN_COOKIE_NAME = "between_us_admin";

function getConfiguredAdminKey(): string | null {
  const key = process.env.BETWEEN_US_ADMIN_KEY?.trim();
  if (key && key.length >= 8) return key;
  if (process.env.NODE_ENV !== "production") {
    return "between-us-local-dev-admin";
  }
  return null;
}

export function isAdminKeyConfigured(): boolean {
  return getConfiguredAdminKey() !== null;
}

function signAdminPayload(issuedAt: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(`admin:${issuedAt}`)
    .digest("base64url");
}

export function verifyAdminPassphrase(candidate: string): boolean {
  const secret = getConfiguredAdminKey();
  if (!secret || !candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createAdminCookieValue(): string | null {
  const secret = getConfiguredAdminKey();
  if (!secret) return null;
  const issuedAt = String(Date.now());
  const sig = signAdminPayload(issuedAt, secret);
  return `${issuedAt}.${sig}`;
}

export function verifyAdminCookieValue(value: string | undefined): boolean {
  const secret = getConfiguredAdminKey();
  if (!secret || !value) return false;
  const parts = value.split(".");
  if (parts.length !== 2) return false;
  const [issuedAt, sig] = parts;
  const ts = Number(issuedAt);
  if (!Number.isFinite(ts) || Date.now() - ts > 1000 * 60 * 60 * 12) {
    return false;
  }
  const expected = signAdminPayload(issuedAt, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function isAdminRequest(req?: NextRequest): Promise<boolean> {
  const headerKey = req?.headers.get("x-between-us-admin-key");
  if (headerKey && verifyAdminPassphrase(headerKey)) {
    return true;
  }
  if (req) {
    const cookieVal = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (verifyAdminCookieValue(cookieVal)) return true;
  }
  try {
    const store = await cookies();
    const cookieVal = store.get(ADMIN_COOKIE_NAME)?.value;
    return verifyAdminCookieValue(cookieVal);
  } catch {
    return false;
  }
}

export function attachAdminCookie(res: NextResponse): NextResponse {
  const val = createAdminCookieValue();
  const isSecure =
    process.env.NODE_ENV === "production" && process.env.ALLOW_HTTP_LOCALHOST !== "true";
  if (val) {
    res.cookies.set(ADMIN_COOKIE_NAME, val, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
      secure: isSecure,
    });
  }
  return res;
}

export function clearAdminCookie(res: NextResponse): NextResponse {
  res.cookies.delete(ADMIN_COOKIE_NAME);
  return res;
}
