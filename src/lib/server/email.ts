import nodemailer from "nodemailer";
import { brandConfig } from "@/config/brand";

export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: Array<{
    filename: string;
    content: Uint8Array;
    contentType: string;
  }>;
}

export interface SendEmailOutcome {
  ok: boolean;
  provider: "resend" | "smtp" | "none";
  notConfigured?: boolean;
  error?: string;
}

export function isEmailProviderConfigured(): {
  configured: boolean;
  provider: "resend" | "smtp" | "none";
} {
  if (process.env.RESEND_API_KEY?.trim()) {
    return { configured: true, provider: "resend" };
  }
  if (
    process.env.SMTP_HOST?.trim() &&
    process.env.SMTP_USER?.trim() &&
    process.env.SMTP_PASS?.trim()
  ) {
    return { configured: true, provider: "smtp" };
  }
  return { configured: false, provider: "none" };
}

export async function sendTransactionalEmail(
  payload: SendEmailPayload,
): Promise<SendEmailOutcome> {
  const fromAddress =
    process.env.EMAIL_FROM?.trim() ||
    `${brandConfig.name} <noreply@truthdesire.app>`;

  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
          ...(payload.attachments && payload.attachments.length > 0
            ? {
                attachments: payload.attachments.map((att) => ({
                  filename: att.filename,
                  content: Buffer.from(att.content).toString("base64"),
                })),
              }
            : {}),
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        return {
          ok: false,
          provider: "resend",
          error: `Resend API error (${res.status}): ${body}`,
        };
      }
      return { ok: true, provider: "resend" };
    } catch (err) {
      return {
        ok: false,
        provider: "resend",
        error: err instanceof Error ? err.message : "Resend transport failure",
      };
    }
  }

  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 15000,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT || 587) === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });
      await transporter.sendMail({
        from: fromAddress,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        attachments: payload.attachments?.map((att) => ({
          filename: att.filename,
          content: Buffer.from(att.content),
          contentType: att.contentType,
        })),
      });
      return { ok: true, provider: "smtp" };
    } catch (err) {
      return {
        ok: false,
        provider: "smtp",
        error: err instanceof Error ? err.message : "SMTP delivery failure",
      };
    }
  }

  return {
    ok: false,
    provider: "none",
    notConfigured: true,
    error:
      "Transactional email delivery is not configured on this server yet (set RESEND_API_KEY or SMTP credentials). You can download your PDF, JSON, or CSV directly.",
  };
}
