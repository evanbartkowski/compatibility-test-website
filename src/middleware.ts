import { NextRequest, NextResponse } from "next/server";

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const MAX_DECLARED_BODY = 1024 * 1024;

export function middleware(req: NextRequest) {
  if (!WRITE_METHODS.has(req.method)) return NextResponse.next();
  const origin = req.headers.get("origin");
  const allowed = new Set([req.nextUrl.origin]);
  const host = req.headers.get("host");
  if (host) {
    try {
      const target = new URL(`${req.nextUrl.protocol}//${host}`);
      if (target.host === host && !target.username && !target.password) allowed.add(target.origin);
    } catch { /* Invalid Host headers do not add an allowed origin. */ }
  }
  for (const candidate of [process.env.NEXT_PUBLIC_APP_URL, ...(process.env.BETWEEN_US_ALLOWED_ORIGINS || "").split(",")]) {
    if (!candidate?.trim()) continue;
    try { allowed.add(new URL(candidate.trim()).origin); } catch { /* Invalid configuration grants no extra origins. */ }
  }
  if (req.headers.get("sec-fetch-site") === "cross-site" || (origin && !allowed.has(origin))) {
    return NextResponse.json({ error: "This request must come from this website." }, { status: 403 });
  }
  const length = Number(req.headers.get("content-length") || "0");
  if (!Number.isFinite(length) || length < 0 || length > MAX_DECLARED_BODY) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }
  const type = req.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (req.method !== "DELETE" && type && type !== "application/json") {
    return NextResponse.json({ error: "Send an application/json request." }, { status: 415 });
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
