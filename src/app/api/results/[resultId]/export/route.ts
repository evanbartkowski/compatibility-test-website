import { projectPrivateExport } from "@/lib/exports/private-export";
import { NextRequest, NextResponse } from "next/server";
import {
  generateResultCsv,
  generateResultPdf,
} from "@/lib/exports/pdf-generator";
import { getReadOnlyVerifiedUid } from "@/lib/server/firebase-auth";
import { getReadOnlySessionKey } from "@/lib/server/session";
import { canAccessResult, getSubmissionResult } from "@/lib/server/store";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ resultId: string }> },
) {
  const { resultId } = await context.params;
  const sessionKey = await getReadOnlySessionKey(
    req.headers.get("x-between-us-sid"),
  );
  const uid = await getReadOnlyVerifiedUid(req);
  const accessToken = req.nextUrl.searchParams.get("access");
  const format = (
    req.nextUrl.searchParams.get("format") || "pdf"
  ).toLowerCase();
  const includeQa = req.nextUrl.searchParams.get("answers") === "true";
  const includeSensitive = req.nextUrl.searchParams.get("sensitive") === "true";

  if (!canAccessResult({ resultId, sessionKey, uid, accessToken })) {
    return NextResponse.json(
      { error: "Result not found or unauthorized." },
      { status: 404 },
    );
  }

  const sub = getSubmissionResult(resultId);
  if (!sub) {
    return NextResponse.json({ error: "Result not found." }, { status: 404 });
  }

  const result = projectPrivateExport(sub.result, {
    includeAnswers: includeQa,
    includeSensitive,
  });
  const safeSlug = sub.result.assessmentSlug.replace(/[^a-z0-9-_]/gi, "-");

  if (format === "json") {
    const jsonBody = JSON.stringify(result, null, 2);
    return new NextResponse(jsonBody, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="truth-desire-${safeSlug}-${resultId.slice(0, 8)}.json"`,
        "Cache-Control": "no-store",
      },
    });
  }

  if (format === "csv") {
    const csv = generateResultCsv(result);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="truth-desire-${safeSlug}-${resultId.slice(0, 8)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const pdfBytes = await generateResultPdf(result, {
    includeQaSummary: includeQa,
  });
  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="truth-desire-${safeSlug}-${resultId.slice(0, 8)}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
