import React from "react";
import type { CSSProperties } from "react";

export interface AssessmentArtworkProps {
  slug: string;
  category?: string;
  className?: string;
  style?: CSSProperties;
  variant?: "card" | "banner" | "thumb";
}

/**
 * 20 Distinct Thematic Artworks for SoulFlame Assessments
 * Dark obsidian, glowing erotic/intimate/neon palette (crimson, rose, violet, gold, cyan, emerald).
 * Fully scalable vector SVG with scoped IDs.
 */

export function AssessmentArtwork({
  slug,
  category = "sexuality-intimacy",
  className = "",
  style,
  variant = "card",
}: AssessmentArtworkProps) {
  const pfx = `sf-art-${slug.replace(/[^a-z0-9]/gi, "-")}`;
  const isBanner = variant === "banner";
  const viewBox = isBanner ? "0 0 360 120" : "0 0 240 120";
  const cx = isBanner ? 180 : 120;
  const cy = 60;

  const renderContent = () => {
    switch (slug) {
      // 1. THE IQ TEST (Cognitive Synapses & Faceted Mind Crystal)
      case "big-five-personality-profile":
        return (
          <>
            <defs>
              <linearGradient id={`${pfx}-g1`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.9" />
              </linearGradient>
              <radialGradient id={`${pfx}-core`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
                <stop offset="40%" stopColor="#818cf8" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
              <filter id={`${pfx}-glow`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle cx={cx} cy={cy} r="48" fill={`url(#${pfx}-core)`} />
            {/* Concentric neural ripples */}
            <ellipse cx={cx} cy={cy} rx="70" ry="26" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.4" />
            <ellipse cx={cx} cy={cy} rx="88" ry="34" stroke="#a855f7" strokeWidth="0.7" strokeDasharray="2 5" opacity="0.3" />
            {/* Synaptic constellation branches */}
            <g stroke="#67e8f9" strokeWidth="1" opacity="0.6">
              <line x1={cx} y1={cy} x2={cx - 55} y2={cy - 28} />
              <line x1={cx} y1={cy} x2={cx + 55} y2={cy - 28} />
              <line x1={cx} y1={cy} x2={cx - 65} y2={cy + 18} />
              <line x1={cx} y1={cy} x2={cx + 65} y2={cy + 18} />
              <line x1={cx - 55} y1={cy - 28} x2={cx - 85} y2={cy - 10} />
              <line x1={cx + 55} y1={cy - 28} x2={cx + 85} y2={cy - 10} />
            </g>
            {/* Nodes */}
            <circle cx={cx - 55} cy={cy - 28} r="3" fill="#22d3ee" filter={`url(#${pfx}-glow)`} />
            <circle cx={cx + 55} cy={cy - 28} r="3" fill="#c084fc" filter={`url(#${pfx}-glow)`} />
            <circle cx={cx - 65} cy={cy + 18} r="2.5" fill="#818cf8" />
            <circle cx={cx + 65} cy={cy + 18} r="2.5" fill="#22d3ee" />
            <circle cx={cx - 85} cy={cy - 10} r="2" fill="#c084fc" opacity="0.8" />
            <circle cx={cx + 85} cy={cy - 10} r="2" fill="#38bdf8" opacity="0.8" />
            {/* Central multifaceted cognitive crystal */}
            <g filter={`url(#${pfx}-glow)`}>
              <polygon points={`${cx},${cy - 28} ${cx + 22},${cy - 8} ${cx},${cy + 24} ${cx - 22},${cy - 8}`} fill={`url(#${pfx}-g1)`} fillOpacity="0.4" stroke="#e0e7ff" strokeWidth="1.2" />
              <polygon points={`${cx},${cy - 28} ${cx + 22},${cy - 8} ${cx},${cy + 4}`} fill="#c084fc" fillOpacity="0.3" stroke="#c084fc" strokeWidth="0.8" />
              <polygon points={`${cx},${cy - 28} ${cx - 22},${cy - 8} ${cx},${cy + 4}`} fill="#38bdf8" fillOpacity="0.35" stroke="#38bdf8" strokeWidth="0.8" />
              <polygon points={`${cx - 22},${cy - 8} ${cx},${cy + 4} ${cx},${cy + 24}`} fill="#818cf8" fillOpacity="0.4" stroke="#818cf8" strokeWidth="0.8" />
              <polygon points={`${cx + 22},${cy - 8} ${cx},${cy + 4} ${cx},${cy + 24}`} fill="#67e8f9" fillOpacity="0.4" stroke="#67e8f9" strokeWidth="0.8" />
              <circle cx={cx} cy={cy} r="3.5" fill="#ffffff" />
            </g>
          </>
        );

      // 2. THE FRIENDSHIP TEST (Twin Soul Orbit & Luminous Intertwined Rings)
      case "emotional-availability-reflection":
        return (
          <>
            <defs>
              <linearGradient id={`${pfx}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <linearGradient id={`${pfx}-rose`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fda4af" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
              <radialGradient id={`${pfx}-halo`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.7" />
                <stop offset="40%" stopColor="#f43f5e" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#08060a" stopOpacity="0" />
              </radialGradient>
              <filter id={`${pfx}-glow`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle cx={cx} cy={cy} r="46" fill={`url(#${pfx}-halo)`} />
            {/* Harmonic resonance ripples */}
            <circle cx={cx} cy={cy} r="54" stroke="#f59e0b" strokeWidth="0.6" strokeDasharray="3 4" opacity="0.3" />
            {/* Left warm ring */}
            <ellipse cx={cx - 18} cy={cy} rx="30" ry="24" transform={`rotate(-15 ${cx - 18} ${cy})`} fill="none" stroke={`url(#${pfx}-gold)`} strokeWidth="2.4" filter={`url(#${pfx}-glow)`} opacity="0.85" />
            {/* Right rose ring */}
            <ellipse cx={cx + 18} cy={cy} rx="30" ry="24" transform={`rotate(15 ${cx + 18} ${cy})`} fill="none" stroke={`url(#${pfx}-rose)`} strokeWidth="2.4" filter={`url(#${pfx}-glow)`} opacity="0.85" />
            {/* Harmonizing center spark */}
            <circle cx={cx} cy={cy} r="5" fill="#fffbeb" filter={`url(#${pfx}-glow)`} />
            {/* Flowing connection arcs */}
            <path d={`M${cx - 42} ${cy + 14} Q${cx} ${cy + 34} ${cx + 42} ${cy + 14}`} fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
            <path d={`M${cx - 42} ${cy - 14} Q${cx} ${cy - 34} ${cx + 42} ${cy - 14}`} fill="none" stroke="#fda4af" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
          </>
        );

      // 3. THE LOVE COMPATIBILITY TEST (Magnetic Pulsing Twin Hearts & Orbit Trajectories)
      case "attachment-style-discovery":
        return (
          <>
            <defs>
              <linearGradient id={`${pfx}-h1`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
              <linearGradient id={`${pfx}-h2`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
              <filter id={`${pfx}-glow`}>
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Magnetic orbit paths */}
            <ellipse cx={cx} cy={cy} rx="65" ry="24" transform={`rotate(-12 ${cx} ${cy})`} fill="none" stroke="#e11d48" strokeWidth="1" strokeDasharray="4 4" opacity="0.45" />
            <ellipse cx={cx} cy={cy} rx="65" ry="24" transform={`rotate(12 ${cx} ${cy})`} fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 4" opacity="0.45" />
            {/* Central attraction flare */}
            <circle cx={cx} cy={cy} r="18" fill="#f43f5e" fillOpacity="0.18" />
            <circle cx={cx} cy={cy} r="3" fill="#ffffff" filter={`url(#${pfx}-glow)`} />
            {/* Left heart */}
            <g transform={`translate(${cx - 36}, ${cy - 8}) scale(0.7)`} filter={`url(#${pfx}-glow)`}>
              <path d="M0 14 C-16 -6, -30 10, 0 34 C30 10, 16 -6, 0 14 Z" fill={`url(#${pfx}-h1)`} fillOpacity="0.8" stroke="#fecdd3" strokeWidth="1.2" />
            </g>
            {/* Right heart */}
            <g transform={`translate(${cx + 36}, ${cy - 8}) scale(0.7)`} filter={`url(#${pfx}-glow)`}>
              <path d="M0 14 C-16 -6, -30 10, 0 34 C30 10, 16 -6, 0 14 Z" fill={`url(#${pfx}-h2)`} fillOpacity="0.8" stroke="#e9d5ff" strokeWidth="1.2" />
            </g>
            {/* Dynamic magnetic lines */}
            <path d={`M${cx - 20} ${cy - 6} C${cx - 6} ${cy - 18}, ${cx + 6} ${cy - 18}, ${cx + 20} ${cy - 6}`} fill="none" stroke="#f43f5e" strokeWidth="1.4" opacity="0.7" />
            <path d={`M${cx - 20} ${cy + 6} C${cx - 6} ${cy + 18}, ${cx + 6} ${cy + 18}, ${cx + 20} ${cy + 6}`} fill="none" stroke="#a855f7" strokeWidth="1.4" opacity="0.7" />
          </>
        );

      // 4. THE LOVE LANGUAGE TEST (The 5-Flame Prismatic Heart)
      case "love-affection-preferences":
        return (
          <>
            <defs>
              <linearGradient id={`${pfx}-f1`} x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" /><stop offset="100%" stopColor="#fda4af" />
              </linearGradient>
              <linearGradient id={`${pfx}-f2`} x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#fef08a" />
              </linearGradient>
              <linearGradient id={`${pfx}-f3`} x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#e9d5ff" />
              </linearGradient>
              <linearGradient id={`${pfx}-f4`} x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#a5f3fc" />
              </linearGradient>
              <linearGradient id={`${pfx}-heart`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" /><stop offset="100%" stopColor="#be123c" />
              </linearGradient>
              <filter id={`${pfx}-glow`}>
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* 5 Radiating light rays / language beams */}
            <g opacity="0.65" filter={`url(#${pfx}-glow)`}>
              <path d={`M${cx} ${cy + 8} L${cx - 62} ${cy - 34}`} stroke={`url(#${pfx}-f4)`} strokeWidth="1.8" />
              <path d={`M${cx} ${cy + 8} L${cx - 32} ${cy - 44}`} stroke={`url(#${pfx}-f1)`} strokeWidth="2" />
              <path d={`M${cx} ${cy + 8} L${cx} ${cy - 48}`} stroke={`url(#${pfx}-f2)`} strokeWidth="2.2" />
              <path d={`M${cx} ${cy + 8} L${cx + 32} ${cy - 44}`} stroke={`url(#${pfx}-f1)`} strokeWidth="2" />
              <path d={`M${cx} ${cy + 8} L${cx + 62} ${cy - 34}`} stroke={`url(#${pfx}-f3)`} strokeWidth="1.8" />
            </g>
            {/* Embers at tip of each beam */}
            <circle cx={cx - 62} cy={cy - 34} r="3" fill="#22d3ee" filter={`url(#${pfx}-glow)`} />
            <circle cx={cx - 32} cy={cy - 44} r="3.5" fill="#fb7185" filter={`url(#${pfx}-glow)`} />
            <circle cx={cx} cy={cy - 48} r="4" fill="#fde047" filter={`url(#${pfx}-glow)`} />
            <circle cx={cx + 32} cy={cy - 44} r="3.5" fill="#fb7185" filter={`url(#${pfx}-glow)`} />
            <circle cx={cx + 62} cy={cy - 34} r="3" fill="#c084fc" filter={`url(#${pfx}-glow)`} />
            {/* Central multifaceted origami heart */}
            <g transform={`translate(${cx}, ${cy - 6}) scale(0.85)`} filter={`url(#${pfx}-glow)`}>
              <path d="M0 8 C-18 -12, -32 6, 0 32 C32 6, 18 -12, 0 8 Z" fill={`url(#${pfx}-heart)`} fillOpacity="0.85" stroke="#ffe4e6" strokeWidth="1.4" />
              {/* Internal gem facets */}
              <path d="M0 8 L-14 16 L0 32 L14 16 Z" fill="#ffffff" fillOpacity="0.2" stroke="#fecdd3" strokeWidth="0.8" />
              <line x1="0" y1="8" x2="0" y2="32" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
            </g>
          </>
        );

      // 5. THE FIGHT TEST (Thunderbolt Clashing Into Serene Ripple Wave)
      case "conflict-communication-personality":
        return (
          <>
            <defs>
              <linearGradient id={`${pfx}-bolt`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" /><stop offset="100%" stopColor="#c026d3" />
              </linearGradient>
              <linearGradient id={`${pfx}-wave`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
              <filter id={`${pfx}-glow`}>
                <feGaussianBlur stdDeviation="3.5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Clashing lightning bolt on left */}
            <path d={`M${cx - 70} ${cy - 36} L${cx - 36} ${cy - 6} L${cx - 48} ${cy - 4} L${cx - 16} ${cy + 34} L${cx - 26} ${cy + 6} L${cx - 14} ${cy + 8} L${cx - 4} ${cy - 12}`} fill="none" stroke={`url(#${pfx}-bolt)`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${pfx}-glow)`} />
            {/* Serene water ripples on right */}
            <g stroke={`url(#${pfx}-wave)`} fill="none" filter={`url(#${pfx}-glow)`}>
              <path d={`M${cx + 10} ${cy - 28} C${cx + 34} ${cy - 20}, ${cx + 56} ${cy - 36}, ${cx + 74} ${cy - 24}`} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              <path d={`M${cx + 4} ${cy - 8} C${cx + 28} ${cy}, ${cx + 52} ${cy - 16}, ${cx + 78} ${cy - 4}`} strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
              <path d={`M${cx + 8} ${cy + 14} C${cx + 32} ${cy + 22}, ${cx + 54} ${cy + 6}, ${cx + 76} ${cy + 18}`} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              <path d={`M${cx + 14} ${cy + 32} C${cx + 36} ${cy + 40}, ${cx + 58} ${cy + 26}, ${cx + 74} ${cy + 36}`} strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
            </g>
            {/* Center fusion orb */}
            <circle cx={cx} cy={cy} r="14" fill="#a855f7" fillOpacity="0.25" />
            <circle cx={cx} cy={cy} r="5" fill="#ffffff" filter={`url(#${pfx}-glow)`} />
          </>
        );

      // 6. THE ICKS TEST (The Thorny Neon Rose & Sacred Boundary Aegis)
      case "relationship-dealbreakers-boundaries":
        return (
          <>
            <defs>
              <linearGradient id={`${pfx}-shield`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#be123c" />
              </linearGradient>
              <linearGradient id={`${pfx}-rose`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fda4af" /><stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
              <filter id={`${pfx}-glow`}>
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Aegis boundary shield outline */}
            <path d={`M${cx} ${cy - 36} Q${cx + 38} ${cy - 36} ${cx + 38} ${cy - 6} Q${cx + 38} ${cy + 26} ${cx} ${cy + 42} Q${cx - 38} ${cy + 26} ${cx - 38} ${cy - 6} Q${cx - 38} ${cy - 36} ${cx} ${cy - 36} Z`} fill={`url(#${pfx}-shield)`} fillOpacity="0.25" stroke="#a855f7" strokeWidth="1.5" filter={`url(#${pfx}-glow)`} />
            {/* Thorny vine wrapping around left edge */}
            <path d={`M${cx - 46} ${cy + 34} Q${cx - 42} ${cy + 10} ${cx - 38} ${cy - 8} Q${cx - 32} ${cy - 28} ${cx - 14} ${cy - 38}`} fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
            {/* Thorns */}
            <path d={`M${cx - 44} ${cy + 22} L${cx - 52} ${cy + 18}`} stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
            <path d={`M${cx - 40} ${cy + 4} L${cx - 48} ${cy + 2}`} stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
            <path d={`M${cx - 34} ${cy - 16} L${cx - 42} ${cy - 20}`} stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
            {/* Central luminous sacred rose blossom */}
            <g transform={`translate(${cx}, ${cy - 2}) scale(0.75)`} filter={`url(#${pfx}-glow)`}>
              <circle cx="0" cy="0" r="16" fill={`url(#${pfx}-rose)`} opacity="0.4" />
              <path d="M-10 -4 C-6 -14, 6 -14, 10 -4 C14 6, -14 16, -10 -4 Z" fill="none" stroke="#fecdd3" strokeWidth="1.5" />
              <path d="M-6 -2 C-3 -9, 3 -9, 6 -2 C9 5, -9 11, -6 -2 Z" fill="none" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="3" fill="#ffffff" />
            </g>
          </>
        );

      // 7. THE SEXUAL DESIRE TEST (Rising Erotic Flame & Sensual Heat Silhouette)
      case "intimacy-partner-preferences":
        return (
          <>
            <defs>
              <linearGradient id={`${pfx}-flame1`} x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#be123c" /><stop offset="50%" stopColor="#f43f5e" /><stop offset="100%" stopColor="#fde047" />
              </linearGradient>
              <linearGradient id={`${pfx}-flame2`} x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#581c87" /><stop offset="50%" stopColor="#c026d3" /><stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
              <radialGradient id={`${pfx}-glow-rad`} cx="50%" cy="80%" r="60%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.6" /><stop offset="100%" stopColor="#08060a" stopOpacity="0" />
              </radialGradient>
              <filter id={`${pfx}-glow`}>
                <feGaussianBlur stdDeviation="3.5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <circle cx={cx} cy={cy + 10} r="50" fill={`url(#${pfx}-glow-rad)`} />
            {/* Left sensual flame ribbon */}
            <path d={`M${cx} ${cy + 38} C${cx - 42} ${cy + 24}, ${cx - 36} ${cy - 12}, ${cx - 8} ${cy - 24} C${cx - 24} ${cy - 6}, ${cx - 18} ${cy + 16}, ${cx} ${cy + 38} Z`} fill={`url(#${pfx}-flame2)`} opacity="0.8" filter={`url(#${pfx}-glow)`} />
            {/* Right sensual flame ribbon */}
            <path d={`M${cx} ${cy + 38} C${cx + 42} ${cy + 24}, ${cx + 36} ${cy - 12}, ${cx + 8} ${cy - 24} C${cx + 24} ${cy - 6}, ${cx + 18} ${cy + 16}, ${cx} ${cy + 38} Z`} fill={`url(#${pfx}-flame1)`} opacity="0.8" filter={`url(#${pfx}-glow)`} />
            {/* Core rising soul flame tongue */}
            <path d={`M${cx} ${cy + 32} C${cx - 16} ${cy + 10}, ${cx - 10} ${cy - 26}, ${cx} ${cy - 44} C${cx + 10} ${cy - 26}, ${cx + 16} ${cy + 10}, ${cx} ${cy + 32} Z`} fill={`url(#${pfx}-flame1)`} filter={`url(#${pfx}-glow)`} />
            {/* Hot white ember center */}
            <ellipse cx={cx} cy={cy + 12} rx="6" ry="14" fill="#fffbeb" filter={`url(#${pfx}-glow)`} />
            {/* Floating heat spark embers */}
            <circle cx={cx - 18} cy={cy - 28} r="1.8" fill="#fde047" />
            <circle cx={cx + 22} cy={cy - 24} r="2" fill="#fb7185" />
            <circle cx={cx + 6} cy={cy - 48} r="1.5" fill="#ffffff" />
          </>
        );

      // 8. THE KINK & TABOO DESIRES TEST (Venetian Filigree Masquerade Mask)
      case "sexual-interests-curiosity-map":
        return (
          <>
            <defs>
              <linearGradient id={`${pfx}-mask`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7e22ce" /><stop offset="50%" stopColor="#3b0764" /><stop offset="100%" stopColor="#be123c" />
              </linearGradient>
              <linearGradient id={`${pfx}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" /><stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <filter id={`${pfx}-glow`}>
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Mystical smoke wisps behind */}
            <path d={`M${cx - 65} ${cy + 20} C${cx - 40} ${cy - 30}, ${cx + 10} ${cy - 40}, ${cx + 55} ${cy - 25}`} fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" />
            {/* Ornate mask body */}
            <g filter={`url(#${pfx}-glow)`}>
              <path d={`M${cx} ${cy - 8} C${cx - 20} ${cy - 24}, ${cx - 64} ${cy - 24}, ${cx - 68} ${cy - 2} C${cx - 72} ${cy + 18}, ${cx - 40} ${cy + 26}, ${cx - 18} ${cy + 16} C${cx - 8} ${cy + 12}, ${cx} ${cy + 20}, ${cx} ${cy + 20} C${cx} ${cy + 20}, ${cx + 8} ${cy + 12}, ${cx + 18} ${cy + 16} C${cx + 40} ${cy + 26}, ${cx + 72} ${cy + 18}, ${cx + 68} ${cy - 2} C${cx + 64} ${cy - 24}, ${cx + 20} ${cy - 24}, ${cx} ${cy - 8} Z`} fill={`url(#${pfx}-mask)`} stroke={`url(#${pfx}-gold)`} strokeWidth="1.5" />
              {/* Sultry eye cutouts */}
              <path d={`M${cx - 48} ${cy + 2} Q${cx - 32} ${cy - 12} ${cx - 18} ${cy + 4} Q${cx - 32} ${cy + 14} ${cx - 48} ${cy + 2} Z`} fill="#08060a" stroke={`url(#${pfx}-gold)`} strokeWidth="1.2" />
              <path d={`M${cx + 48} ${cy + 2} Q${cx + 32} ${cy - 12} ${cx + 18} ${cy + 4} Q${cx + 32} ${cy + 14} ${cx + 48} ${cy + 2} Z`} fill="#08060a" stroke={`url(#${pfx}-gold)`} strokeWidth="1.2" />
              {/* Forehead jewel crest */}
              <circle cx={cx} cy={cy - 14} r="3" fill="#fde047" />
              <circle cx={cx} cy={cy - 14} r="1.5" fill="#ffffff" />
            </g>
          </>
        );

      // 9. THE BDSM & BONDAGE TEST (Shibari Diamond Harness & Velvet Leather Collar)
      case "bdsm-power-dynamics-test":
        return (
          <>
            <defs>
              <linearGradient id={`${pfx}-rope`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" /><stop offset="60%" stopColor="#d97706" /><stop offset="100%" stopColor="#78350f" />
              </linearGradient>
              <linearGradient id={`${pfx}-ring`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" /><stop offset="40%" stopColor="#94a3b8" /><stop offset="100%" stopColor="#334155" />
              </linearGradient>
              <filter id={`${pfx}-glow`}>
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Shibari tension diamond weave lines */}
            <g stroke={`url(#${pfx}-rope)`} strokeWidth="2.2" strokeLinecap="round" filter={`url(#${pfx}-glow)`}>
              {/* Outer diamond */}
              <line x1={cx} y1={cy - 44} x2={cx + 62} y2={cy} />
              <line x1={cx + 62} y1={cy} x2={cx} y2={cy + 44} />
              <line x1={cx} y1={cy + 44} x2={cx - 62} y2={cy} />
              <line x1={cx - 62} y1={cy} x2={cx} y2={cy - 44} />
              {/* Inner diagonal cross weave */}
              <line x1={cx - 44} y1={cy - 22} x2={cx + 44} y2={cy + 22} strokeWidth="1.6" opacity="0.8" />
              <line x1={cx - 44} y1={cy + 22} x2={cx + 44} y2={cy - 22} strokeWidth="1.6" opacity="0.8" />
            </g>
            {/* Knot ties at points */}
            <circle cx={cx - 62} cy={cy} r="4" fill="#d97706" />
            <circle cx={cx + 62} cy={cy} r="4" fill="#d97706" />
            <circle cx={cx} cy={cy - 44} r="4" fill="#d97706" />
            <circle cx={cx} cy={cy + 44} r="4" fill="#d97706" />
            {/* Central polished chrome O-ring */}
            <circle cx={cx} cy={cy} r="15" fill="#09070f" stroke={`url(#${pfx}-ring)`} strokeWidth="3" filter={`url(#${pfx}-glow)`} />
            <circle cx={cx} cy={cy} r="11" fill="none" stroke="#e2e8f0" strokeWidth="0.8" opacity="0.6" />
            <circle cx={cx + 6} cy={cy - 6} r="2" fill="#ffffff" />
          </>
        );

      // 10. THE FANTASY VS. REALITY SEX TEST (Dual Crescent Eclipse & Mirrored Ripples)
      case "desire-reality-map":
        return (
          <>
            <defs>
              <linearGradient id={`${pfx}-moon`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" /><stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
              <linearGradient id={`${pfx}-water`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <filter id={`${pfx}-glow`}>
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Horizon dividing line */}
            <line x1={cx - 85} y1={cy} x2={cx + 85} y2={cy} stroke="#475569" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />
            {/* Upper realm (Fantasy Moon) */}
            <g filter={`url(#${pfx}-glow)`}>
              <path d={`M${cx - 10} ${cy - 44} A26 26 0 0 0 ${cx - 10} ${cy - 4} A20 20 0 0 1 ${cx - 10} ${cy - 44} Z`} fill={`url(#${pfx}-moon)`} opacity="0.9" />
              {/* Stars in fantasy sky */}
              <circle cx={cx + 28} cy={cy - 34} r="1.5" fill="#e9d5ff" />
              <circle cx={cx + 48} cy={cy - 20} r="2" fill="#ffffff" />
              <circle cx={cx - 44} cy={cy - 24} r="1.5" fill="#c084fc" />
            </g>
            {/* Lower realm (Reality Water Reflection) */}
            <g stroke={`url(#${pfx}-water)`} strokeWidth="1.5" opacity="0.75" filter={`url(#${pfx}-glow)`}>
              <path d={`M${cx - 24} ${cy + 8} Q${cx} ${cy + 12} ${cx + 24} ${cy + 8}`} />
              <path d={`M${cx - 36} ${cy + 18} Q${cx - 6} ${cy + 24} ${cx + 36} ${cy + 18}`} strokeWidth="1.8" />
              <path d={`M${cx - 48} ${cy + 28} Q${cx} ${cy + 34} ${cx + 48} ${cy + 28}`} strokeWidth="1.5" />
              <path d={`M${cx - 30} ${cy + 38} Q${cx + 8} ${cy + 42} ${cx + 30} ${cy + 38}`} strokeWidth="1.2" />
            </g>
          </>
        );

      // 11. THE SECRET SEX FANTASIES TEST (Ornate Skeleton Key & Whispering Keyhole)
      case "fantasy-catalog":
        return (
          <>
            <defs>
              <linearGradient id={`${pfx}-key`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" /><stop offset="60%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <linearGradient id={`${pfx}-beam`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" /><stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <filter id={`${pfx}-glow`}>
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Beams emanating from radiant keyhole */}
            <polygon points={`${cx - 28},${cy} ${cx - 85},${cy - 35} ${cx - 85},${cy + 35}`} fill={`url(#${pfx}-beam)`} fillOpacity="0.2" />
            {/* Radiant Keyhole on left */}
            <g filter={`url(#${pfx}-glow)`}>
              <path d={`M${cx - 28} ${cy - 8} A8 8 0 1 0 ${cx - 20} ${cy - 8} L${cx - 21} ${cy + 12} L${cx - 27} ${cy + 12} Z`} fill="#fbbf24" stroke="#fef08a" strokeWidth="1" />
            </g>
            {/* Ornate Skeleton Key entering from right */}
            <g filter={`url(#${pfx}-glow)`} transform={`rotate(-15 ${cx + 30} ${cy})`}>
              {/* Shaft */}
              <line x1={cx - 10} y1={cy} x2={cx + 52} y2={cy} stroke={`url(#${pfx}-key)`} strokeWidth="3" strokeLinecap="round" />
              {/* Teeth */}
              <path d={`M${cx - 6} ${cy} L${cx - 6} ${cy + 10} L${cx} ${cy + 10} L${cx} ${cy} L${cx + 8} ${cy} L${cx + 8} ${cy + 7} L${cx + 12} ${cy + 7} L${cx + 12} ${cy}`} stroke={`url(#${pfx}-key)`} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* Ornate Heart Bow */}
              <circle cx={cx + 62} cy={cy} r="12" fill="none" stroke={`url(#${pfx}-key)`} strokeWidth="2.5" />
              <circle cx={cx + 62} cy={cy} r="5" fill="#fde047" opacity="0.6" />
            </g>
          </>
        );

      // 12. THE AFTERCARE TEST (Velvet Cocoon & Protective Feather Wings)
      case "aftercare-recovery-style":
        return (
          <>
            <defs>
              <linearGradient id={`${pfx}-wing`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" /><stop offset="50%" stopColor="#059669" /><stop offset="100%" stopColor="#047857" />
              </linearGradient>
              <radialGradient id={`${pfx}-orb`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" /><stop offset="60%" stopColor="#fda4af" /><stop offset="100%" stopColor="#08060a" stopOpacity="0" />
              </radialGradient>
              <filter id={`${pfx}-glow`}>
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Warm reassuring soul aura in center */}
            <circle cx={cx} cy={cy} r="40" fill={`url(#${pfx}-orb)`} opacity="0.65" />
            {/* Left curved wing embracing */}
            <path d={`M${cx} ${cy + 36} C${cx - 48} ${cy + 36}, ${cx - 72} ${cy}, ${cx - 52} ${cy - 34} C${cx - 36} ${cy - 14}, ${cx - 24} ${cy + 16}, ${cx} ${cy + 36} Z`} fill={`url(#${pfx}-wing)`} fillOpacity="0.45" stroke="#6ee7b7" strokeWidth="1.5" filter={`url(#${pfx}-glow)`} />
            {/* Left wing internal feather veins */}
            <path d={`M${cx - 44} ${cy - 18} Q${cx - 32} ${cy + 4} ${cx - 10} ${cy + 24}`} stroke="#a7f3d0" strokeWidth="1" fill="none" opacity="0.6" />
            {/* Right curved wing embracing */}
            <path d={`M${cx} ${cy + 36} C${cx + 48} ${cy + 36}, ${cx + 72} ${cy}, ${cx + 52} ${cy - 34} C${cx + 36} ${cy - 14}, ${cx + 24} ${cy + 16}, ${cx} ${cy + 36} Z`} fill={`url(#${pfx}-wing)`} fillOpacity="0.45" stroke="#6ee7b7" strokeWidth="1.5" filter={`url(#${pfx}-glow)`} />
            {/* Right wing internal feather veins */}
            <path d={`M${cx + 44} ${cy - 18} Q${cx + 32} ${cy + 4} ${cx + 10} ${cy + 24}`} stroke="#a7f3d0" strokeWidth="1" fill="none" opacity="0.6" />
            {/* Gentle heart-pulsing center sphere */}
            <circle cx={cx} cy={cy + 8} r="10" fill="#fef08a" filter={`url(#${pfx}-glow)`} />
            <circle cx={cx} cy={cy + 8} r="4" fill="#ffffff" />
          </>
        );

      // 13. THE DIRTY TALK & MOANING TEST (Neon Sensual Lips & Sonic Desire Waveforms)
      case "communication-language-profile":
        return (
          <>
            <defs>
              <linearGradient id={`${pfx}-lips`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" /><stop offset="60%" stopColor="#e11d48" /><stop offset="100%" stopColor="#881337" />
              </linearGradient>
              <linearGradient id={`${pfx}-sound`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
              <filter id={`${pfx}-glow`}>
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Soundwave frequency ribbons billowing from lips */}
            <g stroke={`url(#${pfx}-sound)`} strokeWidth="1.6" fill="none" filter={`url(#${pfx}-glow)`} opacity="0.8">
              <path d={`M${cx + 32} ${cy - 12} Q${cx + 55} ${cy - 28} ${cx + 80} ${cy - 10}`} />
              <path d={`M${cx + 36} ${cy} Q${cx + 60} ${cy} ${cx + 84} ${cy}`} strokeWidth="2.2" />
              <path d={`M${cx + 32} ${cy + 12} Q${cx + 55} ${cy + 28} ${cx + 80} ${cy + 10}`} />
              <path d={`M${cx - 32} ${cy - 12} Q${cx - 55} ${cy - 28} ${cx - 80} ${cy - 10}`} />
              <path d={`M${cx - 36} ${cy} Q${cx - 60} ${cy} ${cx - 84} ${cy}`} strokeWidth="2.2" />
              <path d={`M${cx - 32} ${cy + 12} Q${cx - 55} ${cy + 28} ${cx - 80} ${cy + 10}`} />
            </g>
            {/* Sultry Parted Lips */}
            <g filter={`url(#${pfx}-glow)`}>
              {/* Upper lip */}
              <path d={`M${cx - 32} ${cy} C${cx - 16} ${cy - 16}, ${cx - 6} ${cy - 12}, ${cx} ${cy - 6} C${cx + 6} ${cy - 12}, ${cx + 16} ${cy - 16}, ${cx + 32} ${cy} C${cx + 16} ${cy - 4}, ${cx} ${cy + 2}, ${cx - 32} ${cy} Z`} fill={`url(#${pfx}-lips)`} stroke="#fda4af" strokeWidth="1.2" />
              {/* Lower lip */}
              <path d={`M${cx - 32} ${cy + 1} C${cx - 18} ${cy + 6}, ${cx} ${cy + 6}, ${cx + 32} ${cy + 1} C${cx + 18} ${cy + 20}, ${cx - 18} ${cy + 20}, ${cx - 32} ${cy + 1} Z`} fill={`url(#${pfx}-lips)`} stroke="#fda4af" strokeWidth="1.2" />
              {/* Inner mouth darkness */}
              <ellipse cx={cx} cy={cy + 3} rx="16" ry="3.5" fill="#18040a" />
              {/* Gloss highlights */}
              <ellipse cx={cx - 8} cy={cy + 12} rx="6" ry="2" fill="#ffffff" opacity="0.6" />
            </g>
          </>
        );

      // 14. THE SEX TOY TEST (Holographic Pleasure Curve & Sonic Pulse Wave)
      case "toys-tools-gear-preferences":
        return (
          <>
            <defs>
              <linearGradient id={`${pfx}-toy`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" /><stop offset="60%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id={`${pfx}-pulse`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
              <filter id={`${pfx}-glow`}>
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Concentric vibration pulse rings */}
            <g stroke={`url(#${pfx}-pulse)`} fill="none" opacity="0.65" filter={`url(#${pfx}-glow)`}>
              <ellipse cx={cx + 34} cy={cy - 12} rx="20" ry="14" transform={`rotate(-25 ${cx + 34} ${cy - 12})`} strokeWidth="1.2" strokeDasharray="3 3" />
              <ellipse cx={cx + 34} cy={cy - 12} rx="34" ry="22" transform={`rotate(-25 ${cx + 34} ${cy - 12})`} strokeWidth="1" strokeDasharray="4 4" />
              <ellipse cx={cx + 34} cy={cy - 12} rx="48" ry="30" transform={`rotate(-25 ${cx + 34} ${cy - 12})`} strokeWidth="0.8" strokeDasharray="5 5" opacity="0.4" />
            </g>
            {/* Sleek ergonomic silicone curve */}
            <g filter={`url(#${pfx}-glow)`}>
              <path d={`M${cx - 52} ${cy + 24} C${cx - 24} ${cy + 34}, ${cx} ${cy + 18}, ${cx + 24} ${cy} C${cx + 38} ${cy - 12}, ${cx + 44} ${cy - 24}, ${cx + 34} ${cy - 28} C${cx + 22} ${cy - 30}, ${cx + 14} ${cy - 16}, ${cx + 6} ${cy - 6} C${cx - 14} ${cy + 8}, ${cx - 36} ${cy + 14}, ${cx - 48} ${cy + 6} Z`} fill={`url(#${pfx}-toy)`} stroke="#fbcfe8" strokeWidth="1.5" />
              {/* Chrome accent ring */}
              <ellipse cx={cx - 18} cy={cy + 16} rx="6" ry="12" transform={`rotate(40 ${cx - 18} ${cy + 16})`} fill="none" stroke="#ffffff" strokeWidth="2" />
            </g>
          </>
        );

      // 15. THE PARTNER FINDING TEST (Celestial Lover's Astrolabe & Twin Constellation)
      case "partner-ideal-dealbreakers":
        return (
          <>
            <defs>
              <linearGradient id={`${pfx}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" /><stop offset="60%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id={`${pfx}-star`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
              <filter id={`${pfx}-glow`}>
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Celestial navigation dial */}
            <circle cx={cx} cy={cy} r="44" fill="none" stroke={`url(#${pfx}-gold)`} strokeWidth="1.4" opacity="0.6" />
            <circle cx={cx} cy={cy} r="36" fill="none" stroke="#fef08a" strokeWidth="0.8" strokeDasharray="2 4" opacity="0.4" />
            {/* Compass crosshairs */}
            <line x1={cx} y1={cy - 50} x2={cx} y2={cy + 50} stroke="#f59e0b" strokeWidth="0.8" opacity="0.5" />
            <line x1={cx - 60} y1={cy} x2={cx + 60} y2={cy} stroke="#f59e0b" strokeWidth="0.8" opacity="0.5" />
            {/* Twin needle pointer */}
            <polygon points={`${cx},${cy - 38} ${cx + 5},${cy} ${cx},${cy + 38} ${cx - 5},${cy}`} fill={`url(#${pfx}-gold)`} filter={`url(#${pfx}-glow)`} opacity="0.85" />
            <polygon points={`${cx - 38},${cy} ${cx},${cy - 5} ${cx + 38},${cy} ${cx},${cy + 5}`} fill={`url(#${pfx}-star)`} filter={`url(#${pfx}-glow)`} opacity="0.7" />
            {/* Twin star nexus at center */}
            <circle cx={cx} cy={cy} r="4" fill="#ffffff" filter={`url(#${pfx}-glow)`} />
            <circle cx={cx - 24} cy={cy - 20} r="2.5" fill="#38bdf8" filter={`url(#${pfx}-glow)`} />
            <circle cx={cx + 24} cy={cy + 20} r="2.5" fill="#f43f5e" filter={`url(#${pfx}-glow)`} />
            <line x1={cx - 24} y1={cy - 20} x2={cx + 24} y2={cy + 20} stroke="#ffffff" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />
          </>
        );

      // 16. THE THREESOME & WILD SEX TEST (Triad Prism & Interlocking Trinity Lights)
      case "group-multipartner-interest":
        return (
          <>
            <defs>
              <linearGradient id={`${pfx}-t1`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" /><stop offset="100%" stopColor="#fda4af" />
              </linearGradient>
              <linearGradient id={`${pfx}-t2`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#67e8f9" />
              </linearGradient>
              <linearGradient id={`${pfx}-t3`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#fef08a" />
              </linearGradient>
              <filter id={`${pfx}-glow`}>
                <feGaussianBlur stdDeviation="3.5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Trinity Knot / Triad Loops */}
            <g filter={`url(#${pfx}-glow)`}>
              {/* Loop 1 (Top Magenta) */}
              <circle cx={cx} cy={cy - 16} r="26" fill="none" stroke={`url(#${pfx}-t1)`} strokeWidth="2.2" opacity="0.85" />
              {/* Loop 2 (Bottom Left Cyan) */}
              <circle cx={cx - 20} cy={cy + 16} r="26" fill="none" stroke={`url(#${pfx}-t2)`} strokeWidth="2.2" opacity="0.85" />
              {/* Loop 3 (Bottom Right Amber) */}
              <circle cx={cx + 20} cy={cy + 16} r="26" fill="none" stroke={`url(#${pfx}-t3)`} strokeWidth="2.2" opacity="0.85" />
            </g>
            {/* Radiant core spark where all three converge */}
            <circle cx={cx} cy={cy + 4} r="6" fill="#ffffff" filter={`url(#${pfx}-glow)`} />
            {/* Wild electric sparks */}
            <circle cx={cx - 36} cy={cy - 20} r="2" fill="#f43f5e" />
            <circle cx={cx + 36} cy={cy - 20} r="2" fill="#fbbf24" />
            <circle cx={cx} cy={cy + 42} r="2" fill="#06b6d4" />
          </>
        );

      // 17. THE HUSBAND / WIFE TEST (Eternal Intertwined Infinity Bands & Sacred Hearth)
      case "long-term-dynamic-vision":
        return (
          <>
            <defs>
              <linearGradient id={`${pfx}-band1`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" /><stop offset="60%" stopColor="#d97706" /><stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <linearGradient id={`${pfx}-band2`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fda4af" /><stop offset="60%" stopColor="#e11d48" /><stop offset="100%" stopColor="#9f1239" />
              </linearGradient>
              <radialGradient id={`${pfx}-hearth`} cx="50%" cy="80%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" /><stop offset="100%" stopColor="#08060a" stopOpacity="0" />
              </radialGradient>
              <filter id={`${pfx}-glow`}>
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <circle cx={cx} cy={cy + 15} r="45" fill={`url(#${pfx}-hearth)`} />
            {/* Intertwined infinity figure 8 */}
            <g filter={`url(#${pfx}-glow)`}>
              {/* Left loop (Gold) */}
              <ellipse cx={cx - 22} cy={cy} rx="26" ry="18" transform={`rotate(-10 ${cx - 22} ${cy})`} fill="none" stroke={`url(#${pfx}-band1)`} strokeWidth="3" />
              {/* Right loop (Rose Gold) */}
              <ellipse cx={cx + 22} cy={cy} rx="26" ry="18" transform={`rotate(10 ${cx + 22} ${cy})`} fill="none" stroke={`url(#${pfx}-band2)`} strokeWidth="3" />
              {/* Specular highlights on rings */}
              <ellipse cx={cx - 36} cy={cy - 10} rx="6" ry="2" fill="#ffffff" opacity="0.75" />
              <ellipse cx={cx + 36} cy={cy - 10} rx="6" ry="2" fill="#ffffff" opacity="0.75" />
              {/* Center intertwining knot glow */}
              <circle cx={cx} cy={cy} r="4" fill="#fef08a" />
            </g>
          </>
        );

      // 18. THE SPICY WOULD YOU RATHER TEST (Glowing Desire Dice & Flaming Sparks)
      case "spicy-would-you-rather":
        return (
          <>
            <defs>
              <linearGradient id={`${pfx}-die1`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" /><stop offset="100%" stopColor="#be123c" />
              </linearGradient>
              <linearGradient id={`${pfx}-die2`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#6b21a8" />
              </linearGradient>
              <filter id={`${pfx}-glow`}>
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Dynamic fiery question mark spark */}
            <path d={`M${cx} ${cy - 44} Q${cx + 24} ${cy - 40} ${cx + 14} ${cy - 20} Q${cx} ${cy - 10} ${cx + 2} ${cy + 4}`} fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
            {/* Left Die (Isometric tilt) */}
            <g transform={`translate(${cx - 28}, ${cy - 6}) rotate(-12)`} filter={`url(#${pfx}-glow)`}>
              {/* Top face */}
              <polygon points="0,-18 16,-9 0,0 -16,-9" fill="#fb7185" stroke="#ffe4e6" strokeWidth="1" />
              {/* Left face */}
              <polygon points="-16,-9 0,0 0,18 -16,9" fill={`url(#${pfx}-die1)`} stroke="#ffe4e6" strokeWidth="1" />
              {/* Right face */}
              <polygon points="0,0 16,-9 16,9 0,18" fill="#9f1239" stroke="#ffe4e6" strokeWidth="1" />
              {/* Glowing Heart Pip on top face */}
              <circle cx="0" cy="-9" r="2.5" fill="#ffffff" />
            </g>
            {/* Right Die (Isometric tilt) */}
            <g transform={`translate(${cx + 28}, ${cy + 8}) rotate(16)`} filter={`url(#${pfx}-glow)`}>
              {/* Top face */}
              <polygon points="0,-18 16,-9 0,0 -16,-9" fill="#c084fc" stroke="#f3e8ff" strokeWidth="1" />
              {/* Left face */}
              <polygon points="-16,-9 0,0 0,18 -16,9" fill={`url(#${pfx}-die2)`} stroke="#f3e8ff" strokeWidth="1" />
              {/* Right face */}
              <polygon points="0,0 16,-9 16,9 0,18" fill="#581c87" stroke="#f3e8ff" strokeWidth="1" />
              {/* Glowing Fire Pip on top face */}
              <circle cx="0" cy="-9" r="2.5" fill="#fef08a" />
            </g>
            {/* Sparks tumbling off */}
            <circle cx={cx - 52} cy={cy + 16} r="2" fill="#f43f5e" />
            <circle cx={cx + 54} cy={cy - 18} r="2" fill="#a855f7" />
          </>
        );

      // 19. THE MASTER INTIMACY BLUEPRINT TEST (Sacred Erotic Mandala & Energy Chakras)
      case "personal-erotic-blueprint":
        return (
          <>
            <defs>
              <linearGradient id={`${pfx}-mandala`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" /><stop offset="35%" stopColor="#fbbf24" /><stop offset="70%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
              <filter id={`${pfx}-glow`}>
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Sacred geometry outer ring */}
            <circle cx={cx} cy={cy} r="48" fill="none" stroke={`url(#${pfx}-mandala)`} strokeWidth="1.2" opacity="0.6" />
            <circle cx={cx} cy={cy} r="38" fill="none" stroke="#fbbf24" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.4" />
            {/* Sacred 8-petal lotus matrix */}
            <g stroke={`url(#${pfx}-mandala)`} strokeWidth="1.2" fill="none" filter={`url(#${pfx}-glow)`} opacity="0.85">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <ellipse key={deg} cx={cx} cy={cy} rx="26" ry="10" transform={`rotate(${deg} ${cx} ${cy})`} />
              ))}
            </g>
            {/* Concentric Energy Chakras */}
            <circle cx={cx} cy={cy} r="14" fill="#08060a" stroke="#ffffff" strokeWidth="1" filter={`url(#${pfx}-glow)`} />
            <circle cx={cx} cy={cy} r="6" fill="#f43f5e" filter={`url(#${pfx}-glow)`} />
            <circle cx={cx} cy={cy} r="2" fill="#ffffff" />
          </>
        );

      // 20. THE EROTIC BLUEPRINT STYLE TEST (5-Pointed Prismatic Star & Elemental Essences)
      case "erotic-blueprint-style":
        return (
          <>
            <defs>
              <linearGradient id={`${pfx}-star`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" /><stop offset="25%" stopColor="#f59e0b" /><stop offset="50%" stopColor="#06b6d4" /><stop offset="75%" stopColor="#a855f7" /><stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <filter id={`${pfx}-glow`}>
                <feGaussianBlur stdDeviation="3.5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* 5 Elemental radiating orbits */}
            <circle cx={cx} cy={cy} r="46" fill="none" stroke={`url(#${pfx}-star)`} strokeWidth="1.2" strokeDasharray="4 4" opacity="0.5" />
            {/* 5-Pointed Star Prism (Sensual, Energetic, Sexual, Kinky, Shapeshifter) */}
            <g filter={`url(#${pfx}-glow)`}>
              <polygon
                points={`
                  ${cx},${cy - 40}
                  ${cx + 12},${cy - 12}
                  ${cx + 40},${cy - 12}
                  ${cx + 18},${cy + 8}
                  ${cx + 26},${cy + 36}
                  ${cx},${cy + 18}
                  ${cx - 26},${cy + 36}
                  ${cx - 18},${cy + 8}
                  ${cx - 40},${cy - 12}
                  ${cx - 12},${cy - 12}
                `}
                fill={`url(#${pfx}-star)`}
                fillOpacity="0.45"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              {/* 5 Archetype node orbs */}
              <circle cx={cx} cy={cy - 40} r="3.5" fill="#fda4af" /> {/* Sensual */}
              <circle cx={cx + 40} cy={cy - 12} r="3.5" fill="#67e8f9" /> {/* Energetic */}
              <circle cx={cx + 26} cy={cy + 36} r="3.5" fill="#f43f5e" /> {/* Sexual */}
              <circle cx={cx - 26} cy={cy + 36} r="3.5" fill="#fde047" /> {/* Kinky */}
              <circle cx={cx - 40} cy={cy - 12} r="3.5" fill="#c084fc" /> {/* Shapeshifter */}
              {/* Prismatic Center */}
              <circle cx={cx} cy={cy} r="5" fill="#ffffff" />
            </g>
          </>
        );

      // Category Fallbacks (if any unexpected slug)
      default: {
        const c1 = category === "personality" ? "#a855f7" : category === "compatibility" ? "#06b6d4" : "#f43f5e";
        const c2 = category === "personality" ? "#3b82f6" : category === "romance" ? "#fbbf24" : "#ec4899";
        return (
          <>
            <defs>
              <linearGradient id={`${pfx}-def`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
              </linearGradient>
              <filter id={`${pfx}-glow`}>
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <circle cx={cx} cy={cy} r="42" fill="none" stroke={`url(#${pfx}-def)`} strokeWidth="1.5" strokeDasharray="3 4" opacity="0.6" />
            <ellipse cx={cx} cy={cy} rx="30" ry="18" fill="none" stroke={c1} strokeWidth="2" filter={`url(#${pfx}-glow)`} opacity="0.8" />
            <circle cx={cx} cy={cy} r="6" fill="#ffffff" filter={`url(#${pfx}-glow)`} />
          </>
        );
      }
    }
  };

  return (
    <svg
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`test-card-illustration ${className}`}
      style={style}
    >
      {renderContent()}
    </svg>
  );
}
