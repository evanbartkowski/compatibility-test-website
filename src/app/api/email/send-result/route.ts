import { readJsonBody } from "@/lib/server/request-body";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { brandConfig } from "@/config/brand";
import {
  generateCompatibilityPdf,
  generateResultPdf,
} from "@/lib/exports/pdf-generator";
import { isEmailProviderConfigured, sendTransactionalEmail } from "@/lib/server/email";
import { getReadOnlyVerifiedUid } from "@/lib/server/firebase-auth";
import { getReadOnlySessionKey } from "@/lib/server/session";
import {
  canAccessCompatibility,
  canAccessResult,
  createResultAccessGrant,
  getCompatibilityReport,
  getSubmissionResult,
  isEmailVerifiedForSession,
  recordEmailDelivery,
} from "@/lib/server/store";

const sendReportSchema = z.object({
  email: z.string().email(),
  targetType: z.enum(["result", "compatibility"]),
  targetId: z.string().min(4),
  mode: z.enum(["secure_link", "summary", "pdf_attachment"]),
  acknowledgePermanentAttachment: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const sessionKey = await getReadOnlySessionKey(req.headers.get("x-between-us-sid"));
  const uid = await getReadOnlyVerifiedUid(req);
  if (!checkRateLimit(`email-report:${uid || sessionKey || req.headers.get("x-forwarded-for") || "local"}`, 10, 60 * 60_000).allowed) return NextResponse.json({ error: "Too many report emails. Try again later." }, { status: 429, headers: { "Retry-After": "3600" } });
  const limit = checkRateLimit(`report-email:${uid || sessionKey || req.headers.get("x-forwarded-for") || "local"}`, 10, 60 * 60_000);
  if (!limit.allowed) return NextResponse.json({ error: "Too many report emails. Try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  const json = await readJsonBody(req).catch(() => null);
  const parsed = sendReportSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email request parameters." }, { status: 400 });
  }

  const { email, targetType, targetId, mode, acknowledgePermanentAttachment } = parsed.data;
  const provider = isEmailProviderConfigured();
  if (!provider.configured) {
    return NextResponse.json(
      {
        ok: false,
        notConfigured: true,
        error:
          "Email delivery provider is not configured on this server (set RESEND_API_KEY or SMTP settings). Use Download PDF/JSON instead.",
      },
      { status: 503 }
    );
  }

  // Require OTP-verified email bound to the active session so attackers cannot abuse report mailing
  if (!isEmailVerifiedForSession(email, sessionKey)) {
    return NextResponse.json(
      {
        ok: false,
        requiresVerification: true,
        error: "Please verify ownership of this email address with your 6-digit code first.",
      },
      { status: 403 }
    );
  }

  if (mode === "pdf_attachment" && !acknowledgePermanentAttachment) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Please confirm the permanent inbox disclosure checkbox before sending a PDF attachment by email.",
      },
      { status: 400 }
    );
  }

  const origin = req.nextUrl.origin;

  if (targetType === "result") {
    if (!canAccessResult({ resultId: targetId, sessionKey, uid })) {
      return NextResponse.json({ error: "Result not found or unauthorized." }, { status: 404 });
    }
    const sub = getSubmissionResult(targetId);
    if (!sub) return NextResponse.json({ error: "Result not found." }, { status: 404 });
    const r = sub.result;

    let subject = `Your ${brandConfig.name} Report: ${r.assessmentTitle}`;
    let html = "";
    let text = "";
    let attachments:
      | Array<{ filename: string; content: Uint8Array; contentType: string }>
      | undefined;

    if (mode === "secure_link") {
      const grant = createResultAccessGrant({
        targetType: "result",
        targetId,
        expiresInHours: 48,
      });
      const url = `${origin}/results/${targetId}?access=${grant.token}`;
      subject = `Private Result Link (Expires in 48h): ${r.assessmentTitle}`;
      text = `Open your private ${brandConfig.name} report (expires in 48 hours): ${url}`;
      html = `<div style="font-family:Georgia,serif;color:#110A0E;max-width:520px;padding:24px;">
        <h2 style="margin:0 0 12px;">Your ${brandConfig.name} Private Report</h2>
        <p style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.6;">For privacy, no assessment details are embedded in this message. Use your expiring private link (valid 48 hours):</p>
        <p style="margin:20px 0;"><a href="${url}" style="background:#C2185B;color:#FFFFFF;padding:12px 20px;border-radius:999px;text-decoration:none;font-family:system-ui,sans-serif;font-size:14px;">View Private Results</a></p>
        <p style="font-family:system-ui,sans-serif;font-size:12px;color:#6B4B5B;">${r.profile.disclaimer}</p>
      </div>`;
    } else if (mode === "summary") {
      const dimsHtml = r.radar
        .map((d) => `<li><strong>${d.label}:</strong> ${d.score}/100</li>`)
        .join("");
      text = `${r.assessmentTitle} - ${r.profile.archetypeName}\n\n${r.profile.summaryParagraph}\n\nScores:\n${r.radar.map((d) => `- ${d.label}: ${d.score}/100`).join("\n")}`;
      html = `<div style="font-family:Georgia,serif;color:#110A0E;max-width:520px;padding:24px;">
        <h2>${r.profile.archetypeName}</h2>
        <p style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.6;">${r.profile.summaryParagraph}</p>
        <ul style="font-family:system-ui,sans-serif;font-size:13px;">${dimsHtml}</ul>
        <p style="font-family:system-ui,sans-serif;font-size:11px;color:#6B4B5B;">Individual acts &amp; private boundaries omitted by design. ${r.profile.disclaimer}</p>
      </div>`;
    } else {
      const pdf = await generateResultPdf(r, { includeQaSummary: true });
      attachments = [
        {
          filename: `truth-desire-${r.assessmentSlug}.pdf`,
          content: pdf,
          contentType: "application/pdf",
        },
      ];
      text = `Attached is the full PDF report you explicitly requested for ${r.assessmentTitle}.`;
      html = `<div style="font-family:Georgia,serif;color:#110A0E;max-width:520px;padding:24px;">
        <h2>Your ${brandConfig.name} PDF Report</h2>
        <p style="font-family:system-ui,sans-serif;font-size:14px;">Your full report for <strong>${r.assessmentTitle}</strong> is attached as a PDF as requested.</p>
      </div>`;
    }

    const resEmail = await sendTransactionalEmail({ to: email, subject, html, text, attachments });
    recordEmailDelivery({
      resultId: targetId,
      recipientEmail: email,
      mode,
      status: resEmail.ok ? "sent" : "failed",
      provider: resEmail.provider,
      errorSummary: resEmail.error,
    });
    if (!resEmail.ok) {
      return NextResponse.json({ ok: false, error: resEmail.error }, { status: 502 });
    }
    return NextResponse.json({ ok: true, sent: true });
  }

  // Compatibility report email delivery
  if (!canAccessCompatibility({ compatibilityId: targetId, sessionKey, uid })) {
    return NextResponse.json({ error: "Report not found or unauthorized." }, { status: 404 });
  }
  const comp = getCompatibilityReport(targetId);
  if (!comp) return NextResponse.json({ error: "Report not found." }, { status: 404 });

  const subject = `Couples Compatibility Report: ${comp.assessmentTitle ?? comp.assessmentSlug}`;
  let html = "";
  let text = "";
  let attachments:
    | Array<{ filename: string; content: Uint8Array; contentType: string }>
    | undefined;

  if (mode === "secure_link") {
    const grant = createResultAccessGrant({
      targetType: "compatibility",
      targetId,
      expiresInHours: 48,
    });
    const url = `${origin}/compatibility/${targetId}?access=${grant.token}`;
    text = `Open your private Couples Compatibility Report (valid 48h): ${url}`;
    html = `<div style="font-family:Georgia,serif;color:#110A0E;max-width:520px;padding:24px;">
      <h2>Couples Compatibility Link</h2>
      <p style="font-family:system-ui,sans-serif;font-size:14px;">For your mutual privacy, detailed insights stay on our server. Open within 48 hours:</p>
      <p style="margin:20px 0;"><a href="${url}" style="background:#C2185B;color:#FFFFFF;padding:12px 20px;border-radius:999px;text-decoration:none;">Open Shared Compatibility</a></p>
    </div>`;
  } else if (mode === "summary") {
    text = `${comp.assessmentTitle}: Overall Alignment ${comp.overallScore}/100 (${comp.label}).\n${comp.coupleInsights.join("\n")}`;
    html = `<div style="font-family:Georgia,serif;color:#110A0E;max-width:520px;padding:24px;">
      <h2>${comp.assessmentTitle} · ${comp.overallScore}/100</h2>
      <ul>${comp.coupleInsights.map((i) => `<li style="font-family:system-ui,sans-serif;font-size:13px;">${i}</li>`).join("")}</ul>
    </div>`;
  } else {
    const pdf = await generateCompatibilityPdf(comp);
    attachments = [
      {
        filename: `truth-desire-compatibility-${comp.assessmentSlug}.pdf`,
        content: pdf,
        contentType: "application/pdf",
      },
    ];
    text = `Attached is your requested Compatibility Report PDF for ${comp.assessmentTitle}.`;
    html = `<div style="font-family:Georgia,serif;color:#110A0E;max-width:520px;padding:24px;">
      <h2>Couples Compatibility PDF</h2>
      <p style="font-family:system-ui,sans-serif;font-size:14px;">Your requested Couples Compatibility report is attached.</p>
    </div>`;
  }

  const resEmail = await sendTransactionalEmail({ to: email, subject, html, text, attachments });
  recordEmailDelivery({
    compatibilityId: targetId,
    recipientEmail: email,
    mode,
    status: resEmail.ok ? "sent" : "failed",
    provider: resEmail.provider,
    errorSummary: resEmail.error,
  });
  if (!resEmail.ok) {
    return NextResponse.json({ ok: false, error: resEmail.error }, { status: 502 });
  }
  return NextResponse.json({ ok: true, sent: true });
}
