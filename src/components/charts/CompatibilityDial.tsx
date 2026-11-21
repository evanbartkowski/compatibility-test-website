"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface CompatibilityDialProps {
  score: number;
  coveragePercent: number;
  provisional: boolean;
}

export function CompatibilityDial({
  score,
  coveragePercent,
  provisional,
}: CompatibilityDialProps) {
  const prefersReducedMotion = useReducedMotion();
  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative mx-auto flex h-56 w-56 items-center justify-center">
      <svg viewBox="0 0 210 210" className="h-full w-full -rotate-90">
        <circle
          cx="105"
          cy="105"
          r={radius}
          fill="none"
          stroke="var(--border-hairline)"
          strokeWidth="12"
        />
        <motion.circle
          cx="105"
          cy="105"
          r={radius}
          fill="none"
          stroke="var(--accent-plum)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={
            prefersReducedMotion
              ? { strokeDashoffset }
              : { strokeDashoffset: circumference }
          }
          animate={{ strokeDashoffset }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
          }
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-mono-tabular text-5xl font-semibold tracking-tight text-[var(--ink-primary)]">
          {coveragePercent === 0 ? "—" : clamped}
          {coveragePercent > 0 && (
            <span className="text-2xl text-[var(--ink-muted)]">%</span>
          )}
        </span>
        <span className="mt-1 text-xs font-medium text-[var(--ink-secondary)]">
          {coveragePercent === 0
            ? "Not measured yet"
            : `Coverage: ${coveragePercent}%`}
        </span>
        {provisional && (
          <span
            className="mt-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--accent-gold) 18%, transparent)",
              color: "var(--accent-gold)",
            }}
          >
            Provisional score
          </span>
        )}
      </div>
    </div>
  );
}
