import { readJsonBody } from "@/lib/server/request-body";
import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/server/admin-auth";
import {
  getAdminTelemetrySummary,
  getEmailTemplates,
  listAllAssessments,
  unpublishAssessment,
  listAssessmentVersions,
  listEditorialAuditItems,
  saveCustomAssessment,
  saveEmailTemplates,
  updateEditorialAuditItem,
} from "@/lib/server/store";
import type { AssessmentDefinition } from "@/lib/assessment/types";

export async function GET(req: NextRequest) {
  const authenticated = await isAdminRequest(req);
  if (!authenticated) {
    return NextResponse.json(
      { authenticated: false, error: "Administrator authentication required." },
      { status: 401 },
    );
  }
  return NextResponse.json({
    authenticated: true,
    assessments: listAllAssessments(),
    versions: listAssessmentVersions(),
    editorialAudit: listEditorialAuditItems(),
    telemetry: getAdminTelemetrySummary(),
    emailTemplates: getEmailTemplates(),
  });
}

export async function POST(req: NextRequest) {
  const authenticated = await isAdminRequest(req);
  if (!authenticated) {
    return NextResponse.json(
      { error: "Unauthorized. Sign in with your administrator key first." },
      { status: 401 },
    );
  }

  try {
    const body = await readJsonBody(req);
    if (body.type === "unpublish_assessment") {
      if (typeof body.slug !== "string" || body.slug.length > 100)
        throw new Error("A valid assessment slug is required.");
      unpublishAssessment(body.slug);
      return NextResponse.json({ unpublished: true });
    }
    if (body.type === "editorial_update") {
      if (body.editorialStatus !== "verified_readable" && body.editorialStatus !== "flagged_obscured") throw new Error("A valid editorial status is required.");
      const updated = updateEditorialAuditItem(
        String(body.chartId),
        body.editorialStatus,
        String(body.editorialNotes || ""),
      );
      if (!updated) {
        return NextResponse.json(
          { error: "Audit item not found." },
          { status: 404 },
        );
      }
      return NextResponse.json({ updated });
    }

    if (body.type === "email_templates") {
      const saved = saveEmailTemplates(body.templates || {});
      return NextResponse.json({ emailTemplates: saved });
    }

    const assessment = body.assessment as AssessmentDefinition;
    if (!assessment?.slug || !assessment?.title) {
      return NextResponse.json(
        { error: "Assessment slug and title are required." },
        { status: 400 },
      );
    }
    const saved = saveCustomAssessment(assessment);
    return NextResponse.json({ assessment: saved });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to save studio item.",
      },
      { status: 400 },
    );
  }
}
