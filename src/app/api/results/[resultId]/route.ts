import { readJsonBody } from "@/lib/server/request-body";
import { NextRequest, NextResponse } from "next/server";
import type { CohortFilter } from "@/lib/assessment/community";
import { getReadOnlyVerifiedUid } from "@/lib/server/firebase-auth";
import { getOrCreateSessionKey, getReadOnlySessionKey } from "@/lib/server/session";
import {
  canAccessResult,
  deleteSubmissionForSession,
  getCommunityComparisonForResult,
  getMultiRaterSummaryForSubmission,
  getSubmissionResult,
  updateSubmissionCommunityOptIn,
} from "@/lib/server/store";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ resultId: string }> }
) {
  const { resultId } = await context.params;
  const sessionKey = await getReadOnlySessionKey(req.headers.get("x-between-us-sid"));
  const uid = await getReadOnlyVerifiedUid(req);
  const accessToken = req.nextUrl.searchParams.get("access");

  if (!canAccessResult({ resultId, sessionKey, uid, accessToken })) {
    return NextResponse.json({ error: "Result not found or unauthorized." }, { status: 404 });
  }

  const sub = getSubmissionResult(resultId);
  if (!sub) {
    return NextResponse.json({ error: "Result not found." }, { status: 404 });
  }

  const demo = req.nextUrl.searchParams.get("demo") === "true";
  const ageGroup = (req.nextUrl.searchParams.get("ageGroup") || "all") as CohortFilter["ageGroup"];
  const relationshipStatus = (req.nextUrl.searchParams.get("relationshipStatus") ||
    "all") as CohortFilter["relationshipStatus"];
  const datingPreference = (req.nextUrl.searchParams.get("datingPreference") ||
    "all") as CohortFilter["datingPreference"];

  const community = getCommunityComparisonForResult({
    resultId,
    includeSyntheticDemo: demo,
    cohortFilter: { ageGroup, relationshipStatus, datingPreference },
  });

  const multiRater = getMultiRaterSummaryForSubmission({
    submissionId: resultId,
    sessionKey,
    uid,
  });

  return NextResponse.json({
    result: sub.result,
    optInCommunityStats: sub.consent.optInCommunityStats,
    community,
    multiRater,
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ resultId: string }> }
) {
  const { resultId } = await context.params;
  const { sessionKey } = await getOrCreateSessionKey(req.headers.get("x-between-us-sid"));
  const uid = await getReadOnlyVerifiedUid(req);
  const body = await readJsonBody(req).catch((): Record<string, unknown> => ({}));
  if (typeof body.optInCommunityStats !== "boolean") {
    return NextResponse.json({ error: "optInCommunityStats boolean required." }, { status: 400 });
  }

  const updated = updateSubmissionCommunityOptIn({
    resultId,
    sessionKey,
    uid,
    optInCommunityStats: body.optInCommunityStats,
  });
  if (!updated) {
    return NextResponse.json({ error: "Not found or unauthorized." }, { status: 404 });
  }
  return NextResponse.json({ optInCommunityStats: updated.consent.optInCommunityStats });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ resultId: string }> }
) {
  const { resultId } = await context.params;
  const sessionKey = await getReadOnlySessionKey(req.headers.get("x-between-us-sid"));
  const uid = await getReadOnlyVerifiedUid(req);
  if (!sessionKey && !uid) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const ok = deleteSubmissionForSession({ resultId, sessionKey, uid });
  if (!ok) {
    return NextResponse.json({ error: "Not found or unauthorized." }, { status: 404 });
  }
  return NextResponse.json({ deleted: true });
}
