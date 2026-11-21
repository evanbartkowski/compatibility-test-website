"use client";

import { useId, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Hand,
  Pause,
  Play,
} from "lucide-react";
import { useCanvasScene, type SceneDraw } from "./useCanvasScene";

export interface ProfileExample {
  archetype: string;
  tagline: string;
  answered: number;
  dimensions: Array<{
    key: string;
    label: string;
    shortLabel?: string;
    score: number;
  }>;
}
const initialView = { yaw: -0.35, pitch: 0.22 };

export function HomeResultPreview({
  example,
  partner,
  moving = false,
  onMotionChange,
}: {
  example: ProfileExample;
  partner: ProfileExample;
  moving?: boolean;
  onMotionChange?: (moving: boolean) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null),
    angles = useRef({ ...initialView });
  const previousTime = useRef(0);
  const drag = useRef<{
    x: number;
    y: number;
    yaw: number;
    pitch: number;
    id: number;
  } | null>(null);
  const [view, setView] = useState(initialView),
    [selected, setSelected] = useState(0),
    [comparison, setComparison] = useState(false);
  const [scores, setScores] = useState(example.dimensions.map((d) => d.score)),
    [localMoving, setLocalMoving] = useState(false);
  const enabled = onMotionChange ? moving : localMoving,
    hintId = useId();
  const rotate = (yaw: number, pitch: number) => {
    angles.current = { yaw, pitch: Math.max(-1.1, Math.min(1.1, pitch)) };
    setView({ ...angles.current });
  };
  const draw: SceneDraw = (ctx, width, height, time, palette) => {
    const radius = Math.min(width * 0.35, height * 0.37),
      cx = width / 2,
      cy = height / 2;

    if (enabled && !drag.current) {
      angles.current.yaw +=
        Math.max(0, Math.min(time - previousTime.current, 0.05)) * 0.16;
    }
    previousTime.current = time;

    const yaw = angles.current.yaw,
      pitch = angles.current.pitch;

    const project = (x: number, y: number, z: number) => {
      const rx = x * Math.cos(yaw) + z * Math.sin(yaw),
        rz = z * Math.cos(yaw) - x * Math.sin(yaw);
      const ry = y * Math.cos(pitch) - rz * Math.sin(pitch),
        depth = rz * Math.cos(pitch) + y * Math.sin(pitch),
        perspective = 3.6 / (3.6 + depth);
      return {
        x: cx + rx * radius * perspective,
        y: cy + ry * radius * perspective,
        depth,
        perspective,
      };
    };

    // 1. Ambient erotic halo glow behind the crystal
    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.6);
    halo.addColorStop(0, palette.dark ? "rgba(225, 29, 72, 0.18)" : "rgba(112, 70, 207, 0.12)");
    halo.addColorStop(0.5, palette.dark ? "rgba(139, 92, 246, 0.10)" : "rgba(130, 88, 213, 0.06)");
    halo.addColorStop(1, "transparent");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, width, height);

    // 2. Gyroscopic Armillary Rings (Futuristic Astrolabe)
    const drawArmillaryRing = (tilt: number, color: string, alpha: number, rMult = 1.25) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.0;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      const ringSteps = 60;
      for (let s = 0; s <= ringSteps; s++) {
        const phi = (s / ringSteps) * Math.PI * 2;
        const localX = Math.cos(phi) * rMult;
        const localZ = Math.sin(phi) * rMult;
        const rotY = localX * Math.sin(tilt);
        const rotZ = localZ;
        const rotX = localX * Math.cos(tilt);
        const p = project(rotX, rotY, rotZ);
        if (s === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    };

    drawArmillaryRing(0.42 + Math.sin(time * 0.15) * 0.08, "rgba(6, 182, 212, 0.6)", palette.dark ? 0.35 : 0.2, 1.32);
    drawArmillaryRing(-0.52 + Math.cos(time * 0.18) * 0.08, "rgba(244, 63, 94, 0.6)", palette.dark ? 0.32 : 0.18, 1.26);

    // Equatorial calibration ring with tick marks
    ctx.strokeStyle = "rgba(172, 138, 255, 0.4)";
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = palette.dark ? 0.25 : 0.15;
    ctx.beginPath();
    for (let s = 0; s <= 48; s++) {
      const phi = (s / 48) * Math.PI * 2;
      const p = project(Math.cos(phi) * 1.28, 0, Math.sin(phi) * 1.28);
      if (s === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    // Equatorial degree hashes
    for (let h = 0; h < 24; h++) {
      const phi = (h / 24) * Math.PI * 2;
      const p1 = project(Math.cos(phi) * 1.24, 0, Math.sin(phi) * 1.24);
      const p2 = project(Math.cos(phi) * 1.32, 0, Math.sin(phi) * 1.32);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // 3. Pulsating SoulFlame Center Core
    const centerProj = project(0, 0, 0);
    const corePulse = Math.sin(time * 2.4) * 0.15 + 1.0;
    const coreRadius = Math.max(12, radius * 0.16 * corePulse);
    const coreGrad = ctx.createRadialGradient(
      centerProj.x,
      centerProj.y,
      0,
      centerProj.x,
      centerProj.y,
      coreRadius,
    );
    coreGrad.addColorStop(0, "rgba(255, 248, 225, 0.95)");
    coreGrad.addColorStop(0.35, "rgba(245, 158, 11, 0.85)"); // Gold Flame
    coreGrad.addColorStop(0.7, "rgba(225, 29, 72, 0.5)"); // Crimson
    coreGrad.addColorStop(1, "transparent");

    ctx.globalAlpha = 0.85;
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(centerProj.x, centerProj.y, coreRadius, 0, Math.PI * 2);
    ctx.fill();

    // 4. Volumetric 3D Faceted Stat Crystal Builder
    const renderCrystal = (
      values: number[],
      primaryColor: string,
      accentColor: string,
      isPartner = false,
    ) => {
      const N = values.length;
      const apexY = isPartner ? -0.78 : -0.86;
      const baseApexY = isPartner ? 0.78 : 0.86;

      const topApex = { x: 0, y: apexY, z: 0 };
      const bottomApex = { x: 0, y: baseApexY, z: 0 };

      // Calculate equator vertices based on scores
      const vertices = values.map((score, i) => {
        const theta = (i / N) * Math.PI * 2 - Math.PI / 2;
        const norm = Math.max(0.12, Math.min(1.0, score / 100));
        const r = (isPartner ? 0.44 : 0.46) + norm * (isPartner ? 0.54 : 0.58);
        return {
          x: Math.cos(theta) * r,
          y: 0,
          z: Math.sin(theta) * r,
          score,
          index: i,
        };
      });

      // Construct triangular facets: Top Pyramid & Bottom Pyramid
      interface Facet {
        p0: typeof topApex;
        p1: (typeof vertices)[0];
        p2: (typeof vertices)[0];
        depth: number;
        normalY: number;
      }

      const facets: Facet[] = [];

      for (let i = 0; i < N; i++) {
        const vCurr = vertices[i];
        const vNext = vertices[(i + 1) % N];

        // Top pyramid facet
        const projTop = project(topApex.x, topApex.y, topApex.z);
        const proj0 = project(vCurr.x, vCurr.y, vCurr.z);
        const proj1 = project(vNext.x, vNext.y, vNext.z);
        const avgDepthTop = (projTop.depth + proj0.depth + proj1.depth) / 3;

        facets.push({
          p0: topApex,
          p1: vCurr,
          p2: vNext,
          depth: avgDepthTop,
          normalY: -1,
        });

        // Bottom pyramid facet
        const projBot = project(bottomApex.x, bottomApex.y, bottomApex.z);
        const avgDepthBot = (projBot.depth + proj0.depth + proj1.depth) / 3;
        facets.push({
          p0: bottomApex,
          p1: vCurr,
          p2: vNext,
          depth: avgDepthBot,
          normalY: 1,
        });
      }

      // Sort facets back-to-front (Painter's Algorithm)
      facets.sort((a, b) => b.depth - a.depth);

      // Draw Laser Filaments from center to vertices
      vertices.forEach((v) => {
        const pV = project(v.x, v.y, v.z);
        ctx.strokeStyle = isPartner ? "rgba(6, 182, 212, 0.45)" : "rgba(244, 63, 94, 0.45)";
        ctx.lineWidth = 1.0;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(centerProj.x, centerProj.y);
        ctx.lineTo(pV.x, pV.y);
        ctx.stroke();
      });

      // Draw Facets
      facets.forEach((f) => {
        const p0 = project(f.p0.x, f.p0.y, f.p0.z);
        const p1 = project(f.p1.x, f.p1.y, f.p1.z);
        const p2 = project(f.p2.x, f.p2.y, f.p2.z);

        // Calculate 2D winding / lighting
        const dx1 = p1.x - p0.x, dy1 = p1.y - p0.y;
        const dx2 = p2.x - p0.x, dy2 = p2.y - p0.y;
        const cross = dx1 * dy2 - dy1 * dx2;
        const facing = cross > 0 ? 1 : 0.4;

        // Facet fill
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.closePath();

        const facetAlpha = (isPartner ? 0.16 : 0.24) * facing;
        ctx.fillStyle = isPartner
          ? `rgba(6, 182, 212, ${facetAlpha})`
          : f.normalY < 0
          ? `rgba(225, 29, 72, ${facetAlpha * 1.1})`
          : `rgba(139, 92, 246, ${facetAlpha * 0.9})`;
        ctx.fill();

        // Neon glowing facet edges
        ctx.strokeStyle = isPartner ? "rgba(34, 211, 238, 0.75)" : "rgba(251, 113, 133, 0.75)";
        ctx.lineWidth = isPartner ? 1.2 : 1.5;
        ctx.globalAlpha = Math.max(0.2, 0.7 - f.depth * 0.2);
        ctx.stroke();
      });

      // 5. Interactive Vertex Data Nodes & Badges
      vertices.forEach((v) => {
        const p = project(v.x, v.y, v.z);
        const isSelected = !isPartner && v.index === selected;

        // Node Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, isSelected ? 6.5 : 4, 0, Math.PI * 2);
        ctx.fillStyle = isPartner ? "#22d3ee" : isSelected ? "#38bdf8" : primaryColor;
        ctx.globalAlpha = Math.max(0.5, 0.95 - p.depth * 0.25);
        ctx.fill();

        // Selected Beacon Pulsing Ripple
        if (isSelected) {
          const ripple = Math.sin(time * 5.0) * 4.0 + 13.0;
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, ripple, 0, Math.PI * 2);
          ctx.stroke();

          // Floating Holographic Tag
          const tagText = `${example.dimensions[v.index]?.shortLabel || example.dimensions[v.index]?.label || "Score"}: ${scores[v.index]}%`;
          ctx.font = "bold 11px system-ui, sans-serif";
          const textW = ctx.measureText(tagText).width;
          const tagX = p.x - textW / 2 - 8;
          const tagY = p.y - 28;

          ctx.fillStyle = "rgba(18, 18, 28, 0.9)";
          ctx.strokeStyle = "rgba(56, 189, 248, 0.8)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(tagX, tagY, textW + 16, 20, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#f3f1fa";
          ctx.fillText(tagText, tagX + 8, tagY + 14);
        }
      });
    };

    // Render User's 3D Crystal
    renderCrystal(scores, palette.plum, "#f43f5e", false);

    // Render Partner's 3D Crystal in Compatibility Mode
    if (comparison && partner) {
      renderCrystal(
        partner.dimensions.map((d) => d.score),
        palette.cyan,
        "#22d3ee",
        true,
      );

      // Synergy Overlap Glow
      const synergyPulse = Math.sin(time * 3.0) * 0.15 + 0.85;
      ctx.strokeStyle = "rgba(245, 158, 11, 0.7)";
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.6 * synergyPulse;
      ctx.beginPath();
      ctx.arc(centerProj.x, centerProj.y, radius * 0.42 * synergyPulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  };
  useCanvasScene(canvas, draw, enabled);
  const d = example.dimensions[selected];
  return (
    <div className="profile-playground">
      <div className="orbit-topline">
        <h2 className="font-display">
          {comparison
            ? "Where two worlds meet."
            : "Your patterns, in perspective."}
        </h2>
        <div
          className="orbit-modes"
          role="group"
          aria-label="Explore result previews"
        >
          <button
            type="button"
            aria-pressed={!comparison}
            onClick={() => setComparison(false)}
          >
            Your profile
          </button>
          <button
            type="button"
            aria-pressed={comparison}
            onClick={() => setComparison(!comparison)}
          >
            {comparison ? "Hide partner" : "Compatibility"}
          </button>
        </div>
      </div>
      <div
        className="orbit-stage hero-radar-stage"
        role="group"
        tabIndex={0}
        aria-label="Rotate the example profile"
        aria-describedby={hintId}
        data-yaw={view.yaw.toFixed(2)}
        data-pitch={view.pitch.toFixed(2)}
        onKeyDown={(event) => {
          const offsets: Record<string, [number, number]> = {
            ArrowLeft: [-0.2, 0],
            ArrowRight: [0.2, 0],
            ArrowUp: [0, -0.15],
            ArrowDown: [0, 0.15],
          };
          if (event.key === "Home") {
            event.preventDefault();
            rotate(initialView.yaw, initialView.pitch);
          } else if (offsets[event.key]) {
            event.preventDefault();
            const [x, y] = offsets[event.key];
            rotate(angles.current.yaw + x, angles.current.pitch + y);
          }
        }}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          drag.current = {
            x: event.clientX,
            y: event.clientY,
            ...angles.current,
            id: event.pointerId,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const start = drag.current;
          if (!start || start.id !== event.pointerId) return;
          rotate(
            start.yaw + (event.clientX - start.x) * 0.009,
            start.pitch + (event.clientY - start.y) * 0.007,
          );
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
      >
        <canvas ref={canvas} aria-hidden="true" />
        <svg
          className="orbit-fallback"
          viewBox="0 0 400 350"
          aria-hidden="true"
        >
          {[0, 30, 60, 90, 120, 150].map((angle) => (
            <ellipse
              key={angle}
              cx="200"
              cy="175"
              rx="120"
              ry="54"
              transform={`rotate(${angle} 200 175)`}
              fill="none"
              stroke="var(--accent-plum)"
              opacity=".65"
            />
          ))}
        </svg>
        <span className="orbit-drag-hint" id={hintId}>
          <Hand size={14} aria-hidden="true" />
          Drag to spin · Arrow keys to rotate
        </span>
      </div>
      <div
        className="orbit-controls"
        role="group"
        aria-label="Profile illustration controls"
      >
        <div>
          <button
            type="button"
            onClick={() =>
              rotate(angles.current.yaw - 0.35, angles.current.pitch)
            }
            aria-label="Rotate left"
          >
            <ArrowLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => rotate(initialView.yaw, initialView.pitch)}
            aria-label="Reset view"
          >
            <RotateCcw size={16} />
          </button>
          <button
            type="button"
            onClick={() =>
              rotate(angles.current.yaw + 0.35, angles.current.pitch)
            }
            aria-label="Rotate right"
          >
            <ArrowRight size={17} />
          </button>
        </div>
        <button
          type="button"
          aria-pressed={enabled}
          onClick={() =>
            onMotionChange ? onMotionChange(!enabled) : setLocalMoving(!enabled)
          }
        >
          {enabled ? <Pause size={14} /> : <Play size={14} />}
          {enabled ? "Pause motion" : "Turn motion on"}
        </button>
      </div>
      <div
        className="orbit-categories"
        role="group"
        aria-label="Inspect example categories"
      >
        {example.dimensions.map((dim, index) => (
          <button
            key={dim.key}
            type="button"
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            {dim.shortLabel || dim.label}
            <span>{scores[index]}%</span>
          </button>
        ))}
      </div>
      <label className="orbit-score-control">
        <span>
          Try a different {d.shortLabel?.toLowerCase() || d.label.toLowerCase()}{" "}
          score <output>{scores[selected]}%</output>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={scores[selected]}
          aria-label="Example category score"
          onChange={(event) =>
            setScores((values) =>
              values.map((value, index) =>
                index === selected ? Number(event.target.value) : value,
              ),
            )
          }
        />
      </label>
      <p className="orbit-example-note">
        An interactive example. Your private profile comes from your answers.
      </p>
    </div>
  );
}
