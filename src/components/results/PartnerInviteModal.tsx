"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, Copy, Link2, Lock, Share2, X } from "lucide-react";
import { brandConfig } from "@/config/brand";
import type { SharingPreferences } from "@/lib/assessment/types";

interface PartnerInviteModalProps {
  resultId: string;
}

export function PartnerInviteModal({ resultId }: PartnerInviteModalProps) {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState("Your Partner");
  const [expiresHours, setExpiresHours] = useState<number>(24 * 7);
  const [sharing, setSharing] = useState<SharingPreferences>({
    shareCategoryScores: true,
    shareAlignedHighlights: true,
    shareComplementaryHighlights: true,
    shareSharedCuriosities: true,
    shareHighLevelBoundariesWithoutDetails: true,
    neverExposeRawPrivateAnswers: true,
  });
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorDisplayName: displayName,
          creatorResultId: resultId,
          expiresInHours: expiresHours,
          creatorSharing: sharing,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to create invitation.");
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      setInviteUrl(`${origin}/invite/${data.token}`);
      setExpiresAt(data.expiresAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate link.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-transform active:scale-[0.98]"
          style={{
            backgroundColor: "var(--accent-plum)",
            color: "var(--accent-plum-contrast)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          <Link2 className="h-4 w-4" />
          Compare With Partner
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border p-6 sm:p-8"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-hairline)",
            boxShadow: "var(--shadow-lifted)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display text-3xl text-[var(--ink-primary)]">
                Discover how compatible you are together
              </Dialog.Title>
              <Dialog.Description className="mt-1.5 text-xs leading-relaxed text-[var(--ink-secondary)]">
                Creates an unguessable, revocable link for your partner. Zero answers are stored in
                the URL, and no account is required.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close modal"
                className="rounded-full p-1.5 text-[var(--ink-muted)] hover:bg-[var(--bg-subtle)]"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {!inviteUrl ? (
            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-xs font-medium text-[var(--ink-primary)]">
                  Name shown to your partner
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={40}
                  placeholder="First name or nickname"
                  className="mt-1.5 w-full rounded-xl border bg-[var(--bg-canvas)] px-3.5 py-2.5 text-sm text-[var(--ink-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--ink-primary)]">
                  Link Expiration
                </label>
                <select
                  value={expiresHours}
                  onChange={(e) => setExpiresHours(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border bg-[var(--bg-canvas)] px-3.5 py-2.5 text-sm text-[var(--ink-primary)]"
                >
                  <option value={24}>24 hours</option>
                  <option value={24 * 7}>7 days (Recommended)</option>
                  <option value={24 * 30}>30 days</option>
                </select>
              </div>

              <div
                className="rounded-2xl border p-4"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  borderColor: "var(--border-hairline)",
                }}
              >
                <p className="text-xs font-semibold text-[var(--ink-primary)]">
                  Privacy &amp; Sharing Controls
                </p>
                <div className="mt-2.5 space-y-2 text-xs text-[var(--ink-secondary)]">
                  {(
                    [
                      ["shareCategoryScores", "Share category scores & overlay radar"],
                      ["shareAlignedHighlights", "Share aligned & differing topic summaries"],
                      ["shareComplementaryHighlights", "Share complementary dynamic insights"],
                      ["shareSharedCuriosities", "Reveal mutually shared curiosities only"],
                      ["shareHighLevelBoundariesWithoutDetails", "Include high-level boundary reminders"],
                    ] as const
                  ).map(([field, label]) => (
                    <label key={field} className="flex cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={sharing[field]}
                        onChange={(e) =>
                          setSharing((s) => ({ ...s, [field]: e.target.checked }))
                        }
                        className="h-3.5 w-3.5 accent-[var(--accent-plum)]"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <p role="alert" className="text-xs font-medium text-[var(--accent-rose)]">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="rounded-full border px-4 py-2 text-xs font-medium text-[var(--ink-secondary)]"
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGenerate}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-60"
                  style={{
                    backgroundColor: "var(--accent-plum)",
                    color: "var(--accent-plum-contrast)",
                  }}
                >
                  <Lock className="h-3.5 w-3.5" />
                  {loading ? "Creating Secure Link..." : "Create Private Invitation"}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div
                className="rounded-2xl border p-4"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  borderColor: "var(--accent-sage)",
                }}
              >
                <p className="text-xs font-semibold text-[var(--accent-sage)]">
                  Private invitation ready
                </p>
                <p className="mt-2 break-all font-mono-tabular text-xs text-[var(--ink-primary)]">
                  {inviteUrl}
                </p>
                {expiresAt && (
                  <p className="mt-2 text-[11px] text-[var(--ink-muted)]">
                    Expires: {new Date(expiresAt).toLocaleString()} · Revocable anytime from your Dashboard
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium"
                  style={{
                    backgroundColor: "var(--accent-plum)",
                    color: "var(--accent-plum-contrast)",
                  }}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied Link" : "Copy Private Link"}
                </button>

                {typeof navigator !== "undefined" && "share" in navigator && (
                  <button
                    type="button"
                    onClick={() =>
                      navigator
                        .share({
                          title: `${brandConfig.name} Compatibility Invitation`,
                          text: "Take this private complementary assessment so we can see how our preferences align.",
                          url: inviteUrl,
                        })
                        .catch(() => {})
                    }
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium text-[var(--ink-primary)]"
                  >
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                )}
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
