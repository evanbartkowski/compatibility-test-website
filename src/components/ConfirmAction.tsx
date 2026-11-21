"use client";
import { useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
export function ConfirmAction({
  children,
  title,
  description,
  onConfirm,
  className = "button button-quiet button-small",
  confirmLabel = "Confirm",
}: {
  children: ReactNode;
  title: string;
  description: string;
  onConfirm: () => Promise<void> | void;
  className?: string;
  confirmLabel?: string;
}) {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!busy) {
          setOpen(next);
          setError("");
        }
      }}
    >
      <Dialog.Trigger asChild>
        <button type="button" className={className}>
          {children}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
        <Dialog.Content className="confirm-dialog">
          <div className="flex justify-between gap-4">
            <Dialog.Title className="font-display text-2xl">
              {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close confirmation"
              className="icon-button shrink-0"
              disabled={busy}
            >
              <X size={16} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="text-sm leading-relaxed text-[var(--ink-secondary)] mt-4">
            {description}
          </Dialog.Description>
          {error && (
            <p role="alert" className="text-sm text-[var(--accent-rose)] mt-4">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 mt-7">
            <Dialog.Close className="button button-secondary" disabled={busy}>
              Cancel
            </Dialog.Close>
            <button
              type="button"
              className="button button-primary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await onConfirm();
                  setOpen(false);
                } catch (e) {
                  setError(
                    e instanceof Error
                      ? e.message
                      : "The action failed. Try again.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Working…" : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
