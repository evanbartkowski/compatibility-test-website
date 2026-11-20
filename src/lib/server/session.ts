import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const SESSION_COOKIE_NAME = "between_us_sid";

export async function getReadOnlySessionKey(
  requestHeaderSid?: string | null
): Promise<string | null> {
  if (requestHeaderSid && requestHeaderSid.length >= 16) {
    return requestHeaderSid;
  }
  const store = await cookies();
  const existing = store.get(SESSION_COOKIE_NAME)?.value;
  if (existing && existing.length >= 16) {
    return existing;
  }
  return null;
}

export async function getOrCreateSessionKey(requestHeaderSid?: string | null): Promise<{
  sessionKey: string;
  isNew: boolean;
}> {
  const existing = await getReadOnlySessionKey(requestHeaderSid);
  if (existing) {
    return { sessionKey: existing, isNew: false };
  }
  return {
    sessionKey: `sid_${crypto.randomBytes(16).toString("hex")}`,
    isNew: true,
  };
}

export function attachSessionCookie(res: NextResponse, sessionKey: string): NextResponse {
  const isSecure =
    process.env.NODE_ENV === "production" && process.env.ALLOW_HTTP_LOCALHOST !== "true";
  res.cookies.set(SESSION_COOKIE_NAME, sessionKey, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180, // 180 days
    secure: isSecure,
  });
  return res;
}
