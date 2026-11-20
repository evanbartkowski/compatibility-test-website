import { NextRequest, NextResponse } from "next/server";
import { getReadOnlyVerifiedUid } from "@/lib/server/firebase-auth";
import { getReadOnlySessionKey } from "@/lib/server/session";
import { canAccessCompatibility, getCompatibilityReport } from "@/lib/server/store";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ compatibilityId: string }> }
) {
  const { compatibilityId } = await context.params;
  const sessionKey = await getReadOnlySessionKey(req.headers.get("x-between-us-sid"));
  const uid = await getReadOnlyVerifiedUid(req);
  const accessToken = req.nextUrl.searchParams.get("access");

  if (!canAccessCompatibility({ compatibilityId, sessionKey, uid, accessToken })) {
    return NextResponse.json(
      { error: "Compatibility report not found, unauthorized, or revoked." },
      { status: 404 }
    );
  }

  const report = getCompatibilityReport(compatibilityId);
  if (!report) {
    return NextResponse.json(
      { error: "Compatibility report not found or access has been revoked." },
      { status: 404 }
    );
  }
  return NextResponse.json({ report });
}
