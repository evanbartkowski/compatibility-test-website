import { readJsonBody } from "@/lib/server/request-body";
import { NextRequest, NextResponse } from "next/server";
import {
  attachAdminCookie,
  clearAdminCookie,
  isAdminKeyConfigured,
  isAdminRequest,
  verifyAdminPassphrase,
} from "@/lib/server/admin-auth";
import { checkRateLimit } from "@/lib/server/rate-limit";

export async function GET(req: NextRequest) {
  const authenticated = await isAdminRequest(req);
  return NextResponse.json({
    authenticated,
    configured: isAdminKeyConfigured(),
    devFallbackActive:
      process.env.NODE_ENV !== "production" && !process.env.BETWEEN_US_ADMIN_KEY,
  });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const rl = checkRateLimit(`admin-auth:${ip}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many login attempts." }, { status: 429 });
  }

  const body = await readJsonBody(req).catch((): Record<string, unknown> => ({}));
  const passphrase = typeof body.passphrase === "string" ? body.passphrase : "";
  if (!isAdminKeyConfigured()) {
    return NextResponse.json(
      { error: "BETWEEN_US_ADMIN_KEY is not configured in this environment." },
      { status: 503 }
    );
  }
  if (!verifyAdminPassphrase(passphrase)) {
    return NextResponse.json({ error: "Invalid administrator passphrase." }, { status: 401 });
  }

  const res = NextResponse.json({ authenticated: true });
  attachAdminCookie(res);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ authenticated: false });
  clearAdminCookie(res);
  return res;
}
