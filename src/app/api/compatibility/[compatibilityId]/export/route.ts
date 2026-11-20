import { NextRequest, NextResponse } from "next/server";
import {
  generateCompatibilityCsv,
  generateCompatibilityPdf,
} from "@/lib/exports/pdf-generator";
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
  const format = (req.nextUrl.searchParams.get("format") || "pdf").toLowerCase();

  if (!canAccessCompatibility({ compatibilityId, sessionKey, uid, accessToken })) {
    return NextResponse.json(
      { error: "Compatibility report not found or unauthorized." },
      { status: 404 }
    );
  }

  const report = getCompatibilityReport(compatibilityId);
  if (!report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const safeSlug = report.assessmentSlug.replace(/[^a-z0-9-_]/gi, "-");

  if (format === "json") {
    return new NextResponse(JSON.stringify(report, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="truth-desire-compatibility-${safeSlug}-${compatibilityId.slice(0, 8)}.json"`,
        "Cache-Control": "no-store",
      },
    });
  }

  if (format === "csv") {
    const csv = generateCompatibilityCsv(report);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="truth-desire-compatibility-${safeSlug}-${compatibilityId.slice(0, 8)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const pdfBytes = await generateCompatibilityPdf(report);
  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="truth-desire-compatibility-${safeSlug}-${compatibilityId.slice(0, 8)}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
