import { NextResponse } from "next/server";
import { rankingsFromRadar } from "@/lib/assessment/role-rankings";
import { getSubmissionResult } from "@/lib/server/store";

export async function GET(
  _req: Request,
  context: { params: Promise<{ resultId: string }> },
) {
  const { resultId } = await context.params;
  if (!/^sub_[A-Za-z0-9_-]{8,80}$/.test(resultId)) {
    return NextResponse.json({ error: "Result not found." }, { status: 404 });
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
