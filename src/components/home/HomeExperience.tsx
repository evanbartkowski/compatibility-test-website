"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { useOptionalAuth } from "@/components/auth/AuthProvider";
import { HomeResultPreview, type ProfileExample } from "./HomeResultPreview";
import { LivingBackdrop } from "./LivingBackdrop";

export function HomeExperience({
  example,
  partner,
  children,
}: {
  example: ProfileExample;
  partner: ProfileExample;
  children: ReactNode;
}) {
  const [moving, setMoving] = useState(false);
  const pointer = useRef({ x: 0, y: 0 });
  const { user, openAuthModal } = useOptionalAuth();
  const [stats, setStats] = useState<string | null>(null);
  useEffect(() => {
    if (!user) {
      setStats(null);
      return;
    }
    const controller = new AbortController();
    fetch("/api/dashboard", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const latest = data?.submissions?.[0];
        const roles = latest?.result?.roleRankings || latest?.result?.radar || [];
        const top = roles.slice(0, 5).map((r: { label: string; percent?: number; score?: number }) => `${r.label} ${r.percent ?? r.score}%`);
        setStats(top.length ? top.join(" · ") : null);
      })
      .catch(() => setStats(null));
    return () => controller.abort();
  }, [user]);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMoving(!preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  return (
    <div
      className="home-experience"
      onPointerMove={(event) => {
        pointer.current = {
          x: event.clientX / innerWidth - 0.5,
          y: event.clientY / innerHeight - 0.5,
        };
      }}
    >
      <LivingBackdrop moving={moving} pointer={pointer} />
      <div className="site-shell home-content">
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-hero-copy">
            <h1 id="home-title" className="font-display">
              Discover what
              <br />
              sparks your flame.
            </h1>
            <p>
              SoulFlame brings you candid, viral tests for love compatibility, kinks,
              personality, desires, and connection. Private by default.
            </p>
            <div className="hero-actions">
              <Link href="/explore" className="button button-primary">
                Discover your test <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
              {user ? (
                <Link href="/profile" className="button button-secondary">
                  Open my profile
                </Link>
              ) : (
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => openAuthModal("register")}
                >
                  Create account
                </button>
              )}
            </div>
            {stats && <p className="home-privacy-note">Your latest pattern: {stats}</p>}
            <p className="home-privacy-note">
              <LockKeyhole size={14} aria-hidden="true" />
              Private by default. Start as a guest.
            </p>
          </div>
          <HomeResultPreview
            example={example}
            partner={partner}
            moving={moving}
            onMotionChange={setMoving}
          />
        </section>
        {children}
      </div>
    </div>
  );
}
