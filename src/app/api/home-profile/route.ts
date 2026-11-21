import { NextRequest, NextResponse } from "next/server";
import { getReadOnlySessionKey } from "@/lib/server/session";
import { getReadOnlyVerifiedUid } from "@/lib/server/firebase-auth";
import { listSubmissionsForSession } from "@/lib/server/store";
import { buildHomeStats } from "@/lib/assessment/home-stats";

export async function GET(req: NextRequest) {
  const [session, uid] = await Promise.all([
    getReadOnlySessionKey(req.headers.get("x-between-us-sid")),
    req.headers.get("x-profile-view") === "guest"
      ? Promise.resolve(null)
      : getReadOnlyVerifiedUid(req),
  ]);
  const payload = buildHomeStats(
    session || uid ? listSubmissionsForSession(session, uid) : [],
  );
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      Vary: "Cookie, Authorization",
    },
  });
}
