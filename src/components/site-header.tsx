"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Moon, Sun, X, User } from "lucide-react";
import { useOptionalAuth } from "@/components/auth/AuthProvider";
import { brandConfig } from "@/config/brand";
import { useTheme } from "./theme-provider";

export function BrandMark() {
  return (
    <svg
      className="brand-symbol"
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 31S4 23 4 13a8 8 0 0 1 14-5 8 8 0 0 1 14 5c0 10-14 18-14 18Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M18 26s-8-7-8-13a4 4 0 0 1 8 0 4 4 0 0 1 8 0c0 6-8 13-8 13Z"
        stroke="currentColor"
        strokeWidth="1.3"
        opacity=".5"
      />
    </svg>
  );
}
const links = [
  { href: "/explore", label: "Discover tests" },
  { href: "/profile", label: "My profile" },
  { href: "/couples", label: "Compare" },
  { href: "/results", label: "History" },
];
export function SiteHeader() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, loading, openAuthModal } = useOptionalAuth();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <header className="site-header">
      <div className="site-shell header-inner">
        <Link
          href="/"
          className="brand-link"
          aria-label={`${brandConfig.name} home`}
        >
          <BrandMark />
          {brandConfig.name}
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${link.href === "/community" ? "nav-community" : ""}`}
              aria-current={pathname.startsWith(link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          {!loading &&
            (user ? (
              <Link href="/settings" className="header-signin text-link">
                <User size={16} />
                Account
              </Link>
            ) : (
              <button
                className="header-signin nav-link"
                onClick={() => openAuthModal("signin")}
              >
                Sign in
              </button>
            ))}
          <button
            type="button"
            className="icon-button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {user ? (
            <Link
              href="/profile"
              className="button button-primary button-small header-start"
            >
              My profile
            </Link>
          ) : (
            <button
              type="button"
              className="button button-primary button-small header-start"
              onClick={() => openAuthModal("register")}
            >
              Create account
            </button>
          )}
          <button
            type="button"
            className="icon-button mobile-menu-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-menu"
          className="mobile-navigation"
          aria-label="Mobile navigation"
        >
          {[...links, { href: "/settings", label: "Account & privacy" }].map(
            (link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ),
          )}
          {!loading && !user && (
            <button
              onClick={() => {
                setOpen(false);
                openAuthModal("signin");
              }}
            >
              Sign in
            </button>
          )}
          {!user && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openAuthModal("register");
              }}
            >
              Create account
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
