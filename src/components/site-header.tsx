"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, Moon, Sun, User, X } from "lucide-react";
import { useOptionalAuth } from "@/components/auth/AuthProvider";
import { brandConfig } from "@/config/brand";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

const PRIMARY_NAV_ITEMS = [
  { href: "/explore", label: "Explore Tests" },
  { href: "/couples", label: "Couples" },
  { href: "/profile", label: "My Profile" },
  { href: "/results", label: "My Results" },
  { href: "/community", label: "Community" },
];

const SECONDARY_NAV_ITEMS = [
  { href: "/settings", label: "Privacy & Settings" },
  { href: "/admin", label: "Admin" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, loading: authLoading, firebaseEnabled, openAuthModal, signOut } = useOptionalAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userHandle = user
    ? user.displayName?.trim() || user.email?.split("@")[0] || "Account"
    : null;

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{
        backgroundColor: "color-mix(in srgb, var(--bg-canvas) 88%, transparent)",
        borderColor: "var(--border-hairline)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3 text-left transition-opacity hover:opacity-90"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 32 32"
            className="h-7 w-7 shrink-0"
            fill="none"
          >
            <circle
              cx="12.5"
              cy="16"
              r="7.5"
              stroke="var(--accent-plum)"
              strokeWidth="1.75"
            />
            <circle
              cx="19.5"
              cy="16"
              r="7.5"
              stroke="var(--accent-gold)"
              strokeWidth="1.6"
            />
          </svg>
          <span className="font-display text-2xl tracking-tight text-[var(--ink-primary)]">
            {brandConfig.name}
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-4 lg:gap-6 md:flex">
          {PRIMARY_NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href)) ||
              (item.href === "/explore" && pathname?.startsWith("/assessments")) ||
              (item.href === "/results" && pathname?.startsWith("/dashboard"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap text-sm font-medium transition-colors",
                  active
                    ? "text-[var(--accent-plum)] underline decoration-[var(--accent-gold)] decoration-1 underline-offset-4"
                    : "text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/settings"
            className="hidden whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium text-[var(--ink-secondary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] xl:inline-flex"
            style={{ borderColor: "var(--border-hairline)" }}
          >
            Privacy
          </Link>

          {firebaseEnabled && !authLoading && (
            user ? (
              <div
                className="hidden items-center gap-1 rounded-full border pl-2.5 pr-1 py-1 md:inline-flex"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-strong)",
                }}
              >
                <Link
                  href="/settings"
                  className="inline-flex max-w-[110px] items-center gap-1.5 truncate text-xs font-medium text-[var(--ink-primary)] hover:text-[var(--accent-plum)]"
                  title={user.email || "Signed in"}
                >
                  <User className="h-3.5 w-3.5 shrink-0 text-[var(--accent-plum)]" />
                  <span className="truncate">{userHandle}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  aria-label="Sign out"
                  title="Sign out"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[var(--ink-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--ink-primary)]"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal("signin")}
                className="hidden whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium text-[var(--ink-primary)] transition-colors hover:border-[var(--accent-plum)] hover:bg-[var(--bg-subtle)] md:inline-flex"
                style={{ borderColor: "var(--border-strong)" }}
              >
                Sign In
              </button>
            )
          )}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]"
            style={{ borderColor: "var(--border-hairline)", color: "var(--ink-secondary)" }}
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <Link
            href="/assess/intimacy-partner-preferences"
            className="hidden whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-transform hover:translate-y-[-1px] active:scale-[0.98] lg:inline-flex"
            style={{
              backgroundColor: "var(--accent-plum)",
              color: "var(--accent-plum-contrast)",
            }}
          >
            Start Discovery
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border md:hidden"
            style={{ borderColor: "var(--border-hairline)", color: "var(--ink-primary)" }}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t px-4 py-4 md:hidden"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-hairline)",
          }}
        >
          <div className="flex flex-col gap-2">
            {[...PRIMARY_NAV_ITEMS, ...SECONDARY_NAV_ITEMS].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]"
              >
                {item.label}
              </Link>
            ))}

            {firebaseEnabled && !authLoading && (
              <div
                className="mt-2 border-t pt-3"
                style={{ borderColor: "var(--border-hairline)" }}
              >
                {user ? (
                  <div className="flex items-center justify-between px-3 py-1.5 text-sm">
                    <span className="truncate text-[var(--ink-secondary)]">
                      Signed in: <strong className="text-[var(--ink-primary)]">{userHandle}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        void signOut();
                      }}
                      className="text-xs font-medium text-[var(--accent-plum)]"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      openAuthModal("signin");
                    }}
                    className="w-full rounded-full border py-2.5 text-xs font-medium text-[var(--ink-primary)]"
                    style={{ borderColor: "var(--border-strong)" }}
                  >
                    Optional Sign In / Sync Account
                  </button>
                )}
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
