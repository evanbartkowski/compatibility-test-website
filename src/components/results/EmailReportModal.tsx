"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertCircle, CheckCircle2, Mail, ShieldCheck, X } from "lucide-react";
import { brandConfig } from "@/config/brand";

interface EmailReportModalProps {
  targetType: "result" | "compatibility";
  targetId: string;
  assessmentTitle: string;
}

export function EmailReportModal({
  targetType,
  targetId,
  assessmentTitle,
}: EmailReportModalProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"compose" | "verify" | "verified" | "sent">("compose");
  const [mode, setMode] = useState<"secure_link" | "summary" | "pdf_attachment">("secure_link");
  const [ackPermanent, setAckPermanent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isNotConfigured, setIsNotConfigured] = useState(false);

  const handleRequestOtp = async () => {
    setLoading(true);
    setStatusMsg(null);
    setIsNotConfigured(false);
    try {
      const res = await fetch("/api/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", email }),
      });
      const data = await res.json();
      if (data.notConfigured) {
        setIsNotConfigured(true);
        setStatusMsg(data.error);
      } else if (!res.ok) {
        setStatusMsg(data.error || "Unable to request verification code.");
      } else {
        setStep("verify");
        setStatusMsg("Verification code sent. Check your inbox and enter the 6-digit code below.");
      }
    } catch {
      setStatusMsg("Network error while verifying email.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOtp = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm", email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusMsg(data.error || "Verification code did not match.");
      } else {
        setStep("verified");
        setStatusMsg("Email verified! Choose your delivery mode and send.");
      }
    } catch {
      setStatusMsg("Network error while confirming code.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReport = async () => {
    if (mode === "pdf_attachment" && !ackPermanent) {
      setStatusMsg("Please acknowledge the permanent inbox attachment notice before attaching PDF.");
      return;
    }
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/email/send-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          targetType,
          targetId,
          mode,
          acknowledgePermanentAttachment: ackPermanent,
        }),
      });
      const data = await res.json();
      if (data.notConfigured) {
        setIsNotConfigured(true);
        setStatusMsg(data.error);
      } else if (data.requiresVerification) {
        setStep("compose");
        setStatusMsg(data.error);
      } else if (!res.ok) {
        setStatusMsg(data.error || "Failed to send email.");
      } else {
        setStep("sent");
        setStatusMsg("Report email dispatched cleanly.");
      }
    } catch {
      setStatusMsg("Network error while dispatching report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]"
          style={{ borderColor: "var(--border-strong)" }}
        >
          <Mail className="h-3.5 w-3.5" /> Email Report
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border p-6 shadow-xl"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-hairline)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display text-2xl text-[var(--ink-primary)]">
                Send Report by Email
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-[var(--ink-secondary)]">
                {assessmentTitle} · Recipient ownership verified before any send.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close modal"
                className="rounded-full border p-1.5 text-[var(--ink-muted)] hover:text-[var(--ink-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-5 space-y-4">
            <label className="block text-xs">
              <span className="font-medium text-[var(--ink-primary)]">Your email address</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border bg-[var(--bg-canvas)] px-3.5 py-2.5 text-sm text-[var(--ink-primary)]"
                style={{ borderColor: "var(--border-strong)" }}
              />
            </label>

            {step === "verify" && (
              <div className="space-y-2 rounded-2xl border bg-[var(--bg-subtle)] p-4">
                <label className="block text-xs">
                  <span className="font-medium text-[var(--ink-primary)]">
                    Enter 6-digit verification code
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border bg-[var(--bg-elevated)] px-3 py-2 font-mono-tabular text-sm"
                  />
                </label>
                <button
                  type="button"
                  disabled={loading || code.trim().length < 4}
                  onClick={handleConfirmOtp}
                  className="rounded-full px-4 py-2 text-xs font-medium disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--accent-plum)",
                    color: "var(--accent-plum-contrast)",
                  }}
                >
                  {loading ? "Checking..." : "Confirm Code"}
                </button>
              </div>
            )}

            <div className="space-y-2">
              <span className="block text-xs font-medium text-[var(--ink-primary)]">
                Delivery Privacy Mode
              </span>
              {(
                [
                  {
                    id: "secure_link" as const,
                    title: "Expiring Private Access Link (Recommended)",
                    desc: "Emails only a time-limited 48-hour access link. Detailed answers never sit in your inbox.",
                  },
                  {
                    id: "summary" as const,
                    title: "High-Level Score Summary",
                    desc: "Includes top scores and themes only; intimate details and boundaries omitted.",
                  },
                  {
                    id: "pdf_attachment" as const,
                    title: "Full PDF Report Attachment",
                    desc: "Attaches your generated PDF directly. Permanent copy remains in your email provider.",
                  },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.id}
                  className="flex cursor-pointer items-start gap-2.5 rounded-2xl border p-3 text-xs"
                  style={{
                    backgroundColor:
                      mode === opt.id ? "var(--bg-subtle)" : "var(--bg-canvas)",
                    borderColor:
                      mode === opt.id ? "var(--accent-plum)" : "var(--border-hairline)",
                  }}
                >
                  <input
                    type="radio"
                    name="emailMode"
                    checked={mode === opt.id}
                    onChange={() => setMode(opt.id)}
                    className="mt-0.5 accent-[var(--accent-plum)]"
                  />
                  <span>
                    <strong className="block text-[var(--ink-primary)]">{opt.title}</strong>
                    <span className="text-[var(--ink-secondary)]">{opt.desc}</span>
                  </span>
                </label>
              ))}
            </div>

            {mode === "pdf_attachment" && (
              <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-[var(--accent-gold)] bg-[var(--bg-subtle)] p-3 text-xs text-[var(--ink-primary)]">
                <input
                  type="checkbox"
                  checked={ackPermanent}
                  onChange={(e) => setAckPermanent(e.target.checked)}
                  className="mt-0.5 accent-[var(--accent-plum)]"
                />
                <span>
                  I understand email attachments live outside {brandConfig.name} and remain in my email
                  inbox even if I later delete data here.
                </span>
              </label>
            )}

            {statusMsg && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-2xl border p-3.5 text-xs"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  borderColor:
                    step === "sent" || step === "verified"
                      ? "var(--accent-sage)"
                      : isNotConfigured
                        ? "var(--accent-gold)"
                        : "var(--accent-rose)",
                }}
              >
                {step === "sent" || step === "verified" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-sage)]" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-gold)]" />
                )}
                <div className="space-y-2">
                  <p className="text-[var(--ink-primary)]">{statusMsg}</p>
                  {isNotConfigured && (
                    <a
                      href={
                        targetType === "result"
                          ? `/api/results/${targetId}/export?format=pdf`
                          : `/api/compatibility/${targetId}/export?format=pdf`
                      }
                      className="inline-flex font-medium text-[var(--accent-plum)] underline"
                    >
                      Download PDF Directly Instead &rarr;
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--ink-muted)]">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent-sage)]" />
                Zero unverified bulk sending
              </span>

              {step === "verified" ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSendReport}
                  className="rounded-full px-5 py-2.5 text-xs font-medium disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--accent-plum)",
                    color: "var(--accent-plum-contrast)",
                  }}
                >
                  {loading ? "Sending..." : "Send Email Now"}
                </button>
              ) : step !== "sent" ? (
                <button
                  type="button"
                  disabled={loading || !email.includes("@")}
                  onClick={handleRequestOtp}
                  className="rounded-full px-5 py-2.5 text-xs font-medium disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--accent-plum)",
                    color: "var(--accent-plum-contrast)",
                  }}
                >
                  {loading ? "Sending Code..." : "Send Verification Code"}
                </button>
              ) : null}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
