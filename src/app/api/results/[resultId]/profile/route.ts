import { NextRequest, NextResponse } from "next/server";
import { rankingsFromRadar } from "@/lib/assessment/role-rankings";
import { canAccessResult, getSubmissionResult } from "@/lib/server/store";
import { getReadOnlySessionKey } from "@/lib/server/session";
import { getReadOnlyVerifiedUid } from "@/lib/server/firebase-auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ resultId: string }> },
) {
  const { resultId } = await context.params;
  if (!/^sub_[A-Za-z0-9_-]{8,80}$/.test(resultId)) {
    return NextResponse.json({ error: "Result not found." }, { status: 404 });
  }
  const sessionKey = await getReadOnlySessionKey(req.headers.get("x-between-us-sid"));
  const uid = await getReadOnlyVerifiedUid(req);
  if (!canAccessResult({ resultId, sessionKey, uid })) {
    return NextResponse.json({ error: "Result not found or unauthorized." }, { status: 404 });
  }
  const sub = getSubmissionResult(resultId);
  if (!sub) return NextResponse.json({ error: "Result not found." }, { status: 404 });
  const roles = sub.result.roleRankings?.length
    ? sub.result.roleRankings
    : rankingsFromRadar(sub.result);
  return NextResponse.json({
    resultId,
    title: sub.result.assessmentTitle || sub.assessmentSlug,
    slug: sub.assessmentSlug,
    roles: roles.map((role) => ({
      key: role.key,
      label: role.label,
      group: role.group,
      percent: role.percent,
    })),
  });
}
