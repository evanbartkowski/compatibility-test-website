"use client";

import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertCircle, CheckCircle2, KeyRound, Mail, ShieldCheck, X } from "lucide-react";
import {
  isFirebaseConfigured,
  registerWithEmail,
  sendPasswordReset,
  signInWithEmail,
  signInWithGoogle,
} from "@/lib/firebase/client";
import { brandConfig } from "@/config/brand";
import { cn } from "@/lib/utils";

export type AuthModalMode = "signin" | "register" | "reset";

function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code || "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password did not match an account.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in instead.";
    case "auth/weak-password":
      return "Please choose a password with at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/popup-closed-by-user":
      return "Google sign-in window closed before completing. You can continue as a guest anytime.";
    case "auth/operation-not-allowed":
      return "This sign-in method isn't enabled yet in Firebase Console. Guest mode remains 100% active.";
    case "auth/unauthorized-domain":
      return "This host domain needs to be listed under Firebase Console Authorized Domains.";
    default:
      return err instanceof Error ? err.message : "Could not complete sign-in right now.";
  }
}

export function SignInModal({
  open,
  onOpenChange,
  initialMode = "signin",
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  initialMode?: AuthModalMode;
}) {
  const firebaseEnabled = isFirebaseConfigured();
  const [mode, setMode] = useState<AuthModalMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setError(null);
      setResetSent(false);
    }
  }, [open, initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSent(false);
    setSubmitting(true);
    try {
      if (mode === "reset") {
        await sendPasswordReset(email);
        setResetSent(true);
        return;
      }
      if (mode === "signin") {
        await signInWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, displayName);
      }
      setPassword("");
      onOpenChange(false);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        onOpenChange(false);
      }
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content
          aria-describedby="auth-modal-description"
          className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border p-6 sm:p-8 focus:outline-none"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-strong)",
            boxShadow: "var(--shadow-lifted)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display text-3xl text-[var(--ink-primary)]">
                {mode === "register"
                  ? "Create an optional account"
                  : mode === "reset"
                    ? "Reset your password"
                    : `Sign in to ${brandConfig.name}`}
              </Dialog.Title>
              <Dialog.Description
                id="auth-modal-description"
                className="mt-1.5 text-xs leading-relaxed text-[var(--ink-secondary)]"
              >
                Optional cross-device sync powered by Firebase. You can always take tests, view
                reports, and invite partners completely as a guest.
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Close sign-in dialog"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-hairline)] text-[var(--ink-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--ink-primary)]"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {!firebaseEnabled ? (
            <div
              className="mt-6 rounded-2xl border p-4 text-xs leading-relaxed text-[var(--ink-secondary)]"
              style={{
                backgroundColor: "var(--bg-subtle)",
                borderColor: "var(--border-hairline)",
              }}
            >
              Optional cloud login is waiting on Firebase configuration. Guest sessions remain saved
              privately on this browser.
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {mode !== "reset" && (
                <>
                  <div
                    className="grid grid-cols-2 rounded-full border p-1"
                    style={{
                      backgroundColor: "var(--bg-subtle)",
                      borderColor: "var(--border-hairline)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signin");
                        setError(null);
                      }}
                      className={cn(
                        "rounded-full py-2 text-xs font-medium transition-colors",
                        mode === "signin"
                          ? "bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                          : "text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
                      )}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("register");
                        setError(null);
                      }}
                      className={cn(
                        "rounded-full py-2 text-xs font-medium transition-colors",
                        mode === "register"
                          ? "bg-[var(--accent-plum)] text-[var(--accent-plum-contrast)]"
                          : "text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
                      )}
                    >
                      Create Account
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleGoogle}
                    className="flex w-full items-center justify-center gap-2.5 rounded-full border py-2.5 text-xs font-medium text-[var(--ink-primary)] transition-colors hover:border-[var(--accent-plum)] hover:bg-[var(--bg-subtle)] disabled:opacity-50"
                    style={{ borderColor: "var(--border-strong)" }}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.5h3.3c1.9-1.8 3-4.4 3-7.4ZM12 22c2.7 0 5-.9 6.6-2.4l-3.3-2.5c-.9.6-2 .9-3.3.9-2.5 0-4.7-1.7-5.5-4H3.1v2.6A10 10 0 0 0 12 22Zm-5.5-6a6 6 0 0 1 0-4V9.4H3.1a10 10 0 0 0 0 9.2l3.4-2.6ZM12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8C17 3.1 14.7 2 12 2A10 10 0 0 0 3.1 7.4L6.5 10c.8-2.3 3-4 5.5-4Z"
                      />
                    </svg>
                    Continue with Google
                  </button>

                  <div className="relative flex items-center gap-3 text-[11px] text-[var(--ink-muted)]">
                    <span className="h-px flex-1 bg-[var(--border-hairline)]" />
                    or continue with email
                    <span className="h-px flex-1 bg-[var(--border-hairline)]" />
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === "register" && (
                  <div>
                    <label
                      htmlFor="auth-display-name"
                      className="mb-1 block text-xs font-medium text-[var(--ink-primary)]"
                    >
                      First name or nickname (optional)
                    </label>
                    <input
                      id="auth-display-name"
                      type="text"
                      maxLength={40}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="For partner invitations"
                      className="w-full rounded-xl border bg-[var(--bg-canvas)] px-3.5 py-2.5 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)]"
                      style={{ borderColor: "var(--border-strong)" }}
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="auth-email"
                    className="mb-1 block text-xs font-medium text-[var(--ink-primary)]"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
                    <input
                      id="auth-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border bg-[var(--bg-canvas)] py-2.5 pr-3.5 pl-10 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)]"
                      style={{ borderColor: "var(--border-strong)" }}
                    />
                  </div>
                </div>

                {mode !== "reset" && (
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label
                        htmlFor="auth-password"
                        className="text-xs font-medium text-[var(--ink-primary)]"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("reset");
                          setError(null);
                        }}
                        className="text-[11px] font-medium text-[var(--accent-plum)] hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
                      <input
                        id="auth-password"
                        type="password"
                        required
                        minLength={6}
                        autoComplete={mode === "register" ? "new-password" : "current-password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full rounded-xl border bg-[var(--bg-canvas)] py-2.5 pr-3.5 pl-10 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)]"
                        style={{ borderColor: "var(--border-strong)" }}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border p-3 text-xs text-[var(--accent-rose)]"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--accent-rose) 10%, transparent)",
                      borderColor: "var(--accent-rose)",
                    }}
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {resetSent && (
                  <div
                    role="status"
                    className="flex items-start gap-2 rounded-xl border p-3 text-xs text-[var(--accent-sage)]"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--accent-sage) 10%, transparent)",
                      borderColor: "var(--accent-sage)",
                    }}
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Password reset instructions sent if an account matches that address.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full py-3 text-xs font-semibold transition-transform hover:translate-y-[-1px] disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--accent-plum)",
                    color: "var(--accent-plum-contrast)",
                  }}
                >
                  {submitting
                    ? "Connecting..."
                    : mode === "register"
                      ? "Create Optional Account"
                      : mode === "reset"
                        ? "Send Reset Email"
                        : "Sign In & Sync Results"}
                </button>
              </form>

              {mode === "reset" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setResetSent(false);
                    setError(null);
                  }}
                  className="w-full text-center text-xs text-[var(--accent-plum)] hover:underline"
                >
                  Back to sign in
                </button>
              )}

              <div
                className="flex items-center justify-between border-t pt-4 text-[11px] text-[var(--ink-muted)]"
                style={{ borderColor: "var(--border-hairline)" }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent-sage)]" />
                  Guest progress auto-claims on login
                </span>
                <Dialog.Close className="font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]">
                  Continue as guest
                </Dialog.Close>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
