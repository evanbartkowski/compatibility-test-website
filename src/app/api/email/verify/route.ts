import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isEmailProviderConfigured, sendTransactionalEmail } from "@/lib/server/email";
import { attachSessionCookie, getOrCreateSessionKey } from "@/lib/server/session";
import {
  createEmailVerificationChallenge,
  verifyEmailCode,
} from "@/lib/server/store";
import { brandConfig } from "@/config/brand";

const verifySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("request"),
    email: z.string().email(),
  }),
  z.object({
    action: z.literal("confirm"),
    email: z.string().email(),
    code: z.string().min(4).max(12),
  }),
]);

export async function POST(req: NextRequest) {
  const { sessionKey, isNew } = await getOrCreateSessionKey(req.headers.get("x-between-us-sid"));
  const json = await req.json().catch(() => null);
  const parsed = verifySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Valid email and action required." }, { status: 400 });
  }

  const provider = isEmailProviderConfigured();
  if (!provider.configured) {
    return NextResponse.json(
      {
        ok: false,
        notConfigured: true,
        error:
          "Email delivery provider is not configured on this server (RESEND_API_KEY or SMTP settings missing). Please download your PDF, JSON, or CSV directly.",
      },
      { status: 503 }
    );
  }

  if (parsed.data.action === "request") {
    const challenge = createEmailVerificationChallenge(parsed.data.email);
    const sendOutcome = await sendTransactionalEmail({
      to: challenge.normalizedEmail,
      subject: `Your ${brandConfig.name} verification code: ${challenge.code}`,
      text: `Your ${brandConfig.name} verification code is ${challenge.code}. It expires in 15 minutes.`,
      html: `<div style="font-family:Georgia,serif;color:#1F181C;max-width:480px;padding:24px;">
        <h2 style="margin:0 0 12px;">Verify your email for ${brandConfig.name}</h2>
        <p style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.6;">Use this 6-digit verification code within 15 minutes before requesting report delivery:</p>
        <p style="font-family:monospace;font-size:28px;font-weight:700;letter-spacing:4px;color:#68324A;">${challenge.code}</p>
        <p style="font-family:system-ui,sans-serif;font-size:12px;color:#6E5D66;">If you did not request this code, ignore this message.</p>
      </div>`,
    });

    if (!sendOutcome.ok) {
      return NextResponse.json(
        { ok: false, error: sendOutcome.error || "Unable to send verification email." },
        { status: 502 }
      );
    }

    const res = NextResponse.json({ ok: true, sent: true, expiresAt: challenge.expiresAt });
    if (isNew) attachSessionCookie(res, sessionKey);
    return res;
  }

  const verified = verifyEmailCode({
    email: parsed.data.email,
    code: parsed.data.code,
    sessionKey,
  });

  if (!verified.ok) {
    return NextResponse.json({ ok: false, error: verified.error }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true, verified: true });
  if (isNew) attachSessionCookie(res, sessionKey);
  return res;
}
