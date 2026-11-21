"use client";
import { useEffect, useRef, useState } from "react";
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
      <defs>
        <linearGradient
          id="sf-brand-grad"
          x1="9"
          y1="31"
          x2="27"
          y2="4"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FF1361" />
          <stop offset="50%" stopColor="#FF5722" />
          <stop offset="100%" stopColor="#FFA000" />
        </linearGradient>
        <linearGradient
          id="sf-brand-core"
          x1="15"
          y1="25"
          x2="21"
          y2="12"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FF8F00" />
          <stop offset="100%" stopColor="#FFF8E1" />
        </linearGradient>
      </defs>
      <path
        d="M18 4C19 8.5 22 11.5 24.5 14.5C27 17.5 28 20.8 26.8 24C25 28.5 20.5 31 18 31C15.5 31 11 28.5 9.2 24C8 20.8 9 17.5 11.5 14.5C14 11.5 17 8.5 18 4Z"
        fill="url(#sf-brand-grad)"
      />
      <path
        d="M18 12.5C19 15 21 17.5 21 20C21 23 19.5 25 18 25C16.5 25 15 23 15 20C15 17.5 17 15 18 12.5Z"
        fill="url(#sf-brand-core)"
      />
    </svg>
  );
}
const links = [
  { href: "/explore", label: "Discover tests" },
  { href: "/profile", label: "My profile" },
  { href: "/compare", label: "Compare" },
  { href: "/history", label: "History" },
];
export function SiteHeader() {
  const pathname = usePathname();
  const { theme, toggleTheme, ready: themeReady } = useTheme();
  const { user, loading, openAuthModal } = useOptionalAuth();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setOpen(false);
    };
    const wider = window.matchMedia("(min-width: 901px)");
    const resize = () => { if (wider.matches) setOpen(false); };
    window.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    wider.addEventListener("change", resize);
    return () => {
      window.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
      wider.removeEventListener("change", resize);
    };
  }, [open]);
  return (
    <header className="site-header" ref={headerRef}>
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
            disabled={!themeReady}
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
            ref={toggleRef}
            disabled={!themeReady}
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
                aria-current={pathname.startsWith(link.href) ? "page" : undefined}
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
