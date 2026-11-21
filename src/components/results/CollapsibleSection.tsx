"use client";

import React, { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CollapsibleSectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function CollapsibleSection({
  id,
  title,
  subtitle,
  badge,
  icon: Icon,
  defaultOpen = false,
  className,
  children,
}: CollapsibleSectionProps) {
  const details = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const revealTarget = () => {
      let key: string;
      try { key = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
      const target = key ? document.getElementById(key) : null;
      if (target && details.current?.contains(target)) {
        details.current.open = true;
        target.scrollIntoView?.({ block: "start" });
      }
    };
    revealTarget();
    window.addEventListener("hashchange", revealTarget);
    return () => window.removeEventListener("hashchange", revealTarget);
  }, [children]);
  return (
    <details
      ref={details}
      id={id}
      className={cn(
        "group rounded-lg border transition-all duration-300 open:pb-2",
        className
      )}
      style={{
        backgroundColor: "var(--bg-elevated)",
        borderColor: "var(--border-hairline)",
      }}
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between p-5 sm:p-6 select-none [&::-webkit-details-marker]:hidden hover:bg-[var(--bg-subtle)]/60 rounded-lg transition-colors">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 pr-3">
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--accent-plum)] group-hover:scale-105 transition-transform">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg sm:text-xl text-[var(--ink-primary)]">
                {title}
              </h3>
              {badge}
            </div>
            {subtitle && (
              <p className="mt-0.5 text-xs text-[var(--ink-muted)] truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs font-medium text-[var(--ink-muted)] group-open:hidden hidden sm:inline">
            Show details
          </span>
          <span className="text-xs font-medium text-[var(--accent-plum)] group-open:inline hidden">
            Hide
          </span>
          <ChevronDown className="h-5 w-5 text-[var(--ink-muted)] transition-transform duration-300 group-open:rotate-180 group-hover:text-[var(--ink-primary)]" />
        </div>
      </summary>
      <div
        className="border-t p-5 sm:p-7"
        style={{ borderColor: "var(--border-hairline)" }}
      >
        {children}
      </div>
    </details>
  );
}
